/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { V, svg } from '../render/h';
import { SvgRef } from '../global/svg';
import { scoreWidth, scoreHeight, staveGap } from '../global/constants';

import { ScoreModel } from './model';
import { StaveModel } from '../Stave/model';
import { ScoreSelectionModel } from '../ScoreSelection/model';
import { Dispatch } from '../Event';

import renderTextBox, { TextBoxState }  from '../TextBox/view';
import renderSecondTiming  from '../SecondTiming/view';
import renderScoreSelection from '../ScoreSelection/view';
import renderStave  from '../Stave/view';
import { NoteState } from '../Note/view';
import { GracenoteState } from '../Gracenote/view';

interface ScoreProps {
  updateView: (score: ScoreModel) => void,
  svgRef: SvgRef,
  zoomLevel: number,
  selection: ScoreSelectionModel | null,
  dispatch: Dispatch,
  noteState: NoteState,
  gracenoteState: GracenoteState,
  textBoxState: TextBoxState
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
    dispatch: props.dispatch,
    noteState: props.noteState,
    gracenoteState: props.gracenoteState
  });

  // TODO bind svgRef somehow
  return svg('svg',
             { width: (scoreWidth * props.zoomLevel / 100),
               height: (scoreHeight * props.zoomLevel / 100),
               viewBox: `0 0 ${scoreWidth} ${scoreHeight}`
             },
             { mouseup: () => props.dispatch({ name: 'mouse up' }) },
             [ svg('rect',
                   { x: '0', y: '0', width: '100%', height: '100%', fill: 'white' },
                   { mousedown: () => props.dispatch({ name: 'background clicked' }) }),
               ...score.staves.map((stave, idx) => renderStave(stave, staveProps(stave, idx))),
               ...score.textBoxes.map(textBox => renderTextBox(textBox, { dispatch: props.dispatch, state: props.textBoxState })),
               ...score.secondTimings.map(secondTiming => renderSecondTiming(secondTiming)),
               props.selection ? renderScoreSelection(props.selection) : null
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

