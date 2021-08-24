/*
   SecondTiming/view.ts - second timing implementation
   Copyright (C) 2021 Archie Maclean
 */
import { svg, V } from '../../render/h';
import { getXY } from '../global/xy';

import { Dispatch } from '../Controllers/Controller';
import { clickSecondTiming } from '../Controllers/SecondTiming';

import { SecondTimingModel } from './model';

interface SecondTimingProps {
  staveStartX: number;
  staveEndX: number;
  selected: boolean;
  staveGap: number;
  dispatch: Dispatch;
}

export default function render(
  secondTiming: SecondTimingModel,
  props: SecondTimingProps
): V {
  const start = getXY(secondTiming.start);
  const middle = getXY(secondTiming.middle);
  const end = getXY(secondTiming.end);
  const height = 45;
  const mid = 20;
  const clickWidth = 10;

  const colour = props.selected ? 'orange' : 'black';

  const offset = height - mid;
  if (start && middle && end) {
    const numberOfStavesBetweenStartAndMiddle = Math.max(
      Math.round((middle.y - start.y) / props.staveGap) - 1,
      0
    );
    const numberOfStavesBetweenMiddleAndEnd = Math.max(
      Math.round((end.y - middle.y) / props.staveGap) - 1,
      0
    );

    const inBetweenStartAndMiddleY = (i: number) =>
      start.y + i * props.staveGap - height;
    const inBetweenMiddleAndEndY = (i: number) =>
      middle.y + i * props.staveGap - height;

    return svg('g', { class: 'second-timing' }, [
      start.y === middle.y
        ? svg('line', {
            x1: start.beforeX,
            x2: middle.beforeX,
            y1: start.y - height,
            y2: middle.y - height,
            stroke: colour,
          })
        : svg('g', [
            svg('line', {
              x1: start.beforeX,
              x2: props.staveEndX,
              y1: start.y - height,
              y2: start.y - height,
              stroke: colour,
            }),
            svg('line', {
              x1: props.staveEndX,
              x2: props.staveEndX,
              y1: start.y - mid,
              y2: start.y - height,
              stroke: colour,
            }),

            svg('line', {
              x1: props.staveStartX,
              x2: middle.beforeX,
              y1: middle.y - height,
              y2: middle.y - height,
              stroke: colour,
            }),
            svg('line', {
              x1: props.staveStartX,
              x2: props.staveStartX,
              y1: middle.y - mid,
              y2: middle.y - height,
              stroke: colour,
            }),

            ...[...Array(numberOfStavesBetweenStartAndMiddle).keys()]
              .map((i) => i + 1)
              .map((i) =>
                svg('g', [
                  svg('line', {
                    x1: props.staveStartX,
                    x2: props.staveEndX,
                    y1: inBetweenStartAndMiddleY(i),
                    y2: inBetweenStartAndMiddleY(i),
                    stroke: colour,
                  }),
                  svg('line', {
                    x1: props.staveStartX,
                    x2: props.staveStartX,
                    y1: inBetweenStartAndMiddleY(i),
                    y2: inBetweenStartAndMiddleY(i) + offset,
                    stroke: colour,
                  }),
                  svg('line', {
                    x1: props.staveEndX,
                    x2: props.staveEndX,
                    y1: inBetweenStartAndMiddleY(i),
                    y2: inBetweenStartAndMiddleY(i) + offset,
                    stroke: colour,
                  }),
                ])
              ),
          ]),
      middle.y === end.y
        ? svg('line', {
            x1: middle.beforeX,
            x2: end.afterX,
            y1: middle.y - height,
            y2: end.y - height,
            stroke: colour,
          })
        : svg('g', [
            svg('line', {
              x1: middle.beforeX,
              x2: props.staveEndX,
              y1: middle.y - height,
              y2: middle.y - height,
              stroke: colour,
            }),
            svg('line', {
              x1: props.staveEndX,
              x2: props.staveEndX,
              y1: middle.y - mid,
              y2: middle.y - height,
              stroke: colour,
            }),

            svg('line', {
              x1: props.staveStartX,
              x2: end.afterX,
              y1: end.y - height,
              y2: end.y - height,
              stroke: colour,
            }),
            svg('line', {
              x1: props.staveStartX,
              x2: props.staveStartX,
              y1: end.y - mid,
              y2: end.y - height,
              stroke: colour,
            }),

            ...[...Array(numberOfStavesBetweenMiddleAndEnd).keys()]
              .map((i) => i + 1)
              .map((i) =>
                svg('g', [
                  svg('line', {
                    x1: props.staveStartX,
                    x2: props.staveEndX,
                    y1: inBetweenMiddleAndEndY(i),
                    y2: inBetweenMiddleAndEndY(i),
                    stroke: colour,
                  }),
                  svg('line', {
                    x1: props.staveStartX,
                    x2: props.staveStartX,
                    y1: inBetweenMiddleAndEndY(i),
                    y2: inBetweenMiddleAndEndY(i) + offset,
                    stroke: colour,
                  }),
                  svg('line', {
                    x1: props.staveEndX,
                    x2: props.staveEndX,
                    y1: inBetweenMiddleAndEndY(i),
                    y2: inBetweenMiddleAndEndY(i) + offset,
                    stroke: colour,
                  }),
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
          svg('line', {
            x1: x,
            x2: x,
            y1: y - height,
            y2: y - mid,
            stroke: colour,
          }),
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
                  clickSecondTiming(
                    secondTiming,
                    part as 'start' | 'middle' | 'end'
                  )
                ),
            }
          ),
        ])
      ),
    ]);
  } else {
    console.error('invalid second timing!');
    return svg('g');
  }
}
