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

import { ID } from '../global/id';

import { SecondTimingModel } from '../SecondTiming/model';
import SecondTiming from '../SecondTiming/functions';

export function addSecondTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      const { bar: start } = location(state.selection.start, state.score);
      let middle: ID | null = null;
      let end: ID | null = null;
      let started = false;
      all: for (const stave of state.score.staves) {
        for (const bar of stave.bars) {
          if (started) {
            middle = bar.id;
            end = bar.id;
            break all;
          }
          if (bar === start) {
            started = true;
          }
        }
      }
      if (middle && end) {
        const newSecondTiming = SecondTiming.init(start.id, middle, end);
        if (SecondTiming.isValid(newSecondTiming, state.score.secondTimings)) {
          return shouldSave({
            ...state,
            score: {
              ...state.score,
              secondTimings: [...state.score.secondTimings, newSecondTiming],
            },
          });
        }
      }
    }
    return noChange(state);
  };
}

export function clickSecondTiming(
  secondTiming: SecondTimingModel,
  part: 'start' | 'middle' | 'end'
): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...state,
      secondTiming: {
        dragged: { secondTiming, dragged: part },
        selected: secondTiming,
      },
    });
}
