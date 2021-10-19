/*
  SecondTiming format
  Copyright (C) 2021 macarc
*/
import { svg, V } from '../../render/h';
import { Dispatch } from '../Controllers/Controller';
import { editText } from '../Controllers/Misc';
import { clickSecondTiming } from '../Controllers/SecondTiming';
import { ID } from '../global/id';
import { foreach, Obj } from '../global/utils';
import { before, closestItem, getXY, itemBefore, XY } from '../global/xy';
import { Score } from '../Score';
import { SecondTimingSelection } from '../Selection';
import { Selection } from '../Selection';

export type DraggedTiming = {
  timing: Timing;
  dragged: TimingPart;
};

interface TimingProps {
  score: Score;
  page: number;
  staveStartX: number;
  staveEndX: number;
  selection: Selection | null;
  staveGap: number;
  dispatch: Dispatch;
}
export abstract class BaseTiming {
  abstract toObject(): Obj;
  abstract pointsTo(id: ID): boolean;
  abstract render(props: TimingProps): V;

  protected abstract front(): XY;
  protected abstract back(): XY;
  protected abstract validToItself(): boolean;

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
  public isValid(others: Timing[]): boolean {
    // This function checks if a second timing model is valid
    // It checks that start, middle, and end are in a valid order
    if (!this.validToItself()) return false;

    const start = this.front();
    const end = this.back();
    for (const other of others) {
      // check for overlapping
      const ostart = other.front();
      const oend = other.back();
      if (
        // Don't need to check middle, as those will be dealt with in the other clauses; however we do need to do start/end
        start === oend ||
        end === ostart ||
        start === ostart ||
        end === oend ||
        // If start is between other.start/other.end
        (before(start, oend) && before(ostart, start)) ||
        // If other's start is between start/end
        (before(ostart, end) && before(start, ostart)) ||
        // If end is between other.start/other.end
        (before(end, oend) && before(ostart, end)) ||
        // If other's end is between start/end
        (before(oend, end) && before(start, oend))
      ) {
        return false;
      }
    }
    return true;
  }
  protected onPage(page: number) {
    const start = this.front().page;
    const end = this.back().page;
    return start === page || end === page || (start < page && page < end);
  }
  protected lineFrom(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    page1: number,
    page2: number,
    text: string,
    colour: string,
    click: (first: boolean) => void,
    clickText: () => void,
    drawLast: boolean,
    props: TimingProps
  ): V {
    if (!this.onPage(props.page)) return svg('g');

    const height = 45;
    const mid = 20;
    const clickWidth = 10;
    const stavesBetween = Math.max(
      Math.round((y2 - y1) / props.staveGap) - 1,
      0
    );
    const y = (i: number) => y1 + i * props.staveGap;

    const horizontal = (x1: number, x2: number, y: number) =>
      svg('line', {
        x1,
        x2,
        y1: y - height,
        y2: y - height,
        stroke: colour,
      });
    const vertical = (x: number, y: number) =>
      svg('line', {
        x1: x,
        x2: x,
        y1: y - mid,
        y2: y - height,
        stroke: colour,
      });

    const dragBox = (x: number, y: number, start: boolean) =>
      svg(
        'rect',
        {
          x: x - clickWidth / 2,
          y: y - height,
          width: clickWidth,
          height: height - mid,
          opacity: 0,
        },
        {
          mousedown: () => click(start),
        }
      );
    const verticalLines = [
      vertical(x1, y1),
      dragBox(x1, y1, true),
      drawLast ? vertical(x2, y2) : null,
      drawLast ? dragBox(x2, y2, false) : null,
    ];

    if (page1 === page2) {
      return svg('g', [
        ...(y1 === y2
          ? [horizontal(x1, x2, y1), ...verticalLines]
          : [
              horizontal(x1, props.staveEndX, y1),
              vertical(props.staveEndX, y1),
              horizontal(props.staveStartX, x2, y2),
              vertical(props.staveStartX, y2),

              ...foreach(stavesBetween, (i) => i + 1).map((i) =>
                svg('g', [
                  horizontal(props.staveStartX, props.staveEndX, y(i)),
                  vertical(props.staveStartX, y(i)),
                  vertical(props.staveEndX, y(i)),
                ])
              ),
              ...verticalLines,
            ]),
        svg(
          'text',
          { x: x1 + 5, y: y1 - height / 2 },
          { mousedown: () => click(true), dblclick: clickText },
          [text]
        ),
      ]);
    }
    // TODO
    return svg('g');
  }
}

