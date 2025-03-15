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

//  Timings include:
//  - second timings - with two parts
//  - single timings - has one part

import m from 'mithril';
import { ITiming } from '.';
import {
  PlaybackIndex,
  type PlaybackMeasure,
  PlaybackObject,
  PlaybackSecondTiming,
} from '../Playback';
import type {
  SavedSecondTiming,
  SavedSingleTiming,
  SavedTiming,
} from '../SavedModel';
import dialogueBox from '../global/dialogueBox';
import type { ID } from '../global/id';
import { type XY, closestItem, getXY, isBefore, isItemBefore } from '../global/xy';

export type TimingPart = 'start' | 'middle' | 'end';

export abstract class Timing extends ITiming {
  protected abstract front(): XY;
  protected abstract back(): XY;
  protected abstract noSelfOverlap(): boolean;

  static fromJSON(o: SavedTiming) {
    switch (o.type) {
      case 'second timing':
        return SecondTiming.fromObject(o.value);
      case 'single timing':
        return SingleTiming.fromObject(o.value);
      default:
        console.error('Unrecognised timing type', o);
        throw new Error('Invalid timing');
    }
  }
  toJSON(): SavedTiming {
    if (this instanceof SecondTiming) {
      return {
        type: 'second timing',
        value: this.toObject(),
      };
    }
    if (this instanceof SingleTiming) {
      return {
        type: 'single timing',
        value: this.toObject(),
      };
    }
    throw new Error(`Unrecognised type of timing: ${this}`);
  }

  noOverlap(others: Timing[]) {
    if (!this.noSelfOverlap()) return false;

    const start = this.front();
    const end = this.back();
    for (const other of others) {
      const ostart = other.front();
      const oend = other.back();
      if (
        start === oend ||
        end === ostart ||
        start === ostart ||
        end === oend ||
        (isBefore(ostart, start, 'beforeX', 'beforeX') &&
          isBefore(start, oend, 'beforeX', 'afterX')) ||
        (isBefore(start, ostart, 'beforeX', 'beforeX') &&
          isBefore(ostart, end, 'beforeX', 'afterX')) ||
        (isBefore(ostart, end, 'beforeX', 'afterX') &&
          isBefore(end, oend, 'afterX', 'afterX')) ||
        (isBefore(start, oend, 'beforeX', 'afterX') &&
          isBefore(oend, end, 'beforeX', 'afterX'))
      ) {
        console.log(
          isBefore(ostart, start, 'beforeX', 'beforeX') &&
            isBefore(start, oend, 'beforeX', 'afterX'),
          isBefore(start, ostart, 'beforeX', 'beforeX') &&
            isBefore(ostart, end, 'beforeX', 'afterX'),
          isBefore(ostart, end, 'beforeX', 'afterX') &&
            isBefore(end, oend, 'afterX', 'afterX'),
          isBefore(start, oend, 'beforeX', 'afterX') &&
            isBefore(oend, end, 'beforeX', 'afterX')
        );
        return false;
      }
    }
    return true;
  }
}

export class SecondTiming extends Timing {
  private start: ID;
  private middle: ID;
  private end: ID;
  private firstText = '1.';
  private secondText = '2.';

  constructor(start: ID, middle: ID, end: ID) {
    super();
    this.start = start;
    this.middle = middle;
    this.end = end;
  }

  static fromObject(o: SavedSecondTiming) {
    const st = new SecondTiming(o.start, o.middle, o.end);
    st.firstText = o.firstText;
    st.secondText = o.secondText;
    return st;
  }

  toObject(): SavedSecondTiming {
    return {
      start: this.start,
      middle: this.middle,
      end: this.end,
      firstText: this.firstText,
      secondText: this.secondText,
    };
  }

  pointsTo(id: ID) {
    return this.start === id || this.middle === id || this.end === id;
  }

  front() {
    const start = getXY(this.start);
    if (start) return start;
    throw new Error('SecondTiming points to invalid start point.');
  }

  back() {
    const end = getXY(this.end);
    if (end) return end;
    throw new Error('SecondTiming points to invalid start point.');
  }

  isDangling() {
    return (
      getXY(this.start) === null ||
      getXY(this.middle) === null ||
      getXY(this.end) === null
    );
  }

  protected noSelfOverlap() {
    return (
      isItemBefore(this.start, this.middle, 'beforeX', 'beforeX') &&
      isItemBefore(this.middle, this.end, 'beforeX', 'afterX') &&
      getXY(this.start)?.harmonyIndex === 0 &&
      getXY(this.middle)?.harmonyIndex === 0 &&
      getXY(this.end)?.harmonyIndex === 0
    );
  }

  async editText() {
    const form = await dialogueBox('Edit 1st/2nd Timing', [
      m('section', [
        m('label', [
          '1st text:',
          m('input', { type: 'text', name: '1st', value: this.firstText }),
        ]),
        m('label', [
          '2nd text:',
          m('input', { type: 'text', name: '2nd', value: this.secondText }),
        ]),
      ]),
    ]);
    if (form) {
      this.firstText = (
        form.querySelector('input[name="1st"]') as HTMLInputElement
      ).value;
      this.secondText = (
        form.querySelector('input[name="2nd"]') as HTMLInputElement
      ).value;
    }
  }

  drag(drag: TimingPart, x: number, y: number, page: number, others: Timing[]) {
    const closest = closestItem(x, y, page, drag === 'end' ? 'afterX' : 'beforeX');
    if (closest) {
      const test = new SecondTiming(this.start, this.middle, this.end);
      test[drag] = closest;
      if (test.noOverlap(others.filter((s) => s !== this))) {
        this[drag] = closest;
      }
    }
  }

