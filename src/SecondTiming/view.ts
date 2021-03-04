/*
   SecondTiming/view.ts - second timing implementation
   Copyright (C) 2020 Archie Maclean
 */
import { svg, V } from '../render/h';
import { getXY } from '../global/state';

import { SecondTimingModel } from './model';



export default function render(secondTiming: SecondTimingModel): V {
  const start = getXY(secondTiming.start);
  const middle = getXY(secondTiming.middle);
  const end = getXY(secondTiming.end);
  const height = 35;
  const mid = 20;
  if (start && middle && end) {
    return svg('g', { class: 'second-timing' }, [
      svg('line', { x1: start.beforeX, x2: middle.afterX, y1: start.y - height, y2: middle.y - height, stroke: 'black' }),
      svg('line', { x1: middle.afterX, x2: end.afterX, y1: middle.y - height, y2: middle.y - height, stroke: 'black' }),

      ...[[start.beforeX, start.y], [middle.afterX, middle.y], [end.afterX, end.y]].map(([x, y]) => svg('line', { x1: x, x2: x, y1: y - height, y2: y - mid, stroke: 'black' }))
    ]);
  } else {
    console.error('invalid second timing!');
    return svg('g');
  }
}
