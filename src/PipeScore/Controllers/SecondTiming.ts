/*
  Controller for second timing events
  Copyright (C) 2021 Archie Maclean
*/
import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  location,
} from './Controller';
import { State } from '../State';
import { ScoreSelection, SecondTimingSelection } from '../Selection/model';
import { SecondTiming } from '../SecondTiming/model';

export function addSecondTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar: start } = location(state.selection.start, state.score);
      let foundStart = false;
      for (const bar of state.score.bars()) {
        if (foundStart) {
          state.score.addSecondTiming(
            new SecondTiming(start.id, bar.id, bar.id)
          );
          return shouldSave(state);
        }
        if (bar === start) {
          foundStart = true;
        }
      }
    }
    return noChange(state);
  };
}

export function clickSecondTiming(
  secondTiming: SecondTiming,
  part: 'start' | 'middle' | 'end'
): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...state,
      selection: new SecondTimingSelection(secondTiming),
      draggedSecondTiming: { secondTiming, dragged: part },
    });
}
