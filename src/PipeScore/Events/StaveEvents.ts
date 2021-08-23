import { ScoreEvent, shouldSave, currentBar } from './Event';
import { State } from '../State';

import Score from '../Score/functions';

export function addStave(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      const { stave } = currentBar(state.selection.start, state.score);
      return shouldSave({
        ...state,
        score: Score.addStave(state.score, stave, before),
      });
    } else {
      return shouldSave({
        ...state,
        score: Score.addStave(
          state.score,
          state.score.staves[state.score.staves.length - 1],
          before
        ),
      });
    }
  };
}
