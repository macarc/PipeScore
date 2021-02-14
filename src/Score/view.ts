/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { V, svg } from '../render/h';
import { Svg, SvgRef } from '../global/svg';
import { scoreWidth, scoreHeight, staveGap } from '../global/constants';

import { ScoreModel } from './model';
import { StaveModel } from '../Stave/model';
import { ScoreSelectionModel } from '../ScoreSelection/model';
import { Dispatch } from '../Event';

import TextBox  from '../TextBox/view';
import SecondTiming  from '../SecondTiming/view';
import ScoreSelection from '../ScoreSelection/view';

import renderStave  from '../Stave/view';

interface ScoreProps {
  updateView: (score: ScoreModel) => void,
  svgRef: SvgRef,
  zoomLevel: number,
  selection: ScoreSelectionModel | null,
  dispatch: Dispatch
}

export default function render(score: ScoreModel, props: ScoreProps): V {
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

  return svg('svg',
             { width: (scoreWidth * props.zoomLevel / 100).toString()
             , height: (scoreHeight * props.zoomLevel / 100).toString()
             , viewBox: `0 0 ${scoreWidth} ${scoreHeight}`
             },
             { mouseup: () => props.dispatch({ name: 'mouse up' }) },
             [ svg('rect',
                   { x: '0', y: '0', width: '100%', height: '100%', fill: 'white' },
                   { mousedown: () => props.dispatch({ name: 'background clicked' }) })
             ])


             /*
  return svg`<svg ref=${props.svgRef} width=${scoreWidth * props.zoomLevel / 100} height=${scoreHeight * props.zoomLevel / 100} viewBox=${`0 0 ${scoreWidth} ${scoreHeight}`} onmouseup=${() => props.dispatch({ name: 'mouse up' })}>
    <rect x="0" y="0" width="100%" onmousedown=${() => props.dispatch({ name: 'background clicked' })} height="100%" fill="white" />

    ${score.staves.map((stave,idx) => svg.for(stave)`
      ${renderStave(stave, staveProps(stave,idx))}
    `)}

    ${score.textBoxes.map(textBox => svg.for(textBox)`${TextBox(textBox, { dispatch: props.dispatch })}`)}


    ${score.secondTimings.map(secondTiming => svg.for(secondTiming)`${SecondTiming(secondTiming)}`)}

    ${props.selection ? ScoreSelection(props.selection) : null}
  </svg>`;
  */
}

