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

import type { ID } from '../global/id';
import type { Pitch } from '../global/pitch';
import { sum } from '../global/utils';

export class PlaybackObject {
  type: 'object-start' | 'object-end';
  id: ID;

  constructor(position: 'start' | 'end', id: ID) {
    this.type = position === 'start' ? 'object-start' : 'object-end';
    this.id = id;
  }
}

export class PlaybackNote {
  type = 'note' as const;
  pitch: Pitch;
  tied: boolean;
  duration: number;

  constructor(pitch: Pitch, tied: boolean, duration: number) {
    this.pitch = pitch;
    this.tied = tied;
    this.duration = duration;
  }
}

export class PlaybackGracenote {
  type = 'gracenote' as const;
  pitch: Pitch;

  constructor(pitch: Pitch) {
    this.pitch = pitch;
  }
}

export type PlaybackItem = PlaybackObject | PlaybackNote | PlaybackGracenote;

export function itemLength(item: PlaybackItem) {
  return item instanceof PlaybackNote ? item.duration : 0;
}

function itemsLength(items: PlaybackItem[]) {
  return sum(items.map(itemLength));
}

export class PlaybackMeasure {
  public parts: PlaybackItem[][];
  public repeatStart: boolean;
  public repeatEnd: boolean;

  constructor(items: PlaybackItem[][], repeatStart: boolean, repeatEnd: boolean) {
    this.parts = items;
    this.repeatStart = repeatStart;
    this.repeatEnd = repeatEnd;
  }

  /**
   * Get length of measure in beats
   * @returns maximum length of the parts in the measure, in beats
   */
  length() {
    return Math.max(...this.parts.map(itemsLength));
  }
  /**
   * Get length of main part (first part) of measure in beats
   * @returns length of the main part of the measure, in beats
   */
  lengthOfMainPart() {
    return itemsLength(this.parts[0]);
  }

  /**
   * Get length of part up to an item in beats.
   * @param partIndex index into .parts
   * @param itemIndex index into .parts[partIndex]
   * @returns length up to (but not including) .parts[partIndex], in beats
   */
  timeTo(partIndex: number, itemIndex: number) {
    return itemsLength(this.parts[partIndex].slice(0, itemIndex));
  }

  /**
   * Get length of part up to and including an item in beats.
   * @param partIndex index into .parts
   * @param itemIndex index into .parts[partIndex]
   * @returns length up to (and including) .parts[partIndex], in beats
   */
  timeToAfter(partIndex: number, itemIndex: number) {
    return itemsLength(this.parts[partIndex].slice(0, itemIndex + 1));
  }
}

export class PlaybackIndex {
  public measureIndex: number;
  public timeOffset: number;

  constructor(measureIndex: number, timeOffset: number) {
    this.measureIndex = measureIndex;
    this.timeOffset = timeOffset;
  }

  isBefore(other: PlaybackIndex) {
    return (
      this.measureIndex < other.measureIndex ||
      (this.measureIndex === other.measureIndex &&
        this.timeOffset < other.timeOffset)
    );
  }

  isAtOrBefore(other: PlaybackIndex) {
    return (
      this.measureIndex < other.measureIndex ||
      (this.measureIndex === other.measureIndex &&
        this.timeOffset <= other.timeOffset)
    );
  }

  incrementByItem(item: PlaybackItem) {
    return new PlaybackIndex(this.measureIndex, this.timeOffset + itemLength(item));
  }
}

export class PlaybackSecondTiming {
  start: PlaybackIndex;
  middle: PlaybackIndex;
  end: PlaybackIndex;
  isSingleTiming:boolean;

  constructor(start: PlaybackIndex, middle: PlaybackIndex, end: PlaybackIndex,isSingleTiming:boolean=false) {
    this.start = start;
    this.middle = middle;
    this.end = end;
    this.isSingleTiming = isSingleTiming;
  }

  in(index: PlaybackIndex) {
    return this.start.isAtOrBefore(index) && index.isAtOrBefore(this.end);
  }

  shouldDeleteElement(index: PlaybackIndex, repeating: boolean) {
    if (repeating) {
      return this.start.isAtOrBefore(index) && index.isBefore(this.middle);
    }
    return this.middle.isAtOrBefore(index) && index.isAtOrBefore(this.end);
  }
}
