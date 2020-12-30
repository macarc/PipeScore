import { svg } from 'uhtml';
import { Svg, flatten } from './all';
import { GroupNoteModel } from './Note';
import { BarModel } from './Bar';
import Stave, { StaveModel } from './Stave';
import { dispatch } from './Controller';

export interface ScoreModel {
  staves: StaveModel[]
}

function groupNotes(score: ScoreModel): GroupNoteModel[] {
  return flatten(score.staves.map(stave => Stave.groupNotes(stave)));
}
function bars(score: ScoreModel): BarModel[] {
  return flatten(score.staves.map(stave => Stave.bars(stave)));
}

function render(score: ScoreModel): Svg {
  const width = 210 * 5;
  const height = 297 * 5;
  const margin = 30;
  const staveGap = 100;
  const topOffset = 150;
  
  const staveProps = (stave: StaveModel, index: number) => ({
    x: margin,
    y: index * staveGap + topOffset,
    width: width - 2 * margin,
    // || null so it is not 'undefined' but 'null'
    previousStave: score.staves[index - 1] || null,
  });

  return svg`<svg width=${width} height=${height} onmouseup=${() => dispatch({ name: 'mouse up' })}>
    <rect x="0" y="0" width="100%" onmousedown=${() => dispatch({ name: 'background clicked' })} height="100%" fill="white" />

    ${score.staves.map((stave,idx) => svg.for(stave)`
      ${Stave.render(stave, staveProps(stave,idx))}
    `)}
  </svg>`;
};


const init: () => ScoreModel = () => ({
  staves: [Stave.init(),Stave.init()]
});

export default {
  render,
  init,
  groupNotes,
  bars
}
