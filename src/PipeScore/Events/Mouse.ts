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

import type { State } from '../State';
import { dialogueBoxIsOpen } from '../global/dialogueBox';
import { stopInputMode } from './common';
import { type ScoreEvent, Update } from './types';

export function mouseUp(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      state.selection.mouseUp();
      // Something could have been dragged
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function mouseDrag(x: number, y: number, page: number): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      state.selection.mouseDrag(x, y, state.score, page);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function clickBackground(): ScoreEvent {
  return async (state: State) => {
    if (dialogueBoxIsOpen) return Update.NoChange;
    state.selection = null;
    stopInputMode(state);
    return Update.ViewChanged;
  };
}
