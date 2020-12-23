import { svg } from 'uhtml';
import { Svg } from './all';
import Stave, { StaveModel } from './Stave';

export interface ScoreModel {
  staves: StaveModel[]
}

interface ScoreProps {
  updateScore: (newScore: ScoreModel) => void
}

function render(score: ScoreModel, props: ScoreProps): Svg {
  const width = 210 * 5;
  const height = 297 * 5;
  const margin = 30;
  const staveGap = 100;
  const topOffset = 150;
  const updateStave = (index: number) => (stave: StaveModel) => {
    score.staves[index] = stave;
    props.updateScore(score);
  }
  
  const staveProps = (stave: StaveModel, index: number) => ({
    x: margin,
    y: index * staveGap + topOffset,
    width: width - 2 * margin,
    // || null so it is not 'undefined' but 'null'
    previousStave: score.staves[index - 1] || null,
    updateStave: updateStave(index)
  });

  return svg`<svg width=${width} height=${height}>
    <rect x="0" y="0" width="100%" height="100%" fill="white" />

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
  init
}
