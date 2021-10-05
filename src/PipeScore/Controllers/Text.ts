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

import TextBox from '../TextBox/functions';

import { TextBoxModel } from '../TextBox/model';
import { TextSelection } from '../Selection/model';

export function addText(): ScoreEvent {
  return async (state: State) => {
    state.score.addText(TextBox.init());
    return shouldSave(state);
  };
}

export function changeText(
  newText: string,
  newSize: number,
  text: TextBoxModel
): ScoreEvent {
  return async (state: State) => {
    if (newText !== text.text || newSize !== text.size) {
      text.text = newText;
      text.size = newSize;
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function clickText(text: TextBoxModel): ScoreEvent {
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
      TextBox.toggleCentre(state.selection.text);
      return shouldSave(state);
    }
    return noChange(state);
  };
}

export function textMouseUp(): ScoreEvent {
  return async (state: State) => shouldSave({ ...state, draggedText: null });
}
