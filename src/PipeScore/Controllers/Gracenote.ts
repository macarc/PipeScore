/*
  Controller for gracenote-related events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, Update } from './Controller';
import { State } from '../State';
import { Gracenote, SingleGracenote } from '../Gracenote';
import { Score } from '../Score';
import { GracenoteSelection, ScoreSelection } from '../Selection';
import { DemoGracenote } from '../DemoNote';

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
  return async (state: State) => {
    state.justClickedNote = true;
    state.note.demo = null;
    state.selection = new GracenoteSelection(gracenote).drag(gracenote);
    return Update.ViewChanged;
  };
}

export function setGracenoteOnSelectedNotes(value: string | null): ScoreEvent {
  return async (state: State) => {
    const newGracenote = Gracenote.from(value);
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      notes.forEach((note, i) =>
        note.addGracenote(newGracenote.copy(), notes[i - 1])
      );
      return Update.ShouldSave;
    } else {
      state.note.demo =
        newGracenote instanceof SingleGracenote ? new DemoGracenote() : null;
      return Update.ViewChanged;
    }
  };
}
