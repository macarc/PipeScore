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

import {
  Note,
  Triplet,
  flattenTriplets,
  lastNote,
  noteFromJSON,
  noteToJSON,
  notesToTriplet,
} from '../Note';
import {
  Playback,
  PlaybackNote,
  PlaybackObject,
  PlaybackRepeat,
} from '../Playback';
import { Previews } from '../Preview/previews';
import { SavedBar } from '../SavedModel';
import { TimeSignature } from '../TimeSignature';
import { ID, Item, genId } from '../global/id';
import { last } from '../global/utils';
import { Barline } from './barline';

export class Bar extends Item implements Previews<Note> {
  private ts: TimeSignature;
  private _notes: (Note | Triplet)[];

  public frontBarline: Barline;
  public backBarline: Barline;
  public isAnacrusis: boolean;
  public fixedWidth: number | 'auto' = 'auto';

  private previewNote: Note | null = null;

  constructor(timeSignature = new TimeSignature(), isAnacrusis = false) {
    super(genId());
    this.ts = timeSignature.copy();
    this._notes = [];
    this.isAnacrusis = isAnacrusis;
    this.frontBarline = Barline.normal;
    this.backBarline = Barline.normal;
  }

  public static fromJSON(o: SavedBar) {
    const b = new Bar(TimeSignature.fromJSON(o.timeSignature), o.isAnacrusis);
    b._notes = o.notes.map(noteFromJSON);
    b.id = o.id;
    b.fixedWidth = o.width === undefined ? 'auto' : o.width;
    b.backBarline = Barline.fromJSON(o.backBarline);
    b.frontBarline = Barline.fromJSON(o.frontBarline);
    return b;
  }

  public toJSON(): SavedBar {
    return {
      id: this.id,
      isAnacrusis: this.isAnacrusis,
      notes: this.nonPreviewNotes().map((n) => noteToJSON(n)),
      backBarline: this.backBarline.toJSON(),
      frontBarline: this.frontBarline.toJSON(),
      timeSignature: this.ts.toJSON(),
      width: this.fixedWidth,
    };
  }

  // Replaces timeSignature with newTimeSignature.
  // It will change the time signature on all bars from
  // timeSignature onwards, until it hits a bar where
  // the time signature is different
  public static setTimeSignatureFrom(
    timeSignature: TimeSignature,
    newTimeSignature: TimeSignature,
    bars: Bar[]
  ) {
    let atTimeSignature = false;
    for (const bar of bars) {
      if (bar.timeSignature() === timeSignature) {
        bar.ts = newTimeSignature;
        atTimeSignature = true;
        continue;
      }
      if (atTimeSignature) {
        if (bar.ts.equals(timeSignature)) {
          bar.ts = newTimeSignature.copy();
        } else {
          break;
        }
      }
    }
  }

  public static nextBar(id: ID, bars: Bar[]) {
    for (let i = 0; i < bars.length - 1; i++) {
      if (bars[i].hasID(id)) return bars[i + 1];
      for (const note of bars[i].notesAndTriplets()) {
        if (note.hasID(id)) return bars[i + 1];
      }
    }
    return null;
  }

  public static previousBar(id: ID, bars: Bar[]) {
    for (let i = 1; i < bars.length; i++) {
      if (bars[i].hasID(id)) return bars[i - 1];
      for (const note of bars[i].notesAndTriplets()) {
        if (note.hasID(id)) return bars[i - 1];
      }
    }
    return last(bars);
  }

