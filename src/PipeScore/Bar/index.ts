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

export abstract class IBar extends Item implements Previews<INote> {
  abstract fixedWidth: number | 'auto';
  abstract isAnacrusis(): boolean;
  abstract toJSON(): SavedBar;
  abstract startBarline(): Barline;
  abstract endBarline(): Barline;
  abstract setPreview(
    note: INote,
    noteBefore: INote | null,
    noteAfter: INote | null
  ): void;
  abstract hasPreview(): boolean;
  abstract makePreviewReal(notes: INote[]): void;
  abstract removePreview(): void;
  abstract preview(): INote | null;
  abstract numberOfNotes(): number;
  abstract lastPitch(): Pitch | null;
  abstract lastNote(): INote | null;
  abstract previousNote(note: INote): NoteOrTriplet | null;
  abstract notesAndTriplets(): NoteOrTriplet[];
  abstract notes(): INote[];
  abstract nonPreviewNotes(): NoteOrTriplet[];
  abstract insertNote(noteBefore: INote | null, note: INote): void;
  abstract appendNotes(note: NoteOrTriplet[]): void;
  abstract deleteNote(note: INote): void;
  abstract clearNotes(): void;
  abstract makeTriplet(first: INote, second: INote, third: INote): void;
  abstract unmakeTriplet(tr: ITriplet): void;
  abstract includesNote(id: ID): boolean;
  abstract timeSignature(): ITimeSignature;
  abstract setTimeSignature(ts: ITimeSignature): void;
  abstract adjustWidth(ratio: number): void;
  abstract setBarline(position: 'start' | 'end', barline: Barline): void;
  abstract play(previous: IBar | null): Playback[];
}

// Replaces timeSignature with newTimeSignature.
// It will change the time signature on all bars from
// timeSignature onwards, until it hits a bar where
// the time signature is different
export function setTimeSignatureFrom(
  timeSignature: ITimeSignature,
  newTimeSignature: ITimeSignature,
  bars: IBar[]
) {
  let atTimeSignature = false;
  for (const bar of bars) {
    if (bar.timeSignature() === timeSignature) {
      bar.setTimeSignature(newTimeSignature);
      atTimeSignature = true;
      continue;
    }
    if (atTimeSignature) {
      if (bar.timeSignature().equals(timeSignature)) {
        bar.setTimeSignature(newTimeSignature);
      } else {
        break;
      }
    }
  }
}

export function nextBar(id: ID, bars: IBar[]) {
  for (let i = 0; i < bars.length - 1; i++) {
    if (bars[i].hasID(id)) return bars[i + 1];
    for (const note of bars[i].notesAndTriplets()) {
      if (note.hasID(id)) return bars[i + 1];
    }
  }
  return null;
}

export function previousBar(id: ID, bars: IBar[]) {
  for (let i = 1; i < bars.length; i++) {
    if (bars[i].hasID(id)) return bars[i - 1];
    for (const note of bars[i].notesAndTriplets()) {
      if (note.hasID(id)) return bars[i - 1];
    }
  }
  return last(bars);
}

export function nextNote(id: ID, bars: IBar[]) {
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

export function previousNote(id: ID, bars: IBar[]) {
  let prev: INote | null = null;
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
