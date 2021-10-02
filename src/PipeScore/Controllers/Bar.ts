/*
  Controller for bar-related events
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

import { Barline, BarModel } from '../Bar/model';
import { ScoreModel } from '../Score/model';
import { TimeSignatureModel } from '../TimeSignature/model';

import Score from '../Score/functions';
import Stave from '../Stave/functions';
import TimeSignature from '../TimeSignature/functions';

import { replace } from '../global/utils';
import { itemBefore } from '../global/xy';
import { ScoreSelection } from '../Selection/model';

function setTimeSignatureFrom(
  timeSignature: TimeSignatureModel,
  newTimeSignature: TimeSignatureModel,
  score: ScoreModel
): ScoreModel {
  // Replaces timeSignature with newTimeSignature, and flows forward

  // TODO make this immutable
  const bars = Score.bars(score);
  let atTimeSignature = false;
  for (const bar of bars) {
    if (bar.timeSignature === timeSignature) {
      bar.timeSignature = newTimeSignature;
      atTimeSignature = true;
      continue;
    }
    if (atTimeSignature) {
      if (TimeSignature.equal(bar.timeSignature, timeSignature)) {
        bar.timeSignature = TimeSignature.copy(newTimeSignature);
      } else {
        break;
      }
    }
  }

  return score;
}

export function editTimeSignature(
  timeSignature: TimeSignatureModel,
  newTimeSignature: TimeSignatureModel
): ScoreEvent {
  return async (state: State) =>
    shouldSave({
      ...state,
      score: setTimeSignatureFrom(timeSignature, newTimeSignature, state.score),
    });
}
export function addAnacrusis(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);
      return shouldSave({
        ...state,
        score: {
          ...state.score,
          staves: replace(
            stave,
            1,
            state.score.staves,
            Stave.addAnacrusis(stave, bar, before)
          ),
        },
      });
    }
    return noChange(state);
  };
}

export function addBar(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);
      return shouldSave({
        ...state,
        score: {
          ...state.score,
          staves: replace(
            stave,
            1,
            state.score.staves,
            Stave.addBar(stave, bar, before)
          ),
        },
      });
    }
    return noChange(state);
  };
}

export function clickBar(bar: BarModel, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      if (itemBefore(state.selection.end, bar.id)) {
        return viewChanged({
          ...state,
          selection: { ...state.selection, end: bar.id },
        });
      } else if (itemBefore(bar.id, state.selection.end)) {
        return viewChanged({
          ...state,
          selection: { ...state.selection, start: bar.id },
        });
      }
    }
    return viewChanged({
      ...state,
      selection: new ScoreSelection(bar.id, bar.id),
    });
  };
}

export function setBarRepeat(
  which: 'frontBarline' | 'backBarline',
  what: Barline
): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);

      return shouldSave({
        ...state,
        score: {
          ...state.score,
          staves: replace(stave, 1, state.score.staves, {
            ...stave,
            bars: replace(bar, 1, stave.bars, {
              ...bar,
              [which]: what,
            }),
          }),
        },
      });
    }
    return noChange(state);
  };
}

export function editBarTimeSignature(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = location(state.selection.start, state.score);
      const newTimeSignature = await TimeSignature.getNewInput(
        bar.timeSignature
      );
      return shouldSave({
        ...state,
        score: setTimeSignatureFrom(
          bar.timeSignature,
          newTimeSignature,
          state.score
        ),
      });
    }
    return noChange(state);
  };
}
