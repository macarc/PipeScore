/*
  Controller for gracenote-related events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, Update } from './Controller';
import { State } from '../State';
import g, { Gracenote, SingleGracenote, ReactiveGracenote } from '../Gracenote';
import { Score } from '../Score';
import { GracenoteSelection, ScoreSelection } from '../Selection';
import { DemoGracenote, DemoReactive } from '../DemoNote';
import { stopInputtingNotes } from './Note';

export function changeGracenoteFrom(
  oldGracenote: Gracenote,
  newGracenote: Gracenote,
  score: Score
): Score {
  score.notes().forEach((n) => n.replaceGracenote(oldGracenote, newGracenote));
  return score;
}
export function clickGracenote(
  gracenote: Gracenote,
  index: number | 'all'
): ScoreEvent {
  return async (state: State) => {
    state.justClickedNote = true;
    stopInputtingNotes(state);
    state.selection = new GracenoteSelection(gracenote, index).drag(gracenote);
    return Update.ViewChanged;
  };
}

export function setGracenoteOnSelectedNotes(value: string | null): ScoreEvent {
  return async (state: State) => {
    const newGracenote = g.fromName(value);
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      notes.forEach((note) => note.setGracenote(newGracenote.copy()));
      return Update.ShouldSave;
    } else {
      stopInputtingNotes(state);
      state.demo =
        newGracenote instanceof SingleGracenote
          ? new DemoGracenote()
          : newGracenote instanceof ReactiveGracenote && value
          ? new DemoReactive(value)
          : null;
      return Update.ViewChanged;
    }
  };
}
