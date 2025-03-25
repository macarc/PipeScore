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
import type { IMeasure } from '../Measure';
import {
  type INote,
  ITriplet,
  type NoteOrTriplet,
  flattenTriplets,
  lastNote,
  noteToJSON,
} from '../Note';
import { noteFromJSON, notesToTriplet } from '../Note/impl';
import { type PlaybackItem, playbackNote, playbackObject } from '../Playback';
import type { SavedBar } from '../SavedModel';
import { type ID, genID } from '../global/id';
import { last } from '../global/utils';

export class Bar extends IBar {
  private _notes: NoteOrTriplet[];
  private _measure: IMeasure;
  private previewNote: INote | null = null;

  constructor(measure: IMeasure) {
    super(genID());
    this._measure = measure;
    this._notes = [];
  }

  static withNotes(measure: IMeasure, notes: NoteOrTriplet[]) {
    const part = new Bar(measure);
    part._notes = notes;
    return part;
  }

  static fromJSON(bar: SavedBar, measure: IMeasure): Bar {
    const b = new Bar(measure);
    b._notes = bar.notes.map(noteFromJSON);
    b.id = bar.id;
    return b;
  }

  toJSON(): SavedBar {
    return {
      id: this.id,
      notes: this._notes.map(noteToJSON),
    };
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

  play(previous: Bar | null): PlaybackItem[] {
    const beatRatio = 1 / this.measure().timeSignature().crotchetsPerBeat();
    return playbackObject(
      this.id,
      this.notesAndTriplets().flatMap((note, i) =>
        note
          .play(
            i === 0
              ? previous?.lastPitch() || null
              : lastNote(this.notesAndTriplets()[i - 1]).pitch()
          )
          .map((p) =>
            p.type === 'note'
              ? playbackNote(p.pitch, p.duration * beatRatio, p.tied)
              : p
          )
      )
    );
  }
}
