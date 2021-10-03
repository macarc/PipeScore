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
  UpdatedState,
} from './Controller';
import { State } from '../State';

import { deleteSelectedNotes, dragNote } from './Note';
import { changeGracenoteFrom } from './Gracenote';
import { replaceTextBox } from './Text';

import SecondTiming from '../SecondTiming/functions';
import TextBox from '../TextBox/functions';

import { Pitch } from '../global/pitch';
import { replace } from '../global/utils';
import { closestItem } from '../global/xy';
import { TextBoxModel } from '../TextBox/model';
import { Gracenote, NoGracenote } from '../Gracenote/model';
import { DraggedSecondTiming, SecondTimingModel } from '../SecondTiming/model';
import {
  ScoreSelection,
  SecondTimingSelection,
  TextSelection,
} from '../Selection/model';

const deleteGracenote = (gracenote: Gracenote, state: State) => ({
  ...state,
  score: changeGracenoteFrom(gracenote, new NoGracenote(), state.score),
  gracenote: { ...state.gracenote, selected: null },
});

const deleteText = (text: TextBoxModel, state: State) => ({
  ...state,
  score: {
    ...state.score,
    textBoxes: replace(text, 1, state.score.textBoxes),
  },
  text: { dragged: null, selected: null },
});

const deleteSecondTiming = (secondTiming: SecondTimingModel, state: State) => ({
  ...state,
  score: {
    ...state.score,
    secondTimings: replace(secondTiming, 1, state.score.secondTimings),
  },
  draggedSecondTiming: null,
});

export function deleteSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.gracenote.selected) {
      return shouldSave(deleteGracenote(state.gracenote.selected, state));
    } else if (state.selection instanceof ScoreSelection) {
      return shouldSave(deleteSelectedNotes(state));
    } else if (state.selection instanceof TextSelection) {
      return shouldSave(deleteText(state.selection.text, state));
    } else if (state.selection instanceof SecondTimingSelection) {
      return shouldSave(
        deleteSecondTiming(state.selection.secondTiming, state)
      );
    }

    return noChange(state);
  };
}

export function mouseMoveOver(pitch: Pitch): ScoreEvent {
  return async (state: State) => {
    // This occurs when the note's head is changed from receiving pointer events to not receiving them.
    // That triggers a mouseOver on the note box below, which is undesirable as it moves the note head.
    if (state.justClickedNote)
      return noChange({ ...state, justClickedNote: false });

    // We return viewChanged from everything since we only want to save when the note is released
    if (state.note.demo && state.note.demo.pitch !== pitch) {
      // Update the demo note
      return viewChanged({
        ...state,
        note: { ...state.note, demo: { ...state.note.demo, pitch: pitch } },
      });
    } else if (state.note.dragged && state.note.dragged.pitch !== pitch) {
      return dragNote(state.note.dragged, pitch, state);
    } else if (state.gracenote.dragged) {
      return { update: state.gracenote.dragged.drag(pitch), state };
    }
    return noChange(state);
  };
}
export function mouseUp(): ScoreEvent {
  return async (state: State) =>
    state.note.dragged ||
    state.gracenote.dragged ||
    state.draggedText ||
    state.draggedSecondTiming
      ? shouldSave({
          ...state,
          note: { ...state.note, dragged: null },
          gracenote: { ...state.gracenote, dragged: null },
          draggedText: null,
          draggedSecondTiming: null,
        })
      : noChange(state);
}

function dragSecondTiming(
  secondTiming: DraggedSecondTiming,
  x: number,
  y: number,
  state: State
): UpdatedState {
  const closest = closestItem(x, y, secondTiming.dragged !== 'end');
  const oldSecondTiming = secondTiming.secondTiming;
  if (secondTiming.secondTiming[secondTiming.dragged] !== closest) {
    const newSecondTiming = {
      ...secondTiming.secondTiming,
      [secondTiming.dragged]: closest,
    };
    if (
      SecondTiming.isValid(
        newSecondTiming,
        state.score.secondTimings.filter((st) => st !== oldSecondTiming)
      )
    ) {
      return viewChanged({
        ...state,
        selection: new SecondTimingSelection(newSecondTiming),
        draggedSecondTiming: {
          ...secondTiming,
          secondTiming: newSecondTiming,
        },
        score: {
          ...state.score,
          secondTimings: replace(
            secondTiming.secondTiming,
            1,
            state.score.secondTimings,
            newSecondTiming
          ),
        },
      });
    }
  }
  return noChange(state);
}
export function mouseDrag(x: number, y: number): ScoreEvent {
  return async (state: State) => {
    if (state.draggedSecondTiming) {
      return dragSecondTiming(state.draggedSecondTiming, x, y, state);
    } else if (
      state.draggedText !== null &&
      x < state.score.width &&
      x > 0 &&
      y < state.score.height &&
      y > 0
    ) {
      const newText = TextBox.setCoords(state.draggedText, x, y);
      return viewChanged({
        ...state,
        score: replaceTextBox(state.score, state.draggedText, newText),
        draggedText: newText,
        selection: new TextSelection(newText),
      });
    }
    return noChange(state);
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
