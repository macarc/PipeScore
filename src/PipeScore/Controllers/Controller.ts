/*
  Types and methods used for multiple controllers
  Copyright (C) 2021 Archie Maclean
*/
import { State } from '../State';

import { Note, TripletNote } from '../Note';
import { Score } from '../Score';

import { ID } from '../global/id';

export type ScoreEvent = (state: State) => Promise<UpdatedState>;
export type Dispatch = (e: ScoreEvent) => void;

export const enum Update {
  NoChange,
  ViewChanged,
  ShouldSave,
}
export type UpdatedState = {
  state: State;
  update: Update;
};
export function noChange(state: State): UpdatedState {
  return {
    state,
    update: Update.NoChange,
  };
}
export function viewChanged(state: State): UpdatedState {
  return {
    state,
    update: Update.ViewChanged,
  };
}
export function shouldSave(state: State): UpdatedState {
  return {
    state,
    update: Update.ShouldSave,
  };
}

export function removeState(state: State): State {
  // Removes parts of the state that could be dirty after undo / redo

  state.selection = null;
  return state;
}

export function removeNoteState(state: State): State {
  return {
    ...state,
    note: { demo: null },
    gracenote: { ...state.gracenote, input: null },
    selection: null,
  };
}

export function location(note: Note | TripletNote | ID, score: Score) {
  // Finds the parent bar and stave of the note passed

  const id = typeof note === 'number' ? note : note.id;
  return score.location(id);
}
