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

/**
 * Playback items can be either
 * - an object (with ID) - used for detecting start/end of selection, and for advancing cursor
 * - note - note with pitch and duration
 * - gracenote - note with pitch but no duration (duration is 'stolen' from subsequent note)
 */
export type PlaybackItem = PlaybackObject | PlaybackNote | PlaybackGracenote;

export type PlaybackObject = {
  type: 'object-start' | 'object-end';
  id: ID;
};

export type PlaybackNote = {
  type: 'note';
  pitch: Pitch;
  tied: boolean;
  duration: number;
};

export type PlaybackGracenote = {
  type: 'gracenote';
  pitch: Pitch;
};

/**
 * Helper function to generate PlaybackObjects
 * @param id id of object
 * @param children playback items that go between the object start and object end
 * @returns updated list of PlaybackItems, including object
 */
export function playbackObject(id: ID, children: PlaybackItem[]): PlaybackItem[] {
  return [{ type: 'object-start', id }, ...children, { type: 'object-end', id }];
}

/**
 * Helper function to generate PlaybackNote
 * @param pitch
 * @param duration
 * @param tied
 * @returns
 */
export function playbackNote(
  pitch: Pitch,
  duration: number,
  tied: boolean
): PlaybackNote {
  return { type: 'note', pitch, duration, tied };
}

/**
 * Helper function to generate PlaybackGracenote
 * @param pitch
 * @returns
 */
export function playbackGracenote(pitch: Pitch): PlaybackGracenote {
  return { type: 'gracenote', pitch };
}

/**
 * Helper function to get duration of a PlaybackItem.
 * @param item
 * @returns
 */
export function itemDuration(item: PlaybackItem) {
  return item.type === 'note' ? item.duration : 0;
}

/**
 * Helper function to total duration of a multiple PlaybackItems.
 * @param items
 * @returns
 */
function itemsDuration(items: PlaybackItem[]) {
  return sum(items.map(itemDuration));
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
    return Math.max(...this.parts.map(itemsDuration));
  }
  /**
   * Get length of main part (first part) of measure in beats
   * @returns length of the main part of the measure, in beats
   */
  lengthOfMainPart() {
    return itemsDuration(this.parts[0]);
  }

  /**
   * Get length of part up to an item in beats.
   * @param partIndex index into .parts
   * @param itemIndex index into .parts[partIndex]
   * @returns length up to (but not including) .parts[partIndex], in beats
   */
  timeTo(partIndex: number, itemIndex: number) {
    return itemsDuration(this.parts[partIndex].slice(0, itemIndex));
  }

  /**
   * Get length of part up to and including an item in beats.
   * @param partIndex index into .parts
   * @param itemIndex index into .parts[partIndex]
   * @returns length up to (and including) .parts[partIndex], in beats
   */
  timeToAfter(partIndex: number, itemIndex: number) {
    return itemsDuration(this.parts[partIndex].slice(0, itemIndex + 1));
  }
}

export class PlaybackIndex {
  public measureIndex: number;
  public timeOffset: number;

  constructor(measureIndex: number, timeOffset: number) {
    this.measureIndex = measureIndex;
    this.timeOffset = timeOffset;
  }

  /**
   * Check position relative to another PlaybackIndex.
   * @param other PlaybackIndex to compare to
   * @returns true if this PlaybackIndex is before the other
   */
  isBefore(other: PlaybackIndex) {
    return (
      this.measureIndex < other.measureIndex ||
      (this.measureIndex === other.measureIndex &&
        this.timeOffset < other.timeOffset)
    );
  }

  /**
   * Check position relative to another PlaybackIndex.
   * @param other PlaybackIndex to compare to
   * @returns true if this PlaybackIndex is before the other, or if the indices are the same
   */
  isAtOrBefore(other: PlaybackIndex) {
    return (
      this.measureIndex < other.measureIndex ||
      (this.measureIndex === other.measureIndex &&
        this.timeOffset <= other.timeOffset)
    );
  }

  /**
   * Adds the item duration to the PlaybackIndex, advancing the index through the bar.
   * @param item
   * @returns a new PlaybackIndex, which is this.timeOffset + item.duration through the bar
   */
  incrementByItem(item: PlaybackItem) {
    return new PlaybackIndex(
      this.measureIndex,
      this.timeOffset + itemDuration(item)
    );
  }
}

export class PlaybackSecondTiming {
  start: PlaybackIndex;
  middle: PlaybackIndex;
  end: PlaybackIndex;

  constructor(start: PlaybackIndex, middle: PlaybackIndex, end: PlaybackIndex) {
    this.start = start;
    this.middle = middle;
    this.end = end;
  }

  /**
   * Check if a PlaybackIndex is within a timing.
   * @param index
   * @returns true if the index is within the timing
   */
  in(index: PlaybackIndex) {
    return this.start.isAtOrBefore(index) && index.isAtOrBefore(this.end);
  }

  /**
   * Check if an item should not be played, which would be because either:
   * - we're on the first time through the part, and this is part of a second timing
   * - we're on a repeat, and this is part of a first timing
   * This is framed in the negative because it should be able to handle indices
   * outside the timing - shouldKeepElement() would be misleading since we don't know
   * if we should keep it! Just if it should be deleted.
   * @param index
   * @param repeating true if we're on a repeat
   * @returns true if the element should not be played
   */
  shouldDeleteElement(index: PlaybackIndex, repeating: boolean) {
    if (repeating) {
      return this.start.isAtOrBefore(index) && index.isBefore(this.middle);
    }
    return this.middle.isAtOrBefore(index) && index.isAtOrBefore(this.end);
  }
}
