/*
  Draw ScoreSelection (orange box around selected items)
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';
import { lineGap } from '../global/constants';
import { getXY } from '../global/xy';

import { ScoreSelectionModel } from './model';

interface ScoreSelectionProps {
  staveStartX: number;
  staveEndX: number;
  staveGap: number;
}

export default function render(
  selection: ScoreSelectionModel,
  props: ScoreSelectionProps
): V {
  const start = getXY(selection.start);
  const end = getXY(selection.end);
  if (!start || !end) {
    console.error('Invalid note in selection');
    return svg('g');
  }

  const height = 6 * lineGap;

  if (end.y !== start.y) {
    const higher = start.y > end.y ? end : start;
    const lower = start.y > end.y ? start : end;
    const numStavesBetween =
      Math.round((lower.y - higher.y) / props.staveGap) - 1;
    return svg('g', { class: 'selection' }, [
      svg('rect', {
        x: higher.beforeX,
        y: higher.y - lineGap,
        width: props.staveEndX - higher.beforeX,
        height,
        fill: 'orange',
        opacity: 0.5,
        'pointer-events': 'none',
      }),
      svg('rect', {
        x: props.staveStartX,
        y: lower.y - lineGap,
        width: lower.afterX - props.staveStartX,
        height,
        fill: 'orange',
        opacity: 0.5,
        'pointer-events': 'none',
      }),
      ...[...Array(numStavesBetween).keys()]
        .map((i) => i + 1)
        .map((i) =>
          svg('rect', {
            x: props.staveStartX,
            y: higher.y + i * props.staveGap - lineGap,
            width: props.staveEndX - props.staveStartX,
            height,
            fill: 'orange',
            opacity: 0.5,
            'pointer-events': 'none',
          })
        ),
    ]);
  } else {
    const width = end.afterX - start.beforeX;
    return svg('g', { class: 'selection' }, [
      svg('rect', {
        x: start.beforeX,
        y: start.y - lineGap,
        width,
        height,
        fill: 'orange',
        opacity: 0.5,
        'pointer-events': 'none',
      }),
    ]);
  }
}
