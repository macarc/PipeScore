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
import ScoreSelection, { ScoreSelectionModel } from './ScoreSelection';
import { SvgRef, dispatch } from './Controller';

export interface ScoreModel {
  staves: StaveModel[],
  // an array rather than a set since it makes rendering easier (with map)
  textBoxes: TextBoxModel[],
  secondTimings: SecondTimingModel[]
}
export const scoreWidth = 210 * 5;
export const scoreHeight = 297 * 5;
export const staveGap = 100;

function groupNotes(score: ScoreModel): GroupNoteModel[] {
  return flatten(score.staves.map(stave => Stave.groupNotes(stave)));
}
function bars(score: ScoreModel): BarModel[] {
  return flatten(score.staves.map(stave => Stave.bars(stave)));
}
function staves(score: ScoreModel): StaveModel[] {
  return score.staves;
}

export function addStaveToScore(score: ScoreModel, afterStave: StaveModel): void {
  const ind = score.staves.indexOf(afterStave);
  if (ind !== -1)
    score.staves.splice(ind + 1, 0, Stave.init());
}

export function deleteStaveFromScore(score: ScoreModel, stave: StaveModel): void {
  const ind = score.staves.indexOf(stave);
  if (ind !== -1)
    score.staves.splice(ind, 1);
}

interface ScoreProps {
  svgRef: SvgRef,
  zoomLevel: number,
  selection: ScoreSelectionModel | null
}

function render(score: ScoreModel, props: ScoreProps): Svg {
  const margin = 30;
  const topOffset = 150;

  const staveProps = (stave: StaveModel, index: number) => ({
    x: margin,
    y: index * staveGap + topOffset,
    width: scoreWidth - 2 * margin,
    // || null so it is not 'undefined' but 'null'
    previousStave: score.staves[index - 1] || null,
  });

  return svg`<svg ref=${props.svgRef} width=${scoreWidth * props.zoomLevel / 100} height=${scoreHeight * props.zoomLevel / 100} viewBox=${`0 0 ${scoreWidth} ${scoreHeight}`} onmouseup=${() => dispatch({ name: 'mouse up' })}>
    <rect x="0" y="0" width="100%" onmousedown=${() => dispatch({ name: 'background clicked' })} height="100%" fill="white" />

    ${score.staves.map((stave,idx) => svg.for(stave)`
      ${Stave.render(stave, staveProps(stave,idx))}
    `)}

    ${score.textBoxes.map(textBox => svg.for(textBox)`${TextBox.render(textBox)}`)}


    ${score.secondTimings.map(secondTiming => svg.for(secondTiming)`${SecondTiming.render(secondTiming)}`)}

    ${props.selection ? ScoreSelection.render(props.selection) : null}
  </svg>`;
}


const init: () => ScoreModel = () => {
  return ({
  staves: [Stave.init(),Stave.init()],
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
