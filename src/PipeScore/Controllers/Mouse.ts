/*
  Controller for mouse events (ish, this needs to be organised better)
  Copyright (C) 2021 Archie Maclean
*/
import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  removeState,
} from './Controller';
import { State } from '../State';

import { Pitch } from '../global/pitch';
import { GracenoteSelection, ScoreSelection } from '../Selection';

export function deleteSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      state.selection.delete(state.score);
      state.selection = null;
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function mouseOverPitch(pitch: Pitch): ScoreEvent {
  return async (state: State) => {
    // We return viewChanged from everything since we only want to save when the note is released

    // This occurs when the note's head is changed from receiving pointer events to not receiving them.
    // That triggers a mouseOver on the note box below, which is undesirable as it moves the note head.
    if (state.justClickedNote)
      return noChange({ ...state, justClickedNote: false });
    if (state.note.demo) {
      state.note.demo.setPitch(pitch);
      return viewChanged(state);
    } else if (
      state.selection instanceof ScoreSelection ||
      state.selection instanceof GracenoteSelection
    ) {
      return { update: state.selection.mouseOverPitch(pitch), state };
    }
    return noChange(state);
  };
}
export function mouseUp(): ScoreEvent {
  return async (state: State) => {
    state.selection?.mouseUp();
    // Something could have been dragged
    return shouldSave(state);
  };
}
export function mouseDrag(x: number, y: number): ScoreEvent {
  return async (state: State) => {
    state.selection?.mouseDrag(x, y, state.score);
    return viewChanged(state);
  };
}

export function clickBackground(): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...removeState(state),
      note: { ...state.note, demo: null },
      gracenote: { ...state.gracenote, input: null },
    });
}
