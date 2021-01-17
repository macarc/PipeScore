/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg, flatten, SvgRef } from './all';
import { GroupNoteModel } from './Note';
import { BarModel } from './Bar';
import Stave, { StaveModel, DisplayStave } from './Stave';
import TextBox, { TextBoxModel, DisplayTextBox } from './TextBox';
import SecondTiming, { SecondTimingModel, DisplaySecondTiming } from './SecondTiming';
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
const width = 210 * 5;
const height = 297 * 5;

function render(display: DisplayScore): Svg {

  return svg`<svg ref=${display.svgRef} width=${display.outerWidth} height=${display.outerHeight} viewBox=${`0 0 ${width} ${height}`} onmouseup=${() => dispatch({ name: 'mouse up' })}>
    <rect x="0" y="0" width="100%" onmousedown=${() => dispatch({ name: 'background clicked' })} height="100%" fill="white" />

    ${display.staves.map((stave) => svg.for(stave)`
      ${Stave.render(stave)}
    `)}

    ${display.textBoxes.map((textBox) => svg.for(textBox)`${TextBox.render(textBox)}`)}


    ${display.secondTimings.map((secondTiming) => svg.for(secondTiming)`${SecondTiming.render(secondTiming)}`)}
  </svg>`;
};

export interface DisplayScore {
  staves: DisplayStave[],
  textBoxes: DisplayTextBox[],
  secondTimings: DisplaySecondTiming[],
  outerWidth: number,
  outerHeight: number,
  svgRef: SvgRef
}


function prerender(score: ScoreModel, props: ScoreProps): DisplayScore {
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

  return ({
    staves: score.staves.map((stave, idx) => Stave.prerender(stave, staveProps(stave, idx))),
    textBoxes: score.textBoxes.map((textBox, idx) => TextBox.prerender(textBox, textBoxProps(textBox, idx))),
    secondTimings: score.secondTimings.map((secondTiming, idx) => SecondTiming.prerender(secondTiming)),
    outerWidth: width * props.zoomLevel / 100,
    outerHeight: height * props.zoomLevel / 100,
    svgRef: props.svgRef
  });
}


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
  prerender,
  render,
  init,
  groupNotes,
  bars,
  staves
}
