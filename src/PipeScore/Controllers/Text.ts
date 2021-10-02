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
import { replace } from '../global/utils';

import TextBox from '../TextBox/functions';

import { TextBoxModel } from '../TextBox/model';
import { ScoreModel } from '../Score/model';
import { TextSelection } from '../Selection/model';

export function replaceTextBox(
  score: ScoreModel,
  textBox: TextBoxModel,
  newTextBox: TextBoxModel
): ScoreModel {
  return {
    ...score,
    textBoxes: replace(textBox, 1, score.textBoxes, newTextBox),
  };
}
export function addText(): ScoreEvent {
  return async (state: State) =>
    shouldSave({
      ...state,
      score: {
        ...state.score,
        textBoxes: [...state.score.textBoxes, TextBox.init()],
      },
    });
}

export function changeText(
  newText: string,
  newSize: number,
  text: TextBoxModel
): ScoreEvent {
  return async (state: State) => {
    if (newText !== text.text || newSize !== text.size) {
      const newTextBox = {
        ...text,
        size: newSize,
        text: newText,
      };
      return shouldSave({
        ...state,
        score: replaceTextBox(state.score, text, newTextBox),
        selection: new TextSelection(newTextBox),
      });
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
      const newText = TextBox.toggleCentre(
        state.selection.text,
        state.score.width
      );
      return shouldSave({
        ...state,
        score: replaceTextBox(state.score, state.selection.text, newText),
        draggedText: null,
        selection: new TextSelection(newText),
      });
    }
    return noChange(state);
  };
}

export function textMouseUp(): ScoreEvent {
  return async (state: State) => shouldSave({ ...state, draggedText: null });
}
