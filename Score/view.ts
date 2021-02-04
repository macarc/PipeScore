/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg, SvgRef, scoreWidth, scoreHeight, staveGap } from '../all';
import Stave  from '../Stave/view';
import { StaveModel } from '../Stave/model';
import TextBox  from '../TextBox/view';
import SecondTiming  from '../SecondTiming/view';
import ScoreSelection from '../ScoreSelection/view';
import { ScoreSelectionModel } from '../ScoreSelection/model';
import { ScoreEvent } from '../Event';

import { ScoreModel } from './model';

// TODO remove these
interface ScoreProps {
  updateView: (score: ScoreModel) => void,
  svgRef: SvgRef,
  zoomLevel: number,
  selection: ScoreSelectionModel | null,
  dispatch: (e: ScoreEvent) => void
}

export default function render(score: ScoreModel, props: ScoreProps): Svg {
  const margin = 30;
  const topOffset = 150;

  const staveProps = (stave: StaveModel, index: number) => ({
    x: margin,
    y: index * staveGap + topOffset,
    width: scoreWidth - 2 * margin,
    // || null so it is not 'undefined' but 'null'
    previousStave: score.staves[index - 1] || null,
    dispatch: props.dispatch
  });

  return svg`<svg ref=${props.svgRef} width=${scoreWidth * props.zoomLevel / 100} height=${scoreHeight * props.zoomLevel / 100} viewBox=${`0 0 ${scoreWidth} ${scoreHeight}`} onmouseup=${() => props.dispatch({ name: 'mouse up' })}>
    <rect x="0" y="0" width="100%" onmousedown=${() => props.dispatch({ name: 'background clicked' })} height="100%" fill="white" />

    ${score.staves.map((stave,idx) => svg.for(stave)`
      ${Stave(stave, staveProps(stave,idx))}
    `)}

    ${score.textBoxes.map(textBox => svg.for(textBox)`${TextBox(textBox, { dispatch: props.dispatch })}`)}


    ${score.secondTimings.map(secondTiming => svg.for(secondTiming)`${SecondTiming(secondTiming)}`)}

    ${props.selection ? ScoreSelection(props.selection) : null}
  </svg>`;
}

