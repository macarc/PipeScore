/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg, flatten } from './all';
import { GroupNoteModel } from './Note';
import { BarModel } from './Bar';
import Stave, { StaveModel } from './Stave';
import TextBox, { TextBoxModel } from './TextBox';
import SecondTiming, { SecondTimingModel } from './SecondTiming';
import { dispatch } from './Controller';

export interface ScoreModel {
  staves: StaveModel[],
  // an array rather than a set since it makes rendering easier (with map)
  textBoxes: TextBoxModel[],
  secondTimings: SecondTimingModel[]
}

function groupNotes(score: ScoreModel): GroupNoteModel[] {
  return flatten(score.staves.map(stave => Stave.groupNotes(stave)));
}
function bars(score: ScoreModel): BarModel[] {
  return flatten(score.staves.map(stave => Stave.bars(stave)));
}
function staves(score: ScoreModel): StaveModel[] {
  return score.staves;
}

export function addStaveToScore(score: ScoreModel, afterStave: StaveModel) {
  const ind = score.staves.indexOf(afterStave);
  if (ind !== -1)
    score.staves.splice(ind + 1, 0, Stave.init());
}

export function deleteStaveFromScore(score: ScoreModel, stave: StaveModel) {
  const ind = score.staves.indexOf(stave);
  if (ind !== -1)
    score.staves.splice(ind, 1);
}

interface ScoreProps {
  svgRef: any,
  zoomLevel: number
}

function render(score: ScoreModel, props: ScoreProps): Svg {
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

  const textBoxProps = (textBox: TextBoxModel, index: number) => ({
    id: index
  });

  return svg`<svg ref=${props.svgRef} width=${width * props.zoomLevel / 100} height=${height * props.zoomLevel / 100} viewBox=${`0 0 ${width} ${height}`} onmouseup=${() => dispatch({ name: 'mouse up' })}>
    <rect x="0" y="0" width="100%" onmousedown=${() => dispatch({ name: 'background clicked' })} height="100%" fill="white" />

    ${score.staves.map((stave,idx) => svg.for(stave)`
      ${Stave.render(stave, staveProps(stave,idx))}
    `)}

    ${score.textBoxes.map((textBox, idx) => svg.for(textBox)`${TextBox.render(textBox, textBoxProps(textBox, idx))}`)}


    ${score.secondTimings.map((secondTiming) => svg.for(secondTiming)`${SecondTiming.render(secondTiming)}`)}
  </svg>`;
};


const init: () => ScoreModel = () => {
  const firstStave = Stave.init();
  const secondStave = Stave.init();
  return ({
  staves: [firstStave,secondStave],
  textBoxes: [TextBox.init()],
  secondTimings: []
})
};

export default {
  render,
  init,
  groupNotes,
  bars,
  staves
}
