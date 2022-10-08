/*
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, Update, stopInputtingNotes } from './common';
import { State } from '../State';

export function mouseUp(): ScoreEvent {
  return async (state: State) => {
    state.selection?.mouseUp();
    // Something could have been dragged
    return Update.ShouldSave;
  };
}

export function mouseDrag(x: number, y: number, page: number): ScoreEvent {
  return async (state: State) => {
    state.selection?.mouseDrag(x, y, state.score, page);
    return Update.ViewChanged;
  };
}

export function clickBackground(): ScoreEvent {
  return async (state: State) => {
    state.selection = null;
    stopInputtingNotes(state);
    return Update.ViewChanged;
  };
}
