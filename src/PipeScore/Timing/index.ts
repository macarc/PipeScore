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
import { dispatch } from '../Controller';
import { clickTiming, editTimingText } from '../Events/Timing';
import { Playback, PlaybackObject, PlaybackSecondTiming } from '../Playback';
import {
  SavedSecondTiming,
  SavedSingleTiming,
  SavedTiming,
} from '../SavedModel';
import { Score } from '../Score';
import { TimingSelection } from '../Selection';
import { Selection } from '../Selection';
import dialogueBox from '../global/dialogueBox';
import { ID } from '../global/id';
import { foreach } from '../global/utils';
import {
  XY,
  closestItem,
  getXY,
  getXYRangeForPage,
  inOrder,
  itemBefore,
} from '../global/xy';

interface TimingProps {
  score: Score;
  page: number;
  staveStartX: number;
  staveEndX: number;
  selection: Selection | null;
}

export type TimingPart = 'start' | 'middle' | 'end';

export abstract class Timing {
  abstract pointsTo(id: ID): boolean;
  abstract drag(
    part: TimingPart,
    x: number,
    y: number,
    page: number,
    others: Timing[]
  ): void;
  abstract editText(): Promise<void>;
  abstract render(props: TimingProps): m.Children;

  protected abstract front(): XY;
  protected abstract back(): XY;
  protected abstract noSelfOverlap(): boolean;

