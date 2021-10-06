/*
  Controller for text events
  Copyright (C) 2021 Archie Maclean
*/
import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  removeNoteState,
} from './Controller';
import { State } from '../State';

import { TextBox } from '../TextBox';
import { TextSelection } from '../Selection';

export function addText(): ScoreEvent {
  return async (state: State) => {
    state.score.addText(new TextBox());
    return shouldSave(state);
  };
}

export function changeText(
  newText: string,
  newSize: number,
  text: TextBox
): ScoreEvent {
  return async (state: State) => {
    return { update: text.set(newText, newSize), state };
  };
}

export function clickText(text: TextBox): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...removeNoteState(state),
      draggedText: text,
      selection: new TextSelection(text),
    });
}

export function centreText(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof TextSelection) {
      state.selection.text.toggleCentre();
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function textMouseUp(): ScoreEvent {
  return async (state: State) => shouldSave({ ...state, draggedText: null });
}
