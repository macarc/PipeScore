/*
  Controller for bar-related events
  Copyright (C) 2021 macarc
*/
import {
  ScoreEvent,
  noteLocation,
  Update,
  stopInputtingNotes,
  addToSelection,
} from './common';
import { State } from '../State';

import { Bar } from '../Bar';
import { Barline } from '../Bar/barline';
import { Score } from '../Score';
import { TimeSignature } from '../TimeSignature';

import { BarlineSelection, ScoreSelection } from '../Selection';

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
) {
  Bar.setTimeSignatureFrom(timeSignature, newTimeSignature, score.bars());
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
    const bar =
      state.selection instanceof ScoreSelection
        ? state.selection.bar(state.score)
        : before
        ? state.score.firstOnPage(0)
        : state.score.lastOnPage(0);

    if (bar) {
      const { stave } = state.score.location(bar.id);
      stave.insertBar(new Bar(bar.timeSignature(), true), bar, before);
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

export function clickBarline(drag: (x: number) => void): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    state.selection = new BarlineSelection(drag);
    return Update.ViewChanged;
  };
}
export function resetBarLength(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const bars = state.selection.bars(state.score);
      bars.forEach((bar) => (bar.fixedWidth = 'auto'));
      if (bars.length > 0) {
        const prev = state.score.previousBar(bars[0].id);
        if (prev) prev.fixedWidth = 'auto';
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
export function clickBar(bar: Bar, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      addToSelection(bar.id, state.selection);
      return Update.ViewChanged;
    }
    state.selection = new ScoreSelection(bar.id, bar.id);
    return Update.ViewChanged;
  };
}

export function setBarline(which: 'start' | 'end', what: Barline): ScoreEvent {
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
    const bar =
      state.selection instanceof ScoreSelection
        ? noteLocation(state.selection.start, state.score).bar
        : state.score.bars()[0];

    if (bar) {
      const newTimeSignature = await bar.timeSignature().edit();
      setTimeSignatureFrom(bar.timeSignature(), newTimeSignature, state.score);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
