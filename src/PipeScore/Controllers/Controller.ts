/*
  Types and methods used for multiple controllers
  Copyright (C) 2021 Archie Maclean
*/
import { State } from '../State';

import { BarModel } from '../Bar/model';
import { NoteModel, TripletModel } from '../Note/model';
import { ScoreModel } from '../Score/model';
import { StaveModel } from '../Stave/model';

import Score from '../Score/functions';
import Stave from '../Stave/functions';

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

  return {
    ...state,
    note: { ...state.note, dragged: null },
    gracenote: { ...state.gracenote, dragged: null, selected: null },
    secondTiming: { selected: null, dragged: null },
    text: { dragged: null, selected: null },
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
    text: { dragged: null, selected: null },
  };
}

export function location(
  note: NoteModel | ID | TripletModel,
  score: ScoreModel
): {
  stave: StaveModel;
  bar: BarModel;
} {
  // Finds the parent bar and stave of the note passed

  const staves = Score.staves(score);
  if (typeof note === 'number') {
    for (const stave of staves) {
      const bars = Stave.bars(stave);
      for (const bar of bars) {
        if (bar.id === note) {
          return { stave, bar };
        }
        for (const noteModel of bar.notes) {
          if (noteModel.id === note) {
            return { stave, bar };
          }
        }
      }
    }
  } else {
    for (const stave of staves) {
      const bars = Stave.bars(stave);
      for (const bar of bars) {
        if (bar.notes.includes(note)) {
          return { stave, bar };
        }
      }
    }
  }

  const lastStaveBars = Stave.bars(staves[staves.length - 1]);
  return {
    stave: staves[staves.length - 1],
    bar: lastStaveBars[lastStaveBars.length - 1],
  };
}
