/*
  Types and methods used for multiple controllers
  Copyright (C) 2021 Archie Maclean
*/
import { State } from '../State';
import { Note } from '../Note';
import { Score } from '../Score';
import { ID } from '../global/id';

export type ScoreEvent = (state: State) => Promise<Update>;
export type Dispatch = (e: ScoreEvent) => void;

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
