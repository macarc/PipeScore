/*
  Controller for mouse events (ish, this needs to be organised better)
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, Update, stopInputtingNotes } from './Controller';
import { State } from '../State';

import { Pitch } from '../global/pitch';
import { SingleNote } from '../Note';
import { Bar } from '../Bar';

export function deleteSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      state.selection.delete(state.score);
      state.selection = null;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function mouseOffPitch(): ScoreEvent {
  return async (state: State) => {
    if (state.demo) return state.demo.removePitch();
    return Update.NoChange;
  };
}
export function mouseOverPitch(
  pitch: Pitch,
  where: SingleNote | Bar
): ScoreEvent {
  return async (state: State) => {
    // We return viewChanged from everything since we only want to save when the note is released

    const mustUpdate = state.justAddedNote;
    state.justAddedNote = false;

    // This occurs when the note's head is changed from receiving pointer events to not receiving them.
    // That triggers a mouseOver on the note box below, which is undesirable as it moves the note head.
    if (state.justClickedNote) {
      state.justClickedNote = false;
      return Update.NoChange;
    }
    if (state.demo) {
      if (where instanceof Bar) {
        return state.demo.setPitch(pitch, null, where, null);
      } else {
        return state.demo.setPitch(
          pitch,
          where,
          state.score.location(where.id).bar,
          state.score.previousNote(where.id)
        );
      }
    } else if (state.selection && state.selection.dragging) {
      state.selection.dragOverPitch(pitch, state.score);
      return Update.ViewChanged;
    }
    return mustUpdate ? Update.ViewChanged : Update.NoChange;
  };
}
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
