/*
  Types and methods used for multiple controllers
  Copyright (C) 2021 Archie Maclean
*/
import { State } from '../State';

import { Note, TripletNote } from '../Note';
import { Score } from '../Score';

import { ID } from '../global/id';
import { nlast } from '../global/utils';

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

  return {
    ...state,
    note: { ...state.note, dragged: null },
    gracenote: { ...state.gracenote, dragged: null, selected: null },
    draggedSecondTiming: null,
    draggedText: null,
    selection: null,
  };
}

export function removeNoteState(state: State): State {
  return {
    ...state,
    note: { demo: null, dragged: null },
    gracenote: { ...state.gracenote, input: null },
    selection: null,
  };
}

export function removeTextState(state: State): State {
  return {
    ...state,
    draggedText: null,
  };
}

export function location(note: Note | TripletNote | ID, score: Score) {
  // Finds the parent bar and stave of the note passed

  const staves = score.staves();

  if (staves.length === 0)
    throw Error('Tried to get location of a note, but there are no staves!');

  const id = typeof note === 'number' ? note : note.id;
  for (const stave of staves) {
    const bars = stave.allBars();
    for (const bar of bars) {
      if (bar.hasID(id)) {
        return { stave, bar };
      }
      const loc = bar.location(id);
      if (loc) return { stave, bar };
    }
  }

  const lastStaveBars = nlast(staves).allBars();
  return {
    stave: staves[staves.length - 1],
    bar: lastStaveBars[lastStaveBars.length - 1],
  };
}
