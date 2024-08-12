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

import type { Barline } from '../Barline';
import type { INote, ITriplet, NoteOrTriplet } from '../Note';
import type { Playback } from '../Playback';
import type { Previews } from '../Preview/previews';
import type { SavedBar } from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import { type ID, Item } from '../global/id';
import type { Pitch } from '../global/pitch';
import { last } from '../global/utils';

// A single bar (whereas IBar contains multiple bars vertically if there are harmony parts)
// If you have an idea for a better name tell me!
export abstract class IBar implements Previews<INote> {
  abstract measure(): IMeasure;
  abstract containsNoteWithId(id: ID): boolean;
  abstract notes(): INote[];
  abstract notesAndTriplets(): NoteOrTriplet[];
  abstract nonPreviewNotes(): NoteOrTriplet[];
  abstract insertNote(noteBefore: INote | null, note: INote): void;
  abstract appendNotes(note: NoteOrTriplet[]): void;
  abstract deleteNote(note: INote): void;
  abstract clearNotes(): void;
  abstract lastPitch(): Pitch | null;
  abstract lastNote(): INote | null;
  abstract previousNote(note: INote): NoteOrTriplet | null;
  abstract makeTriplet(first: INote, second: INote, third: INote): void;
  abstract unmakeTriplet(tr: ITriplet): void;
  abstract setPreview(
    note: INote,
    noteBefore: INote | null,
    noteAfter: INote | null
  ): void;
  abstract hasPreview(): boolean;
  abstract makePreviewReal(notes: INote[]): void;
  abstract removePreview(): void;
  abstract preview(inPart: number): INote | null;
};

export abstract class IMeasure extends Item {
  abstract fixedWidth: number | 'auto';
  // Check if measure or any notes of measure have this ID
  abstract containsID(id: ID): boolean;
  abstract isAnacrusis(): boolean;
  abstract toJSON(): SavedBar;
  abstract bars(): IBar[];
  abstract startBarline(): Barline;
  abstract endBarline(): Barline;
  abstract setBarline(position: 'start' | 'end', barline: Barline): void;
  abstract setNumberOfParts(n: number): void;
  abstract timeSignature(): ITimeSignature;
  abstract setTimeSignature(ts: ITimeSignature): void;
  abstract adjustWidth(ratio: number): void;
  abstract play(previous: IMeasure | null): Playback[];
}

// Replaces timeSignature with newTimeSignature.
// It will change the time signature on all bars from
// timeSignature onwards, until it hits a bar where
// the time signature is different
export function setTimeSignatureFrom(
  timeSignature: ITimeSignature,
  newTimeSignature: ITimeSignature,
  measures: IMeasure[]
) {
  let atTimeSignature = false;
  for (const measure of measures) {
    if (measure.timeSignature() === timeSignature) {
      measure.setTimeSignature(newTimeSignature);
      atTimeSignature = true;
      continue;
    }
    if (atTimeSignature) {
      if (measure.timeSignature().equals(timeSignature)) {
        measure.setTimeSignature(newTimeSignature);
      } else {
        break;
      }
    }
  }
}

export function getMeasureBars(measures: IMeasure[]): IBar[][] {
  const bars: IBar[][] = [];
  for (const measure of measures) {
    const measureBars = measure.bars();
    for (let i = 0; i < measureBars.length; i++) {
      if (i >= bars.length) {
        bars.push([]);
      }
      bars[i].push(measureBars[i]);
    }
  }
  return bars;
}

export function nextMeasure(id: ID, measures: IMeasure[]) {
  for (let i = 0; i < measures.length - 1; i++) {
    if (measures[i].containsID(id)) return measures[i + 1];
  }
  return null;
}

export function previousMeasure(id: ID, measures: IMeasure[]) {
  for (let i = 1; i < measures.length; i++) {
    if (measures[i].containsID(id)) return measures[i - 1];
  }
  return last(measures);
}

export function nextNote(id: ID, measures: IMeasure[]) {
  let lastWasIt = false;
  for (const bars of getMeasureBars(measures)) {
    for (const bar of bars) {
      if (bar.measure().id === id) lastWasIt = true;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (lastWasIt) return note;
        if (note.hasID(id)) lastWasIt = true;
      }
    }
  }
  return null;
}

export function previousNote(id: ID, measures: IMeasure[]) {
  let prev: INote | null = null;
  for (const bars of getMeasureBars(measures)) {
    for (const bar of bars) {
      if (bar.measure().id === id) return prev;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (note.hasID(id)) return prev;
        prev = note;
      }
    }
  }
  return prev;
}
