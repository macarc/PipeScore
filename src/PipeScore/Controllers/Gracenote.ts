/*
  Controller for gracenote-related events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, viewChanged, shouldSave } from './Controller';
import { State } from '../State';
import { allNotes } from './Note';
import { Gracenote, SingleGracenote } from '../Gracenote/model';
import { ScoreModel } from '../Score/model';
import { ScoreSelection } from '../Selection/model';
import DemoNote from '../DemoNote/functions';

export function changeGracenoteFrom(
  oldGracenote: Gracenote,
  newGracenote: Gracenote,
  score: ScoreModel
): ScoreModel {
  // Replaces oldGracenote with newGracenote

  allNotes(score).forEach(
    (n) => n.replaceGracenote(oldGracenote, newGracenote),
    score
  );
  return score;
}
export function clickGracenote(gracenote: Gracenote): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...state,
      justClickedNote: true,
      note: { ...state.note, demo: null },
      gracenote: {
        ...state.gracenote,
        selected: gracenote,
        dragged: gracenote instanceof SingleGracenote ? gracenote : null,
      },
    });
}

export function setGracenoteOnSelectedNotes(value: string | null): ScoreEvent {
  return async (state: State) => {
    const newGracenote = Gracenote.from(value);
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      notes.forEach((note, i) =>
        note.addGracenote(newGracenote.copy(), notes[i - 1])
      );
      return shouldSave(state);
    }
    return viewChanged({
      ...state,
      gracenote: { ...state.gracenote, input: newGracenote },
      note: {
        ...state.note,
        demo:
          newGracenote instanceof SingleGracenote
            ? DemoNote.initDemoGracenote()
            : null,
      },
    });
  };
}
