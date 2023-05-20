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

import { ScoreEvent, Update, stopInputtingNotes } from './common';
import { State } from '../State';

import { TextBox } from '../TextBox';
import { TextSelection } from '../Selection';
import { settings } from '../global/settings';

export function addText(): ScoreEvent {
  return async (state: State) => {
    state.score.addText(new TextBox(''));
    return Update.ShouldSave;
  };
}

export function clickText(text: TextBox): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    state.selection = new TextSelection(text, true);
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

export function editText(tx: TextBox | null = null): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof TextSelection && tx === null)
      tx = state.selection.text;
    if (tx) {
      return await tx.edit();
    }
    return Update.NoChange;
  };
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 100));
}

export function setTextX(xPercent: number): ScoreEvent {
  return async (state: State) => {
    const x =
      (clampPercent(xPercent) / 100) *
      (state.score.landscape
        ? settings.pageLongSideLength
        : settings.pageShortSideLength);
    if (state.selection instanceof TextSelection && !isNaN(x)) {
      state.selection.text.setX(x);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function setTextY(yPercent: number): ScoreEvent {
  return async (state: State) => {
    const y =
      (clampPercent(yPercent) / 100) *
      (state.score.landscape
        ? settings.pageShortSideLength
        : settings.pageLongSideLength);
    if (state.selection instanceof TextSelection && !isNaN(y)) {
      state.selection.text.setY(y);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}
