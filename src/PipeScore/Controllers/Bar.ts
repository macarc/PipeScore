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

import { Bar, Anacrusis } from '../Bar/model';
import { Barline } from '../Bar/barline';
import { Score } from '../Score/model';
import { TimeSignature } from '../TimeSignature/model';

import { itemBefore } from '../global/xy';
import { ScoreSelection } from '../Selection/model';

function setTimeSignatureFrom(
  timeSignature: TimeSignature,
  newTimeSignature: TimeSignature,
  score: Score
): Score {
  Bar.setTimeSignatureFrom(timeSignature, newTimeSignature, score.bars());
  return score;
}
export function editTimeSignature(
  timeSignature: TimeSignature,
  newTimeSignature: TimeSignature
): ScoreEvent {
  return async (state: State) =>
    shouldSave({
      ...state,
      score: setTimeSignatureFrom(timeSignature, newTimeSignature, state.score),
    });
}
// TODO put this into Stave class

export function addAnacrusis(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);
      stave.insertBar(new Anacrusis(bar.timeSignature()), bar, before);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function addBar(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar, stave } = location(state.selection.start, state.score);
      stave.insertBar(new Bar(bar.timeSignature()), bar, before);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function clickBar(bar: Bar, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      if (itemBefore(state.selection.end, bar.id)) {
        state.selection.end = bar.id;
        return viewChanged(state);
      } else if (itemBefore(bar.id, state.selection.end)) {
        state.selection.start = bar.id;
        return viewChanged(state);
      }
    }
    return viewChanged({
      ...state,
      selection: new ScoreSelection(bar.id, bar.id),
    });
  };
}

export function setBarRepeat(
  which: 'start' | 'end',
  what: Barline
): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = location(state.selection.start, state.score);
      bar.setBarline(which, what);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function editBarTimeSignature(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = location(state.selection.start, state.score);
      const newTimeSignature = await bar.timeSignature().edit();
      return shouldSave({
        ...state,
        score: setTimeSignatureFrom(
          bar.timeSignature(),
          newTimeSignature,
          state.score
        ),
      });
    }
    return noChange(state);
  };
}
