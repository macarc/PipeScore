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
//
//  A container for multiple Bars placed vertically, i.e. in harmony.
//  This just worries about barlines, bar size, and time signature -
//  actual notes are left to the .bars()

import type { IBar } from '../Bar';
import type { Barline } from '../Barline';
import type { INote } from '../Note';
import type { Playback } from '../Playback';
import type { SavedMeasure } from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import type { ID } from '../global/id';

export abstract class IMeasure {
  abstract fixedWidth: number | 'auto';
  abstract toJSON(): SavedMeasure;
  // Check any bars or notes of measure have the ID
  abstract containsID(id: ID): boolean;
  abstract isAnacrusis(): boolean;
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

function getMeasureBars(measures: IMeasure[]): IBar[][] {
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

export function nextBar(id: ID, measures: IMeasure[]) {
  for (let i = 0; i < measures.length - 1; i++) {
    const bars = measures[i].bars();
    for (let j = 0; j < bars.length; j++) {
      if (bars[j].hasID(id) || bars[j].containsNoteWithID(id)) {
        if (measures[i + 1] && measures[i + 1].bars()[j]) {
          return measures[i + 1].bars()[j];
        }
        return null;
      }
    }
  }
  return null;
}

export function previousBar(id: ID, measures: IMeasure[]) {
  for (let i = 1; i < measures.length; i++) {
    const bars = measures[i].bars();
    for (let j = 0; j < bars.length; j++) {
      if (bars[j].hasID(id) || bars[j].containsNoteWithID(id)) {
        if (measures[i - 1] && measures[i - 1].bars()[j]) {
          return measures[i - 1].bars()[j];
        }
        return null;
      }
    }
  }
  return null;
}

export function nextNote(id: ID, measures: IMeasure[]) {
  let lastWasIt = false;
  for (const part of getMeasureBars(measures)) {
    for (const bar of part) {
      if (bar.hasID(id)) {
        lastWasIt = true;
        // Skip over notes in this bar
        continue;
      }
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
  for (const part of getMeasureBars(measures)) {
    for (const bar of part) {
      if (bar.hasID(id)) return prev;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (note.hasID(id)) return prev;
        prev = note;
      }
    }
  }
  return prev;
}