  public static fromJSON(o: SavedTiming) {
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
  public toJSON(): SavedTiming {
    if (this instanceof SecondTiming) {
      return {
        type: 'second timing',
        value: this.toObject(),
      };
    } else if (this instanceof SingleTiming) {
      return {
        type: 'single timing',
        value: this.toObject(),
      };
    } else {
      throw new Error(`Unrecognised type of timing: ${this}`);
    }
  }
  // Checks that there is no overlap, either with itself or with
  // the other timings in the array
  public noOverlap(others: Timing[]) {
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
        inOrder(ostart, start, oend) ||
        inOrder(start, ostart, end) ||
        inOrder(ostart, end, oend) ||
        inOrder(start, oend, end)
      ) {
        return false;
      }
    }
    return true;
  }
  protected lineFrom(
    a: ID,
    b: ID,
    text: string,
    click: (first: boolean) => void,
    clickText: () => void,
    // if true, draw the vertical line at the end
    // if true, we use b.afterX, otherwise we use b.beforeX
    drawUntilAfterB: boolean,
    props: TimingProps,
    lastLine: boolean
  ): m.Children {
    const { start, end } = getXYRangeForPage(
      a,
      b,
      props.page,
      props.score,
      lastLine
    );

    if (start && end) {
      const bXY = getXY(b);
      const bIsOnALaterPage = bXY === null || props.page < bXY.page;
      drawUntilAfterB ||= bIsOnALaterPage;

      text = a === start.id ? text : '';

      const isSelected =
        props.selection instanceof TimingSelection &&
        props.selection.timing === this;

      const colour = isSelected ? 'orange' : 'black';

      const height = 45;
      const mid = 30;
      const clickWidth = 10;

      const y = (i: number) =>
        props.score.staveY(props.score.staves()[i]) +
        props.score.staves()[i].gapAsNumber();

      const horizontal = (x1: number, x2: number, y: number) =>
        m('line', {
          x1,
          x2,
          y1: y - height,
          y2: y - height,
          stroke: colour,
        });
      const vertical = (x: number, y: number) =>
        m('line', {
          x1: x,
          x2: x,
          y1: y - mid,
          y2: y - height,
          stroke: colour,
        });

      const dragBox = (x: number, y: number, start: boolean) =>
        m('rect', {
          x: x - clickWidth / 2,
          y: y - height,
          width: clickWidth,
          height: height - mid,
          opacity: 0,
          cursor: 'ew-resize',
          onmousedown: () => click(start),
        });

      const lastx = drawUntilAfterB ? end.afterX : end.beforeX;
      const verticalLines = [
        vertical(start.beforeX, start.y),
        dragBox(start.beforeX, start.y, true),
        drawUntilAfterB ? vertical(lastx, end.y) : null,
        drawUntilAfterB ? dragBox(lastx, end.y, false) : null,
      ];

      const staveStartIndex = props.score
        .staves()
        .findIndex((s) => s.includesID(start.id));
      const staveEndIndex = props.score
        .staves()
        .findIndex((s) => s.includesID(end.id));
      const stavesBetween = staveEndIndex - staveStartIndex - 1;

      return m('g', [
        ...(start.y === end.y
          ? [horizontal(start.beforeX, lastx, start.y), ...verticalLines]
          : [
              horizontal(start.beforeX, props.staveEndX, start.y),
              vertical(props.staveEndX, start.y),

              horizontal(props.staveStartX, lastx, end.y),
              vertical(props.staveStartX, end.y),

              ...foreach(stavesBetween, (i) => staveStartIndex + i + 1).map(
                (i) =>
                  m('g', [
                    horizontal(props.staveStartX, props.staveEndX, y(i)),
                    vertical(props.staveStartX, y(i)),
                    vertical(props.staveEndX, y(i)),
                  ])
              ),
              ...verticalLines,
            ]),
        m(
          'text',
          {
            x: start.beforeX + 5,
            y: start.y - (height * 2) / 3,
            onmousedown: () => click(true),
            ondblclick: clickText,
          },
          text
        ),
      ]);
    }

    return null;
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
  public static fromObject(o: SavedSecondTiming) {
    const st = new SecondTiming(o.start, o.middle, o.end);
    st.firstText = o.firstText;
    st.secondText = o.secondText;
    return st;
  }
  public toObject(): SavedSecondTiming {
    return {
      start: this.start,
      middle: this.middle,
      end: this.end,
      firstText: this.firstText,
      secondText: this.secondText,
    };
  }
  public pointsTo(id: ID) {
    return this.start === id || this.middle === id || this.end === id;
  }
  public front() {
    const start = getXY(this.start);
    if (start) return start;
    throw new Error('SecondTiming points to invalid start point.');
  }
  public back() {
    const end = getXY(this.end);
    if (end) return end;
    throw new Error('SecondTiming points to invalid start point.');
  }
  protected noSelfOverlap() {
    return (
      itemBefore(this.start, this.middle) &&
      itemBefore(this.middle, this.end, true)
    );
  }
  public async editText() {
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
  public drag(
    drag: TimingPart,
    x: number,
    y: number,
    page: number,
    others: Timing[]
  ) {
    const closest = closestItem(x, y, page, drag !== 'end');
    if (closest) {
      const test = new SecondTiming(this.start, this.middle, this.end);
      test[drag] = closest;
      if (test.noOverlap(others.filter((s) => s !== this))) {
        this[drag] = closest;
      }
    }
  }
  public playbackTiming(elements: Playback[]): PlaybackSecondTiming {
    let start_index = -1;
    let middle_index = -1;
    let end_index = -1;
    for (let i = 0; i < elements.length; i++) {
      const n = elements[i];
      if (n instanceof PlaybackObject) {
        if (n.type === 'object-start' && n.id === this.start) {
          start_index = i;
        } else if (n.type === 'object-start' && n.id === this.middle) {
          middle_index = i;
        } else if (n.type === 'object-end' && n.id === this.end) {
          end_index = i;
          break;
        }
      }
    }
    return new PlaybackSecondTiming(start_index, middle_index, end_index);
  }
  public render(props: TimingProps): m.Children {
    return m('g[class=second-timing]', [
      this.lineFrom(
        this.start,
        this.middle,
        this.firstText,
        (first) => dispatch(clickTiming(this, first ? 'start' : 'middle')),
        () => dispatch(editTimingText(this)),
        false,
        props,
        true
      ),
      this.lineFrom(
        this.middle,
        this.end,
        this.secondText,
        (first) => dispatch(clickTiming(this, first ? 'middle' : 'end')),
        () => dispatch(editTimingText(this)),
        true,
        props,
        true
      ),
    ]);
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
  public static fromObject(o: SavedSingleTiming) {
    const st = new SingleTiming(o.start, o.end);
    st.text = o.text;
    return st;
  }
  public toObject(): SavedSingleTiming {
    return {
      start: this.start,
      end: this.end,
      text: this.text,
    };
  }
  public pointsTo(id: ID) {
    return this.start === id || this.end === id;
  }
  public front() {
    const start = getXY(this.start);
    if (start) return start;
    throw new Error('SecondTiming points to invalid start point.');
  }
  public back() {
    const end = getXY(this.end);
    if (end) return end;
    throw new Error('SecondTiming points to invalid start point.');
  }
  protected noSelfOverlap() {
    return itemBefore(this.start, this.end, true);
  }
  public async editText() {
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
  public drag(
    drag: TimingPart,
    x: number,
    y: number,
    page: number,
    others: Timing[]
  ) {
    if (drag === 'middle') return;
    const closest = closestItem(x, y, page, drag !== 'end');
    if (closest) {
      const test = new SingleTiming(this.start, this.end);
      test[drag] = closest;
      if (test.noOverlap(others.filter((s) => s !== this))) {
        this[drag] = closest;
      }
    }
  }
  public render(props: TimingProps): m.Children {
    return m('g[class=second-timing]', [
      this.lineFrom(
        this.start,
        this.end,
        this.text,
        (first) => dispatch(clickTiming(this, first ? 'start' : 'end')),
        () => dispatch(editTimingText(this)),
        true,
        props,
        true
      ),
    ]);
  }
}
