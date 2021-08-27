import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  removeNoteState,
} from './Controller';
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
        text: { ...state.text, selected: newTextBox },
      });
    }
    return noChange(state);
  };
}

export function clickText(text: TextBoxModel): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...removeNoteState(state),
      text: { dragged: text, selected: text },
    });
}

export function centreText(): ScoreEvent {
  return async (state: State) => {
    if (state.text.selected !== null) {
      const newText = TextBox.toggleCentre(
        state.text.selected,
        state.score.width
      );
      return shouldSave({
        ...state,
        score: replaceTextBox(state.score, state.text.selected, newText),
        text: { dragged: null, selected: newText },
      });
    }
    return noChange(state);
  };
}

export function textMouseUp(): ScoreEvent {
  return async (state: State) =>
    shouldSave({ ...state, text: { ...state.text, dragged: null } });
}
