/*
  Controller for second timing events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, location, Update } from './Controller';
import { State } from '../State';
import { ScoreSelection, SecondTimingSelection } from '../Selection';
import { SecondTiming } from '../SecondTiming';

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
          return Update.ShouldSave;
        }
        if (bar === start) {
          foundStart = true;
        }
      }
    }
    return Update.NoChange;
  };
}

export function clickSecondTiming(
  secondTiming: SecondTiming,
  part: 'start' | 'middle' | 'end'
): ScoreEvent {
  return async (state: State) => {
    state.selection = new SecondTimingSelection(secondTiming).drag(part);
    return Update.ViewChanged;
  };
}
