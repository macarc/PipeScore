/*
  Controller for mouse events (ish, this needs to be organised better)
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, Update } from './Controller';
import { State } from '../State';

import { Pitch } from '../global/pitch';
import { GracenoteSelection, ScoreSelection } from '../Selection';
import { SingleNote } from '../Note';
import { stopInputtingNotes } from './Note';

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

export function mouseOverPitch(
  pitch: Pitch,
  note: SingleNote | null
): ScoreEvent {
  return async (state: State) => {
    // We return viewChanged from everything since we only want to save when the note is released

    // This occurs when the note's head is changed from receiving pointer events to not receiving them.
    // That triggers a mouseOver on the note box below, which is undesirable as it moves the note head.
    if (state.justClickedNote) {
      state.justClickedNote = false;
      return Update.NoChange;
    }
    if (state.demo) {
      return state.demo.setPitch(pitch, note);
    } else if (
      state.selection instanceof ScoreSelection ||
      state.selection instanceof GracenoteSelection
    ) {
      return state.selection.mouseOverPitch(pitch);
    }
    return Update.NoChange;
  };
}
export function mouseUp(): ScoreEvent {
  return async (state: State) => {
    state.selection?.mouseUp();
    // Something could have been dragged
    return Update.ShouldSave;
  };
}
export function mouseDrag(x: number, y: number): ScoreEvent {
  return async (state: State) => {
    state.selection?.mouseDrag(x, y, state.score);
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
