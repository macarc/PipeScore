/*
  Controller for gracenote-related events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, viewChanged, shouldSave } from './Controller';
import { State } from '../State';
import { Gracenote, SingleGracenote } from '../Gracenote/model';
import { Score } from '../Score/model';
import { ScoreSelection } from '../Selection/model';
import { DemoGracenote } from '../DemoNote/model';

export function changeGracenoteFrom(
  oldGracenote: Gracenote,
  newGracenote: Gracenote,
  score: Score
): Score {
  // Replaces oldGracenote with newGracenote

  score.notes().forEach((n) => n.replaceGracenote(oldGracenote, newGracenote));
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
          newGracenote instanceof SingleGracenote ? new DemoGracenote() : null,
      },
    });
  };
}
