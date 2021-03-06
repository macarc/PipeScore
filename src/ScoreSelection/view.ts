/*
   ScoreSelection/view.ts - selection (orange box)
   Copyright (C) 2020 Archie Maclean
 */
import { svg, V } from '../render/h';
import { lineGap } from '../global/constants';
import { getXY } from '../global/xy';

import { ScoreSelectionModel } from './model';

export default function render(selection: ScoreSelectionModel): V {
  const start = getXY(selection.start);
  const end = getXY(selection.end);
  if (!start || !end) {
    console.error('Invalid note in selection');
    return svg('g');
  }

  const width = end.afterX - start.beforeX;
  const height = 6 * lineGap;

  return svg('g', { class: 'selection' }, [
             svg('rect', { x: start.beforeX, y: start.y - lineGap, width, height, fill: 'orange', opacity: 0.5, 'pointer-events': 'none' })
  ]);
}