  play(measures: PlaybackMeasure[]): PlaybackSecondTiming | null {
    let startIndex: PlaybackIndex | null = null;
    let middleIndex: PlaybackIndex | null = null;
    let endIndex: PlaybackIndex | null = null;

    for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
      const parts = measures[measureIndex].parts;
      for (let partIndex = 0; partIndex < parts.length; partIndex++) {
        const part = parts[partIndex];
        for (let itemIndex = 0; itemIndex < part.length; itemIndex++) {
          const item = part[itemIndex];
          if (item instanceof PlaybackObject) {
            if (item.type === 'object-start' && item.id === this.start) {
              const timeToItem = measures[measureIndex].timeTo(partIndex, itemIndex);
              startIndex = new PlaybackIndex(measureIndex, timeToItem);
            } else if (item.type === 'object-start' && item.id === this.middle) {
              const timeToItem = measures[measureIndex].timeTo(partIndex, itemIndex);
              middleIndex = new PlaybackIndex(measureIndex, timeToItem);
            } else if (item.type === 'object-end' && item.id === this.end) {
              const timeToItem = measures[measureIndex].timeToAfter(
                partIndex,
                itemIndex
              );
              endIndex = new PlaybackIndex(measureIndex, timeToItem);
            }
          }
        }
      }
    }

    if (startIndex === null || middleIndex === null || endIndex === null) {
      console.error("Didn't find playback measure", this);
      return null;
    }

    return new PlaybackSecondTiming(startIndex, middleIndex, endIndex);
  }

  lines() {
    return [
      {
        start: this.start,
        end: this.middle,
        text: this.firstText,
        part(first: boolean) {
          return first ? 'start' : 'middle';
        },
        drawUntilAfterEnd: false,
      },
      {
        start: this.middle,
        end: this.end,
        text: this.secondText,
        part(first: boolean) {
          return first ? 'middle' : 'end';
        },
        drawUntilAfterEnd: true,
      },
    ];
  }
}

export class SingleTiming extends Timing {
  private start: ID;
  private end: ID;
  private text = '2.';

  constructor(start: ID, end: ID) {
    super();
    this.start = start;
    this.end = end;
  }

  static fromObject(o: SavedSingleTiming) {
    const st = new SingleTiming(o.start, o.end);
    st.text = o.text;
    return st;
  }

  toObject(): SavedSingleTiming {
    return {
      start: this.start,
      end: this.end,
      text: this.text,
    };
  }

  pointsTo(id: ID) {
    return this.start === id || this.end === id;
  }

  front() {
    const start = getXY(this.start);
    if (start) return start;
    throw new Error('SecondTiming points to invalid start point.');
  }

  back() {
    const end = getXY(this.end);
    if (end) return end;
    throw new Error('SecondTiming points to invalid start point.');
  }

  isDangling() {
    const start = getXY(this.start);
    const end = getXY(this.end);
    return (
      start === null ||
      end === null ||
      start.harmonyIndex !== 0 ||
      end.harmonyIndex !== 0
    );
  }

  protected noSelfOverlap() {
    return (
      isItemBefore(this.start, this.end, 'beforeX', 'afterX') &&
      getXY(this.start)?.harmonyIndex === 0 &&
      getXY(this.end)?.harmonyIndex === 0
    );
  }

  async editText() {
    const form = await dialogueBox('Edit 2nd Timing', [
      m('section', [
        m('label', ['Text:', m('input', { type: 'text', value: this.text })]),
      ]),
    ]);
    if (form) {
      this.text = (
        form.querySelector('input[type="text"]') as HTMLInputElement
      ).value;
    }
  }

  drag(drag: TimingPart, x: number, y: number, page: number, others: Timing[]) {
    if (drag === 'middle') return;
    const closest = closestItem(x, y, page, drag === 'end' ? 'afterX' : 'beforeX');
    if (closest) {
      const test = new SingleTiming(this.start, this.end);
      test[drag] = closest;
      if (test.noOverlap(others.filter((s) => s !== this))) {
        this[drag] = closest;
      }
    }
  }

  lines() {
    return [
      {
        start: this.start,
        end: this.end,
        text: this.text,
        part(first: boolean) {
          return first ? 'start' : 'end';
        },
        drawUntilAfterEnd: true,
      },
    ];
  }
  play(measures: PlaybackMeasure[]): PlaybackSecondTiming | null {
    let startIndex: PlaybackIndex | null = null;
    let middleIndex:PlaybackIndex = new PlaybackIndex(-1, 0);
    let endIndex: PlaybackIndex | null = null;

    for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
      const parts = measures[measureIndex].parts;
      for (let partIndex = 0; partIndex < parts.length; partIndex++) {
        const part = parts[partIndex];
        for (let itemIndex = 0; itemIndex < part.length; itemIndex++) {
          const item = part[itemIndex];
          if (item instanceof PlaybackObject) {
            if (item.type === 'object-start' && item.id === this.start) {
              const timeToItem = measures[measureIndex].timeTo(partIndex, itemIndex);
              startIndex = new PlaybackIndex(measureIndex, timeToItem);
            } else if (item.type === 'object-end' && item.id === this.end) {
              const timeToItem = measures[measureIndex].timeToAfter(
                partIndex,
                itemIndex
              );
              endIndex = new PlaybackIndex(measureIndex, timeToItem);
            }
          }
        }
      }
    }

    if (startIndex === null || middleIndex === null || endIndex === null) {
      console.error("Didn't find playback measure", this);
      return null;
    }

    return new PlaybackSecondTiming(startIndex, middleIndex, endIndex, true);
  }

}
