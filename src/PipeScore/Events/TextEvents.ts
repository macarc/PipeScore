import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  removeNoteState,
} from './Event';
import { State } from '../State';
import { replace } from '../global/utils';

import { TextBoxModel } from '../TextBox/model';
import TextBox from '../TextBox/functions';
import { ScoreModel } from '../Score/model';

export function replaceTextBox(
  score: ScoreModel,
  textBox: TextBoxModel,
  newTextBox: TextBoxModel
): ScoreModel {
  return {
    ...score,
    textBoxes: replace(
      score.textBoxes.indexOf(textBox),
      1,
      score.textBoxes,
      newTextBox
    ),
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

export function editText(
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
        textBoxState: { ...state.textBoxState, selectedText: newTextBox },
      });
    }
    return noChange(state);
  };
}

export function clickText(text: TextBoxModel): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...removeNoteState(state),
      textBoxState: { ...state.textBoxState, selectedText: text },
      draggedText: text,
    });
}

export function centreText(): ScoreEvent {
  return async (state: State) => {
    if (state.textBoxState.selectedText !== null) {
      const newText = TextBox.toggleCentre(
        state.textBoxState.selectedText,
        state.score.width
      );
      return shouldSave({
        ...state,
        score: replaceTextBox(
          state.score,
          state.textBoxState.selectedText,
          newText
        ),
        textBoxState: { ...state.textBoxState, selectedText: newText },
        draggedText: null,
      });
    }
    return noChange(state);
  };
}

export function textMouseUp(): ScoreEvent {
  return async (state: State) => shouldSave({ ...state, draggedText: null });
}
