/*
  Types and methods used for multiple controllers
  Copyright (C) 2021 macarc
*/
import { State } from '../State';
import { Note } from '../Note';
import { Score } from '../Score';
import { ID } from '../global/id';
import { itemBefore } from '../global/xy';
import { ScoreSelection } from '../Selection';

export type ScoreEvent = (state: State) => Promise<Update>;

export const enum Update {
  NoChange,
  ViewChanged,
  ShouldSave,
}

export function noteLocation(note: Note | ID, score: Score) {
  // Finds the parent bar and stave of the note passed

  const id = typeof note === 'number' ? note : note.id;
  return score.location(id);
}

export function stopInputtingNotes(state: State) {
  state.preview?.stop();
  state.preview = null;
}
export function addToSelection(id: ID, selection: ScoreSelection) {
  if (itemBefore(selection.end, id)) {
    selection.end = id;
  } else if (itemBefore(id, selection.start)) {
    selection.start = id;
  }
}
