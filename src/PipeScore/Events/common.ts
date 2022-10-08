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

//  Types / functions shared between multiple event handlers.

import { State } from '../State';
import { ID } from '../global/id';
import { itemBefore } from '../global/xy';
import { ScoreSelection } from '../Selection';

export type ScoreEvent = (state: State) => Promise<Update>;

export const enum Update {
  NoChange,
  ViewChanged,
  ShouldSave,
}

export function stopInputtingNotes(state: State) {
  state.preview?.stop();
  state.preview = null;
}

// Extend the current selection to include the item
export function addToSelection(id: ID, selection: ScoreSelection) {
  if (itemBefore(selection.end, id)) {
    selection.end = id;
  } else if (itemBefore(id, selection.start)) {
    selection.start = id;
  }
}