export class SecondTiming extends BaseTiming {
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
  protected validToItself() {
    return (
      itemBefore(this.start, this.middle) &&
      (this.middle === this.end || itemBefore(this.middle, this.end))
    );
  }
  public drag(drag: TimingPart, x: number, y: number, others: Timing[]) {
    const closest = closestItem(x, y, drag !== 'end');
    const test = new SecondTiming(this.start, this.middle, this.end);
    test[drag] = closest;
    if (test.isValid(others.filter((s) => s !== this))) {
      this[drag] = closest;
    }
  }
  public render(props: TimingProps): V {
    const start = getXY(this.start);
    const middle = getXY(this.middle);
    const end = getXY(this.end);

    const selected =
      props.selection instanceof SecondTimingSelection &&
      props.selection.secondTiming === this;

    const colour = selected ? 'orange' : 'black';

    if (!(start && middle && end)) {
      console.error('invalid second timing!');
      return svg('g');
    }

    return svg('g', { class: 'second-timing' }, [
      this.lineFrom(
        start.beforeX,
        start.y,
        middle.beforeX,
        middle.y,
        start.page,
        middle.page,
        this.firstText,
        colour,
        (first) =>
          props.dispatch(clickSecondTiming(this, first ? 'start' : 'middle')),
        () =>
          props.dispatch(
            editText(this.firstText, (text) => (this.firstText = text))
          ),
        false,
        props
      ),
      this.lineFrom(
        middle.beforeX,
        middle.y,
        end.afterX,
        end.y,
        middle.page,
        end.page,
        this.secondText,
        colour,
        (first) =>
          props.dispatch(clickSecondTiming(this, first ? 'middle' : 'end')),
        () =>
          props.dispatch(
            editText(this.secondText, (text) => (this.secondText = text))
          ),
        true,
        props
      ),
    ]);
  }
}

export class SingleTiming extends BaseTiming {
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
  protected validToItself() {
    return this.start === this.end || itemBefore(this.start, this.end);
  }
  public drag(drag: TimingPart, x: number, y: number, others: Timing[]) {
    if (drag === 'middle') return;
    const closest = closestItem(x, y, drag !== 'end');
    const test = new SingleTiming(this.start, this.end);
    test[drag] = closest;
    if (test.isValid(others.filter((s) => s !== this))) {
      this[drag] = closest;
    }
  }
  public render(props: TimingProps): V {
    const start = getXY(this.start);
    const end = getXY(this.end);

    const selected =
      props.selection instanceof SecondTimingSelection &&
      props.selection.secondTiming === this;

    const colour = selected ? 'orange' : 'black';

    if (!(start && end)) {
      console.error('invalid second timing!');
      return svg('g');
    }

    if (!this.onPage(props.page)) return svg('g');

    return svg('g', { class: 'second-timing' }, [
      this.lineFrom(
        start.beforeX,
        start.y,
        end.afterX,
        end.y,
        start.page,
        end.page,
        this.text,
        colour,
        (first) =>
          props.dispatch(clickSecondTiming(this, first ? 'start' : 'end')),
        () => props.dispatch(editText(this.text, (text) => (this.text = text))),
        true,
        props
      ),
    ]);
  }
}

export type Timing = SingleTiming | SecondTiming;
export type TimingPart = 'start' | 'middle' | 'end';
