//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { ScoreEvent, Update, stopInputtingNotes } from './common';
import { State } from '../State';
import { Gracenote, SingleGracenote, ReactiveGracenote } from '../Gracenote';
import { GracenoteSelection, ScoreSelection } from '../Selection';
import { SingleGracenotePreview, ReactiveGracenotePreview } from '../Preview';

export function clickGracenote(
  gracenote: Gracenote,
  index: number | 'all'
): ScoreEvent {
  return async (state: State) => {
    state.justClickedNote = true;
    stopInputtingNotes(state);
    state.selection = new GracenoteSelection(gracenote, index);
    return Update.ViewChanged;
  };
}

export function setGracenoteOnSelectedNotes(value: string | null): ScoreEvent {
  return async (state: State) => {
    const newGracenote = Gracenote.fromName(value);
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      notes.forEach((note) => note.setGracenote(newGracenote.copy()));
      return Update.ShouldSave;
    } else {
      stopInputtingNotes(state);
      state.preview =
        newGracenote instanceof SingleGracenote
          ? new SingleGracenotePreview()
          : newGracenote instanceof ReactiveGracenote && value
          ? new ReactiveGracenotePreview(value)
          : null;
      return Update.ViewChanged;
    }
  };
}
