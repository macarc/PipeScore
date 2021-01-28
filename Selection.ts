import { svg } from 'uhtml';
import { Svg } from './all';
import { NoteModel } from './Note';
import { getXY } from './Controller';
import { staveGap } from './Score';
import { lineGap } from './all';


export interface ScoreSelection {
  start: NoteModel,
  end: NoteModel
}



export function selection(selection: ScoreSelection): Svg {
  const start = getXY(selection.start.id);
  const end = getXY(selection.end.id);
  if (!start || !end) {
    return svg``;
  }

  const width = end.afterX - start.beforeX;
  const height = 6 * lineGap;

  return svg`<g class="selection">
    <rect x=${start.beforeX} y=${start.y - lineGap} width=${width} height=${height} fill="orange" opacity="0.4" pointer-events="none" />
  </g>`
}
