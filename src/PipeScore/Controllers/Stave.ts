/*
  Controller for stave events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, shouldSave, location } from './Controller';
import { State } from '../State';
import { ScoreSelection } from '../Selection';

export function addStave(before: boolean): ScoreEvent {
  return async (state: State) => {
    const stave =
      state.selection instanceof ScoreSelection
        ? location(state.selection.start, state.score).stave
        : state.score.lastStave();

    state.score.addStave(stave, before);
    return shouldSave(state);
  };
}