  public static nextNote(id: ID, bars: Bar[]) {
    let lastWasIt = false;
    for (const bar of bars) {
      if (bar.hasID(id)) lastWasIt = true;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (lastWasIt) return note;
        if (note.hasID(id)) lastWasIt = true;
      }
    }
    return null;
  }

  public static previousNote(id: ID, bars: Bar[]) {
    let prev: Note | null = null;
    for (const bar of bars) {
      if (bar.hasID(id)) return prev;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (note.hasID(id)) return prev;
        prev = note;
      }
    }
    return prev;
  }

  // Puts all the notes in the notes array into the score with the correct bar breaks
  // Does *not* change ids, e.t.c. so notes should already be unique with notes on score
  public static pasteNotes(
    notes: (Note | Triplet | 'bar-break')[],
    start: Bar,
    id: ID,
    bars: Bar[]
  ) {
    let startedPasting = false;
    let onFirst = false;

    for (const bar of bars) {
      if (bar.hasID(start.id)) {
        startedPasting = true;
        onFirst = true;
        if (bar.hasID(id)) bar._notes = [];
      }
      if (startedPasting) {
        // Only delete the current notes if we aren't on the first bar
        // since we should append to the first, then replace for the rest
        if (!onFirst) bar._notes = [];
        else onFirst = false;

        let currentPastingNote = notes.shift();
        while (currentPastingNote && currentPastingNote !== 'bar-break') {
          bar._notes.push(currentPastingNote);
          currentPastingNote = notes.shift();
        }

        if (notes.length === 0) {
          return;
        }
      }
    }
  }

  public startBarline(barline: Barline) {
    return this.frontBarline === barline;
  }

  public endBarline(barline: Barline) {
    return this.backBarline === barline;
  }

  public setPreview(note: Note, _: Note | null, noteAfter: Note | null) {
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

  public hasPreview() {
    return this.previewNote !== null;
  }

  public makePreviewReal(notes: Note[]) {
    this.previewNote?.makeUnPreview().makeCorrectTie(notes);
    this.previewNote = null;
  }

  public removePreview() {
    if (this.previewNote)
      this._notes.splice(this._notes.indexOf(this.previewNote), 1);
    this.previewNote = null;
  }

  public preview() {
    return this.previewNote;
  }

  public numberOfNotes() {
    return this._notes.length;
  }

  public lastPitch() {
    return this.lastNote()?.pitch() || null;
  }

  public lastNote() {
    return last(this.notes());
  }

  public previousNote(note: Note) {
    return this._notes[this._notes.indexOf(note) - 1] || null;
  }

  public notes(): Note[] {
    return flattenTriplets(this._notes);
  }

  public insertNote(noteBefore: Note | null, note: Note) {
    let ind = noteBefore
      ? this._notes.findIndex((note) => note.hasID(noteBefore.id)) + 1
      : 0;
    if (noteBefore?.isPreview() && ind > 0) ind -= 1;

    this._notes.splice(ind, 0, note);
  }

  public deleteNote(note: Note) {
    const ind = this._notes.findIndex((n) => n.hasID(note.id));
    const noteToDelete = this._notes[ind];
    if (noteToDelete instanceof Triplet) {
      this.unmakeTriplet(noteToDelete);
      this.deleteNote(note);
    } else {
      this._notes.splice(ind, 1);
    }
  }

  public makeTriplet(first: Note, second: Note, third: Note) {
    this._notes.splice(
      this._notes.indexOf(first),
      3,
      notesToTriplet(first, second, third)
    );
  }

  public unmakeTriplet(tr: Triplet) {
    this._notes.splice(this._notes.indexOf(tr), 1, ...tr.tripletSingleNotes());
  }

  public includesNote(id: ID) {
    for (const note of this.notesAndTriplets()) {
      if (note.hasID(id)) {
        return true;
      }
    }
    return false;
  }

  public notesAndTriplets() {
    return this._notes;
  }

  public timeSignature() {
    return this.ts;
  }

  public adjustWidth(ratio: number) {
    this.fixedWidth =
      this.fixedWidth === 'auto' ? 'auto' : this.fixedWidth * ratio;
  }

  public setBarline(position: 'start' | 'end', barline: Barline) {
    if (position === 'start') {
      this.frontBarline = barline;
    } else {
      this.backBarline = barline;
    }
  }

  public nonPreviewNotes() {
    return this.notesAndTriplets().filter((note) => note !== this.previewNote);
  }

  public play(previous: Bar | null): Playback[] {
    const start = this.frontBarline.isRepeat()
      ? [new PlaybackRepeat('start')]
      : [];
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
