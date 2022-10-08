//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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
import { editTimingText } from '../Events/Misc';
import { clickTiming } from '../Events/Timing';
import { ID } from '../global/id';
import { foreach, Obj, nmap } from '../global/utils';
import { inOrder, closestItem, getXY, itemBefore, XY } from '../global/xy';
import { Score } from '../Score';
import { TimingSelection } from '../Selection';
import { Selection } from '../Selection';

interface TimingProps {
  score: Score;
  page: number;
  staveStartX: number;
  staveEndX: number;
  selection: Selection | null;
  staveGap: number;
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
  abstract render(props: TimingProps): m.Children;

  protected abstract toObject(): Obj;
  protected abstract front(): XY;
  protected abstract back(): XY;
  protected abstract noSelfOverlap(): boolean;

  public static fromJSON(o: Obj) {
    switch (o.type) {
      case 'second timing':
        return SecondTiming.fromObject(o.value);
      case 'single timing':
        return SingleTiming.fromObject(o.value);
      default:
        throw new Error(`Unrecognised second timing type: ${o.type}`);
    }
  }
  public toJSON() {
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
    a: XY,
    b: XY,
    text: string,
    click: (first: boolean) => void,
    clickText: () => void,
    // if true, draw the vertical line at the end
    // if true, we use b.afterX, otherwise we use b.beforeX
    drawLast: boolean,
    props: TimingProps
  ): m.Children {
    const willDrawOnThisPage =
      a.page === props.page ||
      b.page === props.page ||
      (a.page < props.page && props.page < b.page);
    if (!willDrawOnThisPage) return m('g');

    let start = a;
    if (a.page !== props.page) {
      const firstBar = props.score.firstOnPage(props.page);
      const xy = nmap(firstBar, (bar) => getXY(bar.id));
      if (xy) start = xy;
    }
    let end = b;
    if (b.page !== props.page) {
      const lastBar = props.score.lastOnPage(props.page);
      const xy = nmap(lastBar, (bar) => getXY(bar.id));
      if (xy) end = xy;
    }

    text = a === start ? text : '';

    const selected =
      props.selection instanceof TimingSelection &&
      props.selection.timing === this;

    const colour = selected ? 'orange' : 'black';

    const height = 45;
    const mid = 30;
    const clickWidth = 10;
    const y = (i: number) => start.y + i * props.staveGap;

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
    const lastx = drawLast ? end.afterX : end.beforeX;

    const verticalLines = [
      vertical(start.beforeX, start.y),
      dragBox(start.beforeX, start.y, true),
      drawLast ? vertical(lastx, end.y) : null,
      drawLast ? dragBox(lastx, end.y, false) : null,
    ];
    const stavesBetween = Math.max(
      Math.round((end.y - start.y) / props.staveGap) - 1,
      0
    );
    return m('g', [
      ...(start.y === end.y
        ? [horizontal(start.beforeX, lastx, start.y), ...verticalLines]
        : [
            horizontal(start.beforeX, props.staveEndX, start.y),
            vertical(props.staveEndX, start.y),
            horizontal(props.staveStartX, lastx, end.y),
            vertical(props.staveStartX, end.y),

            ...foreach(stavesBetween, (i) => i + 1).map((i) =>
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
  public static fromObject(o: Obj) {
    const st = new SecondTiming(o.start, o.middle, o.end);
    st.firstText = o.firstText;
    st.secondText = o.secondText;
    return st;
  }
  public toObject() {
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
  public render(props: TimingProps): m.Children {
    const start = getXY(this.start);
    const middle = getXY(this.middle);
    const end = getXY(this.end);

    if (!(start && middle && end)) {
      console.error('invalid second timing!');
      return m('g');
    }

    return m('g[class=second-timing]', [
      this.lineFrom(
        start,
        middle,
        this.firstText,
        (first) => dispatch(clickTiming(this, first ? 'start' : 'middle')),
        () =>
          dispatch(
            editTimingText(this.firstText, (text) => (this.firstText = text))
          ),
        false,
        props
      ),
      this.lineFrom(
        middle,
        end,
        this.secondText,
        (first) => dispatch(clickTiming(this, first ? 'middle' : 'end')),
        () =>
          dispatch(
            editTimingText(this.secondText, (text) => (this.secondText = text))
          ),
        true,
        props
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
  public static fromObject(o: Obj) {
    const st = new SingleTiming(o.start, o.end);
    st.text = o.text;
    return st;
  }
  public toObject() {
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
    const start = getXY(this.start);
    const end = getXY(this.end);

    if (!(start && end)) {
      console.error('invalid second timing!');
      return m('g');
    }

    return m('g[class=second-timing]', [
      this.lineFrom(
        start,
        end,
        this.text,
        (first) => dispatch(clickTiming(this, first ? 'start' : 'end')),
        () => dispatch(editTimingText(this.text, (text) => (this.text = text))),
        true,
        props
      ),
    ]);
  }
}
