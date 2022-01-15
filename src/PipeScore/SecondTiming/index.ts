/*
  SecondTiming format
  Copyright (C) 2021 macarc
*/
import { svg, V } from 'marender';
import { dispatch } from '../Controller';
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
  protected lineFrom(
    a: XY,
    b: XY,
    text: string,
    colour: string,
    click: (first: boolean) => void,
    clickText: () => void,
    // if true, draw the end.
    // if true, we use b.afterX, otherwise we use b.beforeX
    drawLast: boolean,
    props: TimingProps
  ): V {
    if (
      !(
        a.page === props.page ||
        b.page === props.page ||
        (a.page < props.page && props.page < b.page)
      )
    )
      return svg('g');

    const height = 45;
    const mid = 30;
    const clickWidth = 10;
    const y = (i: number) => a.y + i * props.staveGap;

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
    const lastx = drawLast ? b.afterX : b.beforeX;

    if (a.page === b.page && a.page === props.page) {
      const verticalLines = [
        vertical(a.beforeX, a.y),
        dragBox(a.beforeX, a.y, true),
        drawLast ? vertical(lastx, b.y) : null,
        drawLast ? dragBox(lastx, b.y, false) : null,
      ];
      const stavesBetween = Math.max(
        Math.round((b.y - a.y) / props.staveGap) - 1,
        0
      );
      return svg('g', [
        ...(a.y === b.y
          ? [horizontal(a.beforeX, lastx, a.y), ...verticalLines]
          : [
              horizontal(a.beforeX, props.staveEndX, a.y),
              vertical(props.staveEndX, a.y),
              horizontal(props.staveStartX, lastx, b.y),
              vertical(props.staveStartX, b.y),

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
          { x: a.beforeX + 5, y: a.y - (height * 2) / 3 },
          { mousedown: () => click(true), dblclick: clickText },
          [text]
        ),
      ]);
    } else if (a.page === props.page) {
      const last = props.score.lastOnPage(props.page);
      if (last) {
        const xy = getXY(last.id);
        if (xy)
          return this.lineFrom(
            a,
            xy,
            text,
            colour,
            click,
            clickText,
            true,
            props
          );
      }
    } else if (b.page === props.page) {
      const first = props.score.firstOnPage(props.page);
      if (first) {
        const xy = getXY(first.id);
        if (xy)
          return this.lineFrom(
            xy,
            b,
            '',
            colour,
            click,
            clickText,
            drawLast,
            props
          );
      }
    } else {
      const first = props.score.firstOnPage(props.page);
      const last = props.score.lastOnPage(props.page);
      if (first && last) {
        const firstxy = getXY(first.id);
        const lastxy = getXY(last.id);
        if (firstxy && lastxy)
          return this.lineFrom(
            firstxy,
            lastxy,
            '',
            colour,
            click,
            clickText,
            true,
            props
          );
      }
    }
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
      if (test.isValid(others.filter((s) => s !== this))) {
        this[drag] = closest;
      }
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
        start,
        middle,
        this.firstText,
        colour,
        (first) =>
          dispatch(clickSecondTiming(this, first ? 'start' : 'middle')),
        () =>
          dispatch(editText(this.firstText, (text) => (this.firstText = text))),
        false,
        props
      ),
      this.lineFrom(
        middle,
        end,
        this.secondText,
        colour,
        (first) => dispatch(clickSecondTiming(this, first ? 'middle' : 'end')),
        () =>
          dispatch(
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
      if (test.isValid(others.filter((s) => s !== this))) {
        this[drag] = closest;
      }
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

    return svg('g', { class: 'second-timing' }, [
      this.lineFrom(
        start,
        end,
        this.text,
        colour,
        (first) => dispatch(clickSecondTiming(this, first ? 'start' : 'end')),
        () => dispatch(editText(this.text, (text) => (this.text = text))),
        true,
        props
      ),
    ]);
  }
}

export type Timing = SingleTiming | SecondTiming;
export type TimingPart = 'start' | 'middle' | 'end';
