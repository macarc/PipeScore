/*
   SecondTiming/view.ts - second timing implementation
   Copyright (C) 2020 Archie Maclean
 */
import { svg, V } from '../render/h';
import { getXY } from '../global/state';

import { Dispatch } from '../Event';

import { SecondTimingModel } from './model';

interface SecondTimingProps {
  dispatch: Dispatch
}

export default function render(secondTiming: SecondTimingModel, props: SecondTimingProps): V {
  const start = getXY(secondTiming.start);
  const middle = getXY(secondTiming.middle);
  const end = getXY(secondTiming.end);
  const height = 35;
  const mid = 20;
  const clickWidth = 10;
  if (start && middle && end) {
    return svg('g', { class: 'second-timing' }, [
      svg('line', { x1: start.beforeX, x2: middle.afterX, y1: start.y - height, y2: middle.y - height, stroke: 'black' }),
      svg('line', { x1: middle.afterX, x2: end.afterX, y1: middle.y - height, y2: middle.y - height, stroke: 'black' }),

      svg('text', { x: start.beforeX + 5, y: start.y - height / 2 }, ['1.']),
      svg('text', { x: middle.afterX + 5, y: middle.y - height / 2 }, ['2.']),

      ...[{ x: start.beforeX, y: start.y, part: 'start' }, { x: middle.afterX, y: middle.y, part: 'middle' }, { x: end.afterX, y: end.y, part: 'end' }].map(({ x, y, part }) => svg('g', [
        svg('line', { x1: x, x2: x, y1: y - height, y2: y - mid, stroke: 'black' }),
        svg('rect', { x: x - clickWidth / 2, y: y - height, width: clickWidth, height: height - mid, opacity: 0 }, { mousedown: () => props.dispatch({ name: 'click second timing', secondTiming, part: part as 'start' | 'middle' | 'end' }) }),
      ]))
    ]);
  } else {
    console.error('invalid second timing!');
    return svg('g');
  }
}
