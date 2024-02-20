//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
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

import { Gracenote } from '../Gracenote';
import { GracenoteSelection, ScoreSelection } from '../Selection';
import { State } from '../State';
import { ScoreEvent, Update, stopInputMode } from './common';

export function clickGracenote(
  gracenote: Gracenote,
  index: number | 'all'
): ScoreEvent {
  return async (state: State) => {
    state.justClickedNote = true;
    stopInputMode(state);
    state.selection = new GracenoteSelection(gracenote, index, true);
    return Update.ViewChanged;
  };
}

function setPreviewGracenote(gracenote: Gracenote, state: State) {
  stopInputMode(state);
  state.preview = gracenote.asPreview();
}

export function setGracenoteOnSelectedNotes(value: string | null): ScoreEvent {
  return async (state: State) => {
    const newGracenote = Gracenote.fromName(value);
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      for (const note of notes) {
        note.setGracenote(newGracenote.copy());
      }
      return Update.ShouldSave;
    }
    if (state.selection instanceof GracenoteSelection) {
      state.selection.changeGracenote(newGracenote, state.score);
      return Update.ShouldSave;
    }

    setPreviewGracenote(newGracenote, state);
    return Update.ViewChanged;
  };
}
