/*
  SecondTiming format
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';
import { Dispatch } from '../Controllers/Controller';
import { clickSecondTiming } from '../Controllers/SecondTiming';
import { ID } from '../global/id';
import { foreach, Obj } from '../global/utils';
import { closestItem, getXY, itemBefore } from '../global/xy';
import { SecondTimingSelection } from '../Selection';
import { Selection } from '../Selection';

export interface DraggedSecondTiming {
  secondTiming: SecondTiming;
  dragged: 'start' | 'middle' | 'end';
}

interface SecondTimingProps {
  staveStartX: number;
  staveEndX: number;
  selection: Selection | null;
  staveGap: number;
  dispatch: Dispatch;
}
export class SecondTiming {
  private start: ID;
  private middle: ID;
  private end: ID;
  constructor(start: ID, middle: ID, end: ID) {
    this.start = start;
    this.middle = middle;
    this.end = end;
  }
  public static fromJSON(o: Obj) {
    return new SecondTiming(o.start, o.middle, o.end);
  }
  public toJSON() {
    return {
      start: this.start,
      middle: this.middle,
      end: this.end,
    };
  }
  public pointsTo(id: ID) {
    return this.start === id || this.middle === id || this.end === id;
  }
  public drag(
    drag: 'start' | 'middle' | 'end',
    x: number,
    y: number,
    others: SecondTiming[]
  ) {
    const closest = closestItem(x, y, drag !== 'end');
    const test = new SecondTiming(this.start, this.middle, this.end);
    test[drag] = closest;
    if (test.isValid(others.filter((s) => s !== this))) {
      this[drag] = closest;
    }
  }
  public isValid(others: SecondTiming[]): boolean {
    // This function checks if a second timing model is valid
    // It checks that start, middle, and end are in a valid order
    if (
      !(
        itemBefore(this.start, this.middle) &&
        (itemBefore(this.middle, this.end) || this.middle === this.end)
      )
    ) {
      return false;
    }

    for (const other of others) {
      // check for overlapping
      if (
        // Don't need to check middle, as those will be dealt with in the other clauses; however we do need to do start/end
        this.start === other.end ||
        this.end === other.start ||
        this.start === other.start ||
        this.end === other.end ||
        // If start is between other.start/other.end
        (itemBefore(this.start, other.end) &&
          itemBefore(other.start, this.start)) ||
        // If other's start is between start/end
        (itemBefore(other.start, this.end) &&
          itemBefore(this.start, other.start)) ||
        // If end is between other.start/other.end
        (itemBefore(this.end, other.end) &&
          itemBefore(other.start, this.end)) ||
        // If other's end is between start/end
        (itemBefore(other.end, this.end) && itemBefore(this.start, other.end))
      ) {
        return false;
      }
    }
    return true;
  }

  public render(props: SecondTimingProps): V {
    const start = getXY(this.start);
    const middle = getXY(this.middle);
    const end = getXY(this.end);
    const height = 45;
    const mid = 20;
    const clickWidth = 10;

    const selected =
      props.selection instanceof SecondTimingSelection &&
      props.selection.secondTiming === this;

    const colour = selected ? 'orange' : 'black';

    if (!(start && middle && end)) {
      console.error('invalid second timing!');
      return svg('g');
    }

    const numberOfStavesBetweenStartAndMiddle = Math.max(
      Math.round((middle.y - start.y) / props.staveGap) - 1,
      0
    );
    const numberOfStavesBetweenMiddleAndEnd = Math.max(
      Math.round((end.y - middle.y) / props.staveGap) - 1,
      0
    );

    const fromStartToMiddle = (i: number) => start.y + i * props.staveGap;
    const fromMiddleToEnd = (i: number) => middle.y + i * props.staveGap;

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

    const dragBox = (x: number, y: number, part: 'start' | 'middle' | 'end') =>
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
          mousedown: () =>
            props.dispatch(
              clickSecondTiming(this, part as 'start' | 'middle' | 'end')
            ),
        }
      );
    return svg('g', { class: 'second-timing' }, [
      start.y === middle.y
        ? horizontal(start.beforeX, middle.beforeX, start.y)
        : svg('g', [
            horizontal(start.beforeX, props.staveEndX, start.y),
            vertical(props.staveEndX, start.y),
            horizontal(props.staveStartX, middle.beforeX, middle.y),
            vertical(props.staveStartX, middle.y),

            ...foreach(numberOfStavesBetweenStartAndMiddle, (i) => i + 1).map(
              (i) =>
                svg('g', [
                  horizontal(
                    props.staveStartX,
                    props.staveEndX,
                    fromStartToMiddle(i)
                  ),
                  vertical(props.staveStartX, fromStartToMiddle(i)),
                  vertical(props.staveEndX, fromStartToMiddle(i)),
                ])
            ),
          ]),
      middle.y === end.y
        ? horizontal(middle.beforeX, end.afterX, middle.y)
        : svg('g', [
            horizontal(middle.beforeX, props.staveEndX, middle.y),
            vertical(props.staveEndX, middle.y),
            horizontal(props.staveStartX, end.afterX, end.y),
            vertical(props.staveStartX, end.y),

            ...foreach(numberOfStavesBetweenMiddleAndEnd, (i) => i + 1).map(
              (i) =>
                svg('g', [
                  horizontal(
                    props.staveStartX,
                    props.staveEndX,
                    fromMiddleToEnd(i)
                  ),
                  vertical(props.staveStartX, fromMiddleToEnd(i)),
                  vertical(props.staveEndX, fromMiddleToEnd(i)),
                ])
            ),
          ]),

      svg('text', { x: start.beforeX + 5, y: start.y - height / 2 }, ['1.']),
      svg('text', { x: middle.beforeX + 5, y: middle.y - height / 2 }, ['2.']),

      ...[
        { x: start.beforeX, y: start.y, part: 'start' },
        { x: middle.beforeX, y: middle.y, part: 'middle' },
        { x: end.afterX, y: end.y, part: 'end' },
      ].map(({ x, y, part }) =>
        svg('g', [
          vertical(x, y),
          dragBox(x, y, part as 'start' | 'middle' | 'end'),
        ])
      ),
    ]);
  }
}
