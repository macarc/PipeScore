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

import { ScoreEvent, Update } from './common';
import { State } from '../State';
import { ScoreSelection } from '../Selection';
import { Relative } from '../global/relativeLocation';
import { Stave } from '../Stave';
import { Settings, settings } from '../global/settings';

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

// Set the gap between staves, or before the stave if only
// one stave is in the list
function setGap(staves: Stave[], gap: number | 'auto') {
  if (staves.length === 1) {
    staves[0].setGap(gap);
  } else {
    staves.slice(1).forEach((s) => s.setGap(gap));
  }
}

export function staveGapToDisplay(staves: Stave[]) {
  if (staves.length === 0) {
    return settings.staveGap;
  } else if (staves.length === 1) {
    return staves[0].gapAsNumber();
  } else {
    // If more than one stave is selected, return their gap only if they all
    // have the same gap, otherwise just use the default gap.
    staves = staves.slice(1);
    const firstGap = staves[0].gapAsNumber();
    if (staves.every((stave) => stave.gapAsNumber() === firstGap)) {
      return firstGap;
    }
    return settings.staveGap;
  }
}

export function setStaveGap(gap: number) {
  return async (state: State) => {
    const clampedGap = Math.max(gap, Stave.minGap());
    if (state.selection instanceof ScoreSelection) {
      setGap(state.selection.staves(state.score), clampedGap);
    } else {
      settings.staveGap = clampedGap;
    }
    return Update.ViewChanged;
  };
}

export function resetStaveGap() {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      setGap(state.selection.staves(state.score), 'auto');
    } else {
      settings.staveGap = Settings.defaultStaveGap;
    }
    return Update.ShouldSave;
  };
}
