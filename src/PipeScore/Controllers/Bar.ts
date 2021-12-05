/*
  Controller for bar-related events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, noteLocation, Update } from './Controller';
import { State } from '../State';

import { Bar } from '../Bar';
import { Barline } from '../Bar/barline';
import { Score } from '../Score';
import { TimeSignature } from '../TimeSignature';

import { itemBefore } from '../global/xy';
import { ScoreSelection } from '../Selection';

export function moveLeftBarwise(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const prev = state.score.previousBar(state.selection.end);
      if (prev) state.selection = new ScoreSelection(prev.id, prev.id);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}
export function moveRightBarwise(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = state.score.nextBar(state.selection.end);
      if (next) state.selection = new ScoreSelection(next.id, next.id);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

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
  return async (state: State) => {
    setTimeSignatureFrom(timeSignature, newTimeSignature, state.score);
    return Update.ShouldSave;
  };
}
export function addAnacrusis(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      state.selection.addAnacrusis(before, state.score);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function addBar(before: boolean): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      state.selection.addBar(before, state.score);
      return Update.ShouldSave;
    }

    return Update.NoChange;
  };
}

export function clickBar(bar: Bar, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      if (itemBefore(state.selection.end, bar.id)) {
        state.selection.end = bar.id;
        return Update.ViewChanged;
      } else if (itemBefore(bar.id, state.selection.end)) {
        state.selection.start = bar.id;
        return Update.ViewChanged;
      }
    }
    state.selection = new ScoreSelection(bar.id, bar.id);
    return Update.ViewChanged;
  };
}

export function setBarRepeat(
  which: 'start' | 'end',
  what: Barline
): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = noteLocation(state.selection.start, state.score);
      bar.setBarline(which, what);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function editBarTimeSignature(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const { bar } = noteLocation(state.selection.start, state.score);
      const newTimeSignature = await bar.timeSignature().edit();
      setTimeSignatureFrom(bar.timeSignature(), newTimeSignature, state.score);
    } else {
      const bar = state.score.bars()[0];
      const newTimeSignature = await bar.timeSignature().edit();
      if (bar)
        setTimeSignatureFrom(
          bar.timeSignature(),
          newTimeSignature,
          state.score
        );
    }
    return Update.ShouldSave;
  };
}
