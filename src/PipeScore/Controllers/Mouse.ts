import {
  ScoreEvent,
  noChange,
  viewChanged,
  shouldSave,
  removeState,
} from './Controller';
import { State } from '../State';

import {
  deleteSelectedNotes,
  changeNoteFrom,
  changeTripletNoteFrom,
} from './Note';
import { changeGracenoteFrom } from './Gracenote';
import { replaceTextBox } from './Text';

import Note from '../Note/functions';
import SecondTiming from '../SecondTiming/functions';
import TextBox from '../TextBox/functions';

import { Pitch } from '../global/pitch';
import { replace } from '../global/utils';
import { closestItem } from '../global/xy';

export function deleteSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.gracenote.selected) {
      return shouldSave({
        ...state,
        score: changeGracenoteFrom(
          state.gracenote.selected,
          { type: 'none' },
          state.score
        ),
      });
    }
    if (state.selection) {
      return shouldSave(deleteSelectedNotes(state));
    }
    if (state.text.selected !== null) {
      return shouldSave({
        ...state,
        score: {
          ...state.score,
          textBoxes: replace(state.text.selected, 1, state.score.textBoxes),
        },
        text: { dragged: null, selected: null },
      });
    }
    if (state.secondTiming.selected) {
      return shouldSave({
        ...state,
        score: {
          ...state.score,
          secondTimings: replace(
            state.secondTiming.selected,
            1,
            state.score.secondTimings
          ),
        },
        secondTiming: { ...state.secondTiming, dragged: null },
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
      if (state.note.demo && state.note.demo.pitch !== pitch) {
        return viewChanged({
          ...state,
          note: { ...state.note, demo: { ...state.note.demo, pitch: pitch } },
        });
      } else if (state.note.dragged && state.note.dragged.pitch !== pitch) {
        // ViewChanged rather than ShouldSave since we should only save on mouse up (to avoid
        // adding every intermediate note in the history)
        const newNote = { ...state.note.dragged, pitch: pitch };
        if (Note.isNoteModel(state.note.dragged)) {
          return viewChanged({
            ...state,
            note: { ...state.note, dragged: newNote },
            score: changeNoteFrom(state.note.dragged.id, newNote, state.score),
          });
        } else {
          // It must be a triplet
          return viewChanged({
            ...state,
            note: { ...state.note, dragged: newNote },
            score: changeTripletNoteFrom(
              state.note.dragged.id,
              newNote,
              state.score
            ),
          });
        }
      } else if (
        state.gracenote.dragged &&
        state.gracenote.dragged.note !== pitch
      ) {
        const newGracenote = {
          ...state.gracenote.dragged,
          note: pitch,
        };
        const gracenote = {
          ...state.gracenote,
          dragged: newGracenote,
          selected: newGracenote,
        };
        return viewChanged({
          ...state,
          gracenote,
          score: changeGracenoteFrom(
            state.gracenote.dragged,
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
    state.note.dragged ||
    state.gracenote.dragged ||
    state.text.dragged ||
    state.secondTiming.dragged
      ? shouldSave({
          ...state,
          note: { ...state.note, dragged: null },
          gracenote: { ...state.gracenote, dragged: null },
          text: { ...state.text, dragged: null },
          secondTiming: { ...state.secondTiming, dragged: null },
        })
      : noChange(state);
}

export function mouseDrag(x: number, y: number): ScoreEvent {
  return async (state: State) => {
    if (state.secondTiming.dragged) {
      const closest = closestItem(
        x,
        y,
        state.secondTiming.dragged.dragged !== 'end'
      );
      const oldSecondTiming = state.secondTiming.dragged.secondTiming;
      if (
        state.secondTiming.dragged.secondTiming[
          state.secondTiming.dragged.dragged
        ] !== closest
      ) {
        const newSecondTiming = {
          ...state.secondTiming.dragged.secondTiming,
          [state.secondTiming.dragged.dragged]: closest,
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
                state.secondTiming.dragged.secondTiming,
                1,
                state.score.secondTimings,
                newSecondTiming
              ),
            },
            secondTiming: {
              dragged: {
                ...state.secondTiming.dragged,
                secondTiming: newSecondTiming,
              },
              selected: newSecondTiming,
            },
          });
        }
      }
    } else if (
      state.text.dragged !== null &&
      x < state.score.width &&
      x > 0 &&
      y < state.score.height &&
      y > 0
    ) {
      const newText = TextBox.setCoords(state.text.dragged, x, y);
      return viewChanged({
        ...state,
        score: replaceTextBox(state.score, state.text.dragged, newText),
        text: { dragged: newText, selected: newText },
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
