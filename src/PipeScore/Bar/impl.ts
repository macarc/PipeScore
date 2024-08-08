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
  type INote,
  ITriplet,
  type NoteOrTriplet,
  flattenTriplets,
  lastNote,
  noteToJSON,
} from '../Note';
import { noteFromJSON, notesToTriplet } from '../Note/impl';
import {
  type Playback,
  PlaybackNote,
  PlaybackObject,
  PlaybackRepeat,
} from '../Playback';
import type { SavedBar } from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { type ID, genId } from '../global/id';
import { last } from '../global/utils';

export class Bar extends IBar {
  fixedWidth: number | 'auto' = 'auto';

  private ts: ITimeSignature;
  private _parts: NoteOrTriplet[][];
  private frontBarline: Barline;
  private backBarline: Barline;
  private _isAnacrusis: boolean;
  private previewNote: INote | null = null;

  constructor(timeSignature: ITimeSignature | undefined, isAnacrusis = false) {
    super(genId());
    this.ts = (timeSignature || new TimeSignature()).copy();
    this._parts = [[]];
    this._isAnacrusis = isAnacrusis;
    this.frontBarline = Barline.normal;
    this.backBarline = Barline.normal;
  }

  static fromJSON(o: SavedBar) {
    const b = new Bar(TimeSignature.fromJSON(o.timeSignature), o.isAnacrusis);
    b._parts = [o.notes.map(noteFromJSON)];
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
      this._parts[0].splice(this._parts[0].indexOf(noteAfter), 1, note);
      this.previewNote = note;
    } else {
      if (this.previewNote) this.removePreview();
      this.previewNote = note;

      if (noteAfter) {
        let index = this._parts[0].indexOf(noteAfter);
        // If it is a note within a triplet, we need to do this
        if (index === -1)
          index = this._parts[0].findIndex((note) => note.hasID(noteAfter.id));
        this._parts[0].splice(index, 0, this.previewNote);
      } else {
        this._parts[0].push(this.previewNote);
      }
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
    if (this.previewNote) {
      this._parts[0].splice(this._parts[0].indexOf(this.previewNote), 1);
    }
    this.previewNote = null;
  }

  preview() {
    return this.previewNote;
  }

  setNumberOfParts(n: number): void {
    // Add more parts n > parts.length
    while (this._parts.length < n) {
      this._parts.push([]);
    }
    // Remove parts if n < parts.length
    this._parts.splice(n);
  }

  parts(): INote[][] {
    return this._parts.map(flattenTriplets);
  }

  numberOfNotes() {
    return this._parts[0].length;
  }

  lastPitch() {
    return this.lastNote()?.pitch() || null;
  }

  lastNote() {
    return last(this.notes());
  }

  previousNote(note: INote) {
    return this._parts[0][this._parts[0].indexOf(note) - 1] || null;
  }

  notes(): INote[] {
    return flattenTriplets(this._parts[0]);
  }

  insertNote(noteBefore: INote | null, note: INote) {
    let ind = noteBefore
      ? this._parts[0].findIndex((note) => note.hasID(noteBefore.id)) + 1
      : 0;
    if (noteBefore?.isPreview() && ind > 0) ind -= 1;

    this._parts[0].splice(ind, 0, note);
  }

  appendNotes(note: INote[]): void {
    this._parts[0] = this._parts[0].concat(note);
  }

  deleteNote(note: INote) {
    const ind = this._parts[0].findIndex((n) => n.hasID(note.id));
    const noteToDelete = this._parts[0][ind];
    if (noteToDelete instanceof ITriplet) {
      this.unmakeTriplet(noteToDelete);
      this.deleteNote(note);
    } else {
      this._parts[0].splice(ind, 1);
    }
  }

  clearNotes() {
    this._parts[0] = [];
  }

  makeTriplet(first: INote, second: INote, third: INote) {
    this._parts[0].splice(
      this._parts[0].indexOf(first),
      3,
      notesToTriplet(first, second, third)
    );
  }

  unmakeTriplet(tr: ITriplet) {
    this._parts[0].splice(this._parts[0].indexOf(tr), 1, ...tr.tripletSingleNotes());
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
    return this._parts[0];
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
      ...this._parts[0].flatMap((note, i) =>
        note
          .play(
            i === 0
              ? previous?.lastPitch() || null
              : lastNote(this._parts[0][i - 1]).pitch()
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
