//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { IBar, IMeasure } from '.';
import { Barline } from '../Barline';
import {
  type INote,
  ITriplet,
  type NoteOrTriplet,
  flattenTriplets,
  lastNote,
  noteToJSON,
} from '../Note';
import { Note, noteFromJSON, notesToTriplet } from '../Note/impl';
import { Duration, NoteLength } from '../Note/notelength';
import {
  type Playback,
  PlaybackNote,
  PlaybackObject,
  PlaybackRepeat,
} from '../Playback';
import type { SavedBar } from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { type ID, genID } from '../global/id';
import { Pitch } from '../global/pitch';
import { last } from '../global/utils';

class Bar extends IBar {
  private _notes: NoteOrTriplet[];
  // TODO : MAKE SURE THESE ARE UPDATED WHEN COPYING BARS!!!
  private _measure: IMeasure;
  private previewNote: INote | null = null;

  constructor(measure: IMeasure) {
    super(genID());
    this._measure = measure;
    this._notes = [new Note(Pitch.A, new NoteLength(Duration.Crotchet))];
  }

  static withNotes(measure: IMeasure, notes: NoteOrTriplet[]) {
    const part = new Bar(measure);
    part._notes = notes;
    return part;
  }

  measure(): IMeasure {
    return this._measure;
  }

  harmonyIndex(): number {
    return this._measure.bars().indexOf(this);
  }

  setPreview(note: INote, _: INote | null, noteAfter: INote | null) {
    if (noteAfter?.isPreview()) {
      this._notes.splice(this._notes.indexOf(noteAfter), 1, note);
      this.previewNote = note;
    } else {
      if (this.previewNote) this.removePreview();
      this.previewNote = note;

      if (noteAfter) {
        let index = this._notes.indexOf(noteAfter);
        // If it is a note within a triplet, we need to do this
        if (index === -1)
          index = this._notes.findIndex((note) => note.hasID(noteAfter.id));
        this._notes.splice(index, 0, this.previewNote);
      } else {
        this._notes.push(this.previewNote);
      }
    }
  }

  hasPreview() {
    return this.previewNote !== null;
  }

  makePreviewReal(notes: INote[][]) {
    this.previewNote?.makeUnPreview().makeCorrectTie(notes);
    this.previewNote = null;
  }

  removePreview() {
    if (this.previewNote) {
      this._notes.splice(this._notes.indexOf(this.previewNote), 1);
    }
    this.previewNote = null;
  }

  preview() {
    if (this.previewNote && this.notes().indexOf(this.previewNote) !== -1) {
      return this.previewNote;
    }
    return null;
  }

  lastPitch() {
    return this.lastNote()?.pitch() || null;
  }

  lastNote() {
    return last(this.notes());
  }

  previousNote(note: INote) {
    return this._notes[this._notes.indexOf(note) - 1] || null;
  }

  insertNote(noteBefore: INote | null, note: INote) {
    let ind = noteBefore
      ? this._notes.findIndex((note) => note.hasID(noteBefore.id)) + 1
      : 0;
    if (noteBefore?.isPreview() && ind > 0) ind -= 1;

    this._notes.splice(ind, 0, note);
  }

  appendNotes(note: INote[]): void {
    this._notes = this._notes.concat(note);
  }

  deleteNote(note: INote) {
    const ind = this._notes.findIndex((n) => n.hasID(note.id));
    const noteToDelete = this._notes[ind];
    if (noteToDelete instanceof ITriplet) {
      this.unmakeTriplet(noteToDelete);
      this.deleteNote(note);
    } else {
      this._notes.splice(ind, 1);
    }
  }

  clearNotes() {
    this._notes = [];
  }

  makeTriplet(first: INote, second: INote, third: INote) {
    this._notes.splice(
      this._notes.indexOf(first),
      3,
      notesToTriplet(first, second, third)
    );
  }

  unmakeTriplet(tr: ITriplet) {
    this._notes.splice(this._notes.indexOf(tr), 1, ...tr.tripletSingleNotes());
  }

