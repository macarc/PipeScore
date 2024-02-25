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

import { IBar } from '.';
import { Barline } from '../Barline';
import {
  INote,
  ITriplet,
  NoteOrTriplet,
  flattenTriplets,
  lastNote,
  noteToJSON,
} from '../Note';
import { noteFromJSON, notesToTriplet } from '../Note/impl';
import { Playback, PlaybackNote, PlaybackObject, PlaybackRepeat } from '../Playback';
import { SavedBar } from '../SavedModel';
import { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { ID, genId } from '../global/id';
import { last } from '../global/utils';

export class Bar extends IBar {
  fixedWidth: number | 'auto' = 'auto';

  private ts: ITimeSignature;
  private _notes: NoteOrTriplet[];
  private frontBarline: Barline;
  private backBarline: Barline;
  private _isAnacrusis: boolean;
  private previewNote: INote | null = null;

  constructor(timeSignature: ITimeSignature | undefined, isAnacrusis = false) {
    super(genId());
    this.ts = (timeSignature || new TimeSignature()).copy();
    this._notes = [];
    this._isAnacrusis = isAnacrusis;
    this.frontBarline = Barline.normal;
    this.backBarline = Barline.normal;
  }

  static fromJSON(o: SavedBar) {
    const b = new Bar(TimeSignature.fromJSON(o.timeSignature), o.isAnacrusis);
    b._notes = o.notes.map(noteFromJSON);
    b.id = o.id;
    b.fixedWidth = o.width === undefined ? 'auto' : o.width;
    b.backBarline = Barline.fromJSON(o.backBarline);
    b.frontBarline = Barline.fromJSON(o.frontBarline);
    return b;
  }

  toJSON(): SavedBar {
    return {
      id: this.id,
      isAnacrusis: this._isAnacrusis,
      notes: this.nonPreviewNotes().map((n) => noteToJSON(n)),
      backBarline: this.backBarline.toJSON(),
      frontBarline: this.frontBarline.toJSON(),
      timeSignature: this.ts.toJSON(),
      width: this.fixedWidth,
    };
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
      } else this._notes.push(this.previewNote);
    }
  }

  hasPreview() {
    return this.previewNote !== null;
  }

  makePreviewReal(notes: INote[]) {
    this.previewNote?.makeUnPreview().makeCorrectTie(notes);
    this.previewNote = null;
  }

  removePreview() {
    if (this.previewNote)
      this._notes.splice(this._notes.indexOf(this.previewNote), 1);
    this.previewNote = null;
  }

  preview() {
    return this.previewNote;
  }

  numberOfNotes() {
    return this._notes.length;
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

  notes(): INote[] {
    return flattenTriplets(this._notes);
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

  includesNote(id: ID) {
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

  nonPreviewNotes() {
    return this.notesAndTriplets().filter((note) => note !== this.previewNote);
  }

  play(previous: Bar | null): Playback[] {
    const start = this.frontBarline.isRepeat() ? [new PlaybackRepeat('start')] : [];
    const end = this.backBarline.isRepeat() ? [new PlaybackRepeat('end')] : [];
    const beatRatio = 1 / this.timeSignature().crotchetsPerBeat();
    return [
      ...start,
      new PlaybackObject('start', this.id),
      ...this._notes.flatMap((note, i) =>
        note
          .play(
            i === 0
              ? previous?.lastPitch() || null
              : lastNote(this._notes[i - 1]).pitch()
          )
          .map((p) =>
            p.type === 'note'
              ? new PlaybackNote(p.pitch, p.tied, p.duration * beatRatio)
              : p
          )
      ),
      new PlaybackObject('end', this.id),
      ...end,
    ];
  }
}
