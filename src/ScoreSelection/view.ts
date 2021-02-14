import { svg, V } from '../render/h';
import { lineGap } from '../global/constants';
import { getXY } from '../global/state';

import { ScoreSelectionModel } from './model';



export default function render(selection: ScoreSelectionModel): V {
  const start = getXY(selection.start.id);
  const end = getXY(selection.end.id);
  if (!start || !end) {
    return svg('g');
  }

  const width = end.afterX - start.beforeX;
  const height = 6 * lineGap;

  return svg('g', { class: 'selection' }, [
             svg('rect', { x: start.beforeX, y: start.y - lineGap, width, height, fill: 'orange', opacity: 0.5, 'pointer-events': 'none' })
  ]);

  /*
  return svg`<g class="selection">
    <rect x=${start.beforeX} y=${start.y - lineGap} width=${width} height=${height} fill="orange" opacity="0.4" pointer-events="none" />
  </g>`
  */
}
