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

import { TextBox } from '../TextBox';
import { TextSelection } from '../Selection';

export function addText(): ScoreEvent {
  return async (state: State) => {
    state.score.addText(new TextBox(''));
    return Update.ShouldSave;
  };
}

export function changeText(
  newText: string,
  newSize: number,
  text: TextBox
): ScoreEvent {
  return async () => text.set(newText, newSize);
}

export function clickText(text: TextBox): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    state.selection = new TextSelection(text);
    return Update.ViewChanged;
  };
}

export function centreText(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof TextSelection) {
      state.selection.text.toggleCentre();
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
