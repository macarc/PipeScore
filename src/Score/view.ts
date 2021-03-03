/*
  Score.ts - Score implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { V, svg } from '../render/h';
import { scoreWidth, scoreHeight, staveGap, lineGap } from '../global/constants';

import { ScoreModel } from './model';
import { StaveModel } from '../Stave/model';
import { DemoNoteModel } from '../DemoNote/model';
import { ScoreSelectionModel } from '../ScoreSelection/model';
import { Dispatch } from '../Event';

import renderTextBox, { TextBoxState }  from '../TextBox/view';
import renderSecondTiming  from '../SecondTiming/view';
import renderScoreSelection from '../ScoreSelection/view';
import renderStave  from '../Stave/view';
import renderDemoNote from '../DemoNote/view';
import { NoteState } from '../Note/view';
import { GracenoteState } from '../Gracenote/view';

interface ScoreProps {
  updateView: (score: ScoreModel) => void,
  zoomLevel: number,
  selection: ScoreSelectionModel | null,
  dispatch: Dispatch,
  noteState: NoteState,
  demoNote: DemoNoteModel | null,
  gracenoteState: GracenoteState,
  textBoxState: TextBoxState
}
const margin = 30;
const topOffset = 150;

export function coordinateToStaveIndex(y: number): number | null {
  const offset = (y + 4 * lineGap - topOffset);
  console.log(offset);
  if (offset > 0 && (offset % staveGap) <= (12 * lineGap)) {
    return Math.max(Math.floor(offset / staveGap), 0);
  } else {
    return null;
  }
}


export default function render(score: ScoreModel, props: ScoreProps): V {
  const staveProps = (stave: StaveModel, index: number) => ({
    x: margin,
    y: index * staveGap + topOffset,
    width: scoreWidth - 2 * margin,
    // || null so it is not 'undefined' but 'null'
    previousStave: score.staves[index - 1] || null,
    previousStaveY: (index - 1) * staveGap + topOffset,
    dispatch: props.dispatch,
    noteState: props.noteState,
    gracenoteState: props.gracenoteState
  });

  const demoNoteProps = props.demoNote && ({
    staveY: topOffset + staveGap * props.demoNote.staveIndex
  });

  // TODO bind svgRef somehow
  return svg('svg',
             { id: 'score-svg',
               width: (scoreWidth * props.zoomLevel / 100),
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
                       props.selection ? renderScoreSelection(props.selection) : null,
                       (props.demoNote && demoNoteProps) ? renderDemoNote(props.demoNote, demoNoteProps) : svg('g')
             ])
}

