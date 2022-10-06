/*
  Controller for second timing events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, noteLocation, Update } from './common';
import { State } from '../State';
import { ScoreSelection, SecondTimingSelection } from '../Selection';
import {
  SecondTiming,
  SingleTiming,
  Timing,
  TimingPart,
} from '../SecondTiming';

export function addSingleTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = noteLocation(state.selection.start, state.score);
      state.score.addSecondTiming(new SingleTiming(bar.id, bar.id));
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function addSecondTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar: start } = noteLocation(state.selection.start, state.score);
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
  secondTiming: Timing,
  part: TimingPart
): ScoreEvent {
  return async (state: State) => {
    state.selection = new SecondTimingSelection(secondTiming, part);
    return Update.ViewChanged;
  };
}
