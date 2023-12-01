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
import { ScoreSelection, StaveSpacerSelection } from '../Selection';
import { Relative } from '../global/relativeLocation';
import { clamp } from '../global/utils';
import { StaveSpacer } from '../Stave/spacer';

export function addStave(where: Relative): ScoreEvent {
  return async (state: State) => {
    const stave =
      state.selection instanceof ScoreSelection
        ? state.score.location(state.selection.start).stave
        : null;

    state.score.addStave(stave, where);
    return Update.ShouldSave;
  };
}

export function addStaveSpacer(where: Relative): ScoreEvent {
  return async (state: State) => {
    const stave =
      state.selection instanceof ScoreSelection
        ? state.score.location(state.selection.start).stave
        : null;

    state.score.addSpacer(stave, where);
    return Update.ShouldSave;
  };
}

export function clickStaveSpacer(spacer: StaveSpacer) {
  return async (state: State) => {
    stopInputtingNotes(state);
    state.selection = new StaveSpacerSelection(spacer, true);
    return Update.ViewChanged;
  };
}

export function setStaveSpacerHeight(height: number) {
  return async (state: State) => {
    if (state.selection instanceof StaveSpacerSelection) {
      state.selection.spacer.setHeight(
        clamp(height, StaveSpacer.minHeight, StaveSpacer.maxHeight)
      );
    }
    return Update.ViewChanged;
  };
}
