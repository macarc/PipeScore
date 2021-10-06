/*
  Types and methods used for multiple controllers
  Copyright (C) 2021 Archie Maclean
*/
import { State } from '../State';

import { Note, TripletNote } from '../Note';
import { Score } from '../Score';

import { ID } from '../global/id';

export type ScoreEvent = (state: State) => Promise<Update>;
export type Dispatch = (e: ScoreEvent) => void;

export const enum Update {
  NoChange,
  ViewChanged,
  ShouldSave,
}

export function removeState(state: State): State {
  // Removes parts of the state that could be dirty after undo / redo

  state.selection = null;
  return state;
}

export function removeNoteState(state: State) {
  state.note.demo = null;
  state.gracenote.input = null;
  state.selection = null;
}

export function location(note: Note | TripletNote | ID, score: Score) {
  // Finds the parent bar and stave of the note passed

  const id = typeof note === 'number' ? note : note.id;
  return score.location(id);
}
