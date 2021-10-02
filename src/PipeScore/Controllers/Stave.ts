/*
  Controller for stave events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, shouldSave, location } from './Controller';
import { State } from '../State';

import Score from '../Score/functions';
import Selection from '../Selection/functions';

export function addStave(before: boolean): ScoreEvent {
  return async (state: State) => {
    const stave = Selection.isScoreSelection(state.selection)
      ? location(state.selection.start, state.score).stave
      : state.score.staves[state.score.staves.length - 1];

    return shouldSave({
      ...state,
      score: Score.addStave(state.score, stave, before),
    });
  };
}
