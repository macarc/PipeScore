import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  removeState,
} from './Event';
import { State } from '../State';

import {
  deleteSelectedNotes,
  changeNoteFrom,
  changeTripletNoteFrom,
} from './NoteEvents';
import { changeGracenoteFrom } from './GracenoteEvents';
import { replaceTextBox } from './TextEvents';

import Note from '../Note/functions';
import SecondTiming from '../SecondTiming/functions';
import TextBox from '../TextBox/functions';

import { Pitch } from '../global/pitch';
import { replace } from '../global/utils';
import { closestItem } from '../global/xy';

export function deleteSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.gracenoteState.selected) {
      return shouldSave({
        ...state,
        score: changeGracenoteFrom(
          state.gracenoteState.selected,
          { type: 'none' },
          state.score
        ),
      });
    }
    if (state.selection) {
      return shouldSave(deleteSelectedNotes(state));
    }
    if (state.textBoxState.selectedText !== null) {
      return shouldSave({
        ...state,
        score: {
          ...state.score,
          textBoxes: replace(
            state.textBoxState.selectedText,
            1,
            state.score.textBoxes
          ),
        },
        textBoxState: { ...state.textBoxState, selectedText: null },
        draggedText: null,
      });
    }
    if (state.selectedSecondTiming) {
      return shouldSave({
        ...state,
        score: {
          ...state.score,
          secondTimings: replace(
            state.selectedSecondTiming,
            1,
            state.score.secondTimings
          ),
        },
        draggedSecondTiming: null,
      });
    }

    return noChange(state);
  };
}

export function mouseMoveOver(pitch: Pitch): ScoreEvent {
  return async (state: State) => {
    if (state.justClickedNote) {
      // This occurs when the note's head is changed from receiving pointer events to not receiving them.
      // That triggers a mouseOver on the note box below, which is undesirable as it moves the note head.
      return noChange({ ...state, justClickedNote: false });
    } else {
      if (state.demoNote && state.demoNote.pitch !== pitch) {
        return viewChanged({
          ...state,
          demoNote: { ...state.demoNote, pitch: pitch },
        });
      } else if (state.draggedNote && state.draggedNote.pitch !== pitch) {
        // ViewChanged rather than ShouldSave since we should only save on mouse up (to avoid
        // adding every intermediate note in the history)
        const newNote = { ...state.draggedNote, pitch: pitch };
        if (Note.isNoteModel(state.draggedNote)) {
          return viewChanged({
            ...state,
            draggedNote: newNote,
            score: changeNoteFrom(state.draggedNote.id, newNote, state.score),
          });
        } else {
          // It must be a triplet
          return viewChanged({
            ...state,
            draggedNote: newNote,
            score: changeTripletNoteFrom(
              state.draggedNote.id,
              newNote,
              state.score
            ),
          });
        }
      } else if (
        state.gracenoteState.dragged &&
        state.gracenoteState.dragged.note !== pitch
      ) {
        const newGracenote = {
          ...state.gracenoteState.dragged,
          note: pitch,
        };
        const gracenoteState = {
          ...state.gracenoteState,
          dragged: newGracenote,
          selected: newGracenote,
        };
        return viewChanged({
          ...state,
          gracenoteState,
          score: changeGracenoteFrom(
            state.gracenoteState.dragged,
            newGracenote,
            state.score
          ),
        });
      }
      return noChange(state);
    }
  };
}
export function mouseUp(): ScoreEvent {
  return async (state: State) =>
    state.draggedNote ||
    state.gracenoteState.dragged ||
    state.draggedText ||
    state.draggedSecondTiming
      ? shouldSave({
          ...state,
          draggedNote: null,
          gracenoteState: { ...state.gracenoteState, dragged: null },
          draggedText: null,
          draggedSecondTiming: null,
        })
      : noChange(state);
}

export function mouseDrag(x: number, y: number): ScoreEvent {
  return async (state: State) => {
    if (state.draggedSecondTiming) {
      const closest = closestItem(
        x,
        y,
        state.draggedSecondTiming.dragged !== 'end'
      );
      const oldSecondTiming = state.draggedSecondTiming.secondTiming;
      if (
        state.draggedSecondTiming.secondTiming[
          state.draggedSecondTiming.dragged
        ] !== closest
      ) {
        const newSecondTiming = {
          ...state.draggedSecondTiming.secondTiming,
          [state.draggedSecondTiming.dragged]: closest,
        };
        if (
          SecondTiming.isValid(
            newSecondTiming,
            state.score.secondTimings.filter((st) => st !== oldSecondTiming)
          )
        ) {
          return viewChanged({
            ...state,
            score: {
              ...state.score,
              secondTimings: replace(
                state.draggedSecondTiming.secondTiming,
                1,
                state.score.secondTimings,
                newSecondTiming
              ),
            },
            draggedSecondTiming: {
              ...state.draggedSecondTiming,
              secondTiming: newSecondTiming,
            },
            selectedSecondTiming: newSecondTiming,
          });
        }
      }
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
        textBoxState: { ...state.textBoxState, selectedText: newText },
        draggedText: newText,
      });
    }
    return noChange(state);
  };
}

export function clickBackground(): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...removeState(state),
      demoNote: null,
      inputGracenote: null,
    });
}