  containsNoteWithID(id: ID) {
    for (const note of this.notesAndTriplets()) {
      if (note.hasID(id)) {
        return true;
      }
    }
    return false;
  }

  notesAndTriplets() {
    return this._notes;
  }

  notes(): INote[] {
    return flattenTriplets(this._notes);
  }

  nonPreviewNotes() {
    return this._notes.filter((note) => note !== this.previewNote);
  }
}

export class Measure extends IMeasure {
  fixedWidth: number | 'auto' = 'auto';

  private ts: ITimeSignature;
  private _bars: IBar[];
  private frontBarline: Barline;
  private backBarline: Barline;
  private _isAnacrusis: boolean;

  constructor(timeSignature: ITimeSignature | undefined, isAnacrusis = false) {
    super();
    this.ts = (timeSignature || new TimeSignature()).copy();
    this._bars = [new Bar(this), new Bar(this)];
    this._isAnacrusis = isAnacrusis;
    this.frontBarline = Barline.normal;
    this.backBarline = Barline.normal;
  }

  static fromJSON(o: SavedBar) {
    const m = new Measure(TimeSignature.fromJSON(o.timeSignature), o.isAnacrusis);
    m.fixedWidth = o.width === undefined ? 'auto' : o.width;
    m.backBarline = Barline.fromJSON(o.backBarline);
    m.frontBarline = Barline.fromJSON(o.frontBarline);

    // TODO : actually save bars (with ids!)
    // TODO : BREAKING CHANGE - make sure that IDs are moved from measure
    //        to first bar, if in the old format
    m._bars = [Bar.withNotes(m, o.notes.map(noteFromJSON))];
    return m;
  }

  toJSON(): SavedBar {
    return {
      id: 0,
      isAnacrusis: this._isAnacrusis,
      notes: this.bars()[0]
        .notesAndTriplets()
        .map((n) => noteToJSON(n)),
      backBarline: this.backBarline.toJSON(),
      frontBarline: this.frontBarline.toJSON(),
      timeSignature: this.ts.toJSON(),
      width: this.fixedWidth,
    };
  }

  containsID(id: ID): boolean {
    return this.bars().some((part) => part.hasID(id) || part.containsNoteWithID(id));
  }

  isAnacrusis(): boolean {
    return this._isAnacrusis;
  }

  startBarline(): Barline {
    return this.frontBarline;
  }

  endBarline(): Barline {
    return this.backBarline;
  }

  setNumberOfParts(n: number): void {
    // Add more parts n > parts.length
    while (this._bars.length < n) {
      this._bars.push(new Bar(this));
    }
    // Remove parts if n < parts.length
    this._bars.splice(n);
  }

  bars(): IBar[] {
    return this._bars;
  }

  timeSignature() {
    return this.ts;
  }

  setTimeSignature(ts: ITimeSignature): void {
    this.ts = ts.copy();
  }

  adjustWidth(ratio: number) {
    this.fixedWidth = this.fixedWidth === 'auto' ? 'auto' : this.fixedWidth * ratio;
  }

  setBarline(position: 'start' | 'end', barline: Barline) {
    if (position === 'start') {
      this.frontBarline = barline;
    } else {
      this.backBarline = barline;
    }
  }

  play(previous: Measure | null): Playback[] {
    const start = this.frontBarline.isRepeat() ? [new PlaybackRepeat('start')] : [];
    const end = this.backBarline.isRepeat() ? [new PlaybackRepeat('end')] : [];
    const beatRatio = 1 / this.timeSignature().crotchetsPerBeat();
    return [
      ...start,
      new PlaybackObject('start', this._bars[0].id),
      ...this._bars[0]
        .notesAndTriplets()
        .flatMap((note, i) =>
          note
            .play(
              i === 0
                ? previous?.bars()[0].lastPitch() || null
                : lastNote(this._bars[0].notesAndTriplets()[i - 1]).pitch()
            )
            .map((p) =>
              p.type === 'note'
                ? new PlaybackNote(p.pitch, p.tied, p.duration * beatRatio)
                : p
            )
        ),
      new PlaybackObject('end', this._bars[0].id),
      ...end,
    ];
  }
}
