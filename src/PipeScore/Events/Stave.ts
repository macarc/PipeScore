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

import { ScoreSelection } from '../Selection/score';
import { State } from '../State';
import { IStave } from '../Stave';
import { minStaveGap } from '../Stave/view';
import { Relative } from '../global/relativeLocation';
import { Settings, settings } from '../global/settings';
import { ScoreEvent, Update } from './types';

export function addStave(where: Relative): ScoreEvent {
  return async (state: State) => {
    const stave =
      (state.selection instanceof ScoreSelection &&
        state.score.location(state.selection.start)?.stave) ||
      null;

    state.score.addStave(stave, where);
    return Update.ShouldSave;
  };
}

// Set the gap between staves, or before the stave if only
// one stave is in the list
function setGap(staves: IStave[], gap: number | 'auto') {
  if (staves.length === 1) {
    staves[0].setGap(gap);
  } else {
    for (const stave of staves.slice(1)) {
      stave.setGap(gap);
    }
  }
}

export function staveGapToDisplay(staves: IStave[]) {
  switch (staves.length) {
    case 0:
      return settings.staveGap;
    case 1:
      return staves[0].gapAsNumber();
    default: {
      // If more than one stave is selected, return their gap only if they all
      // have the same gap, otherwise just use the default gap.
      const gaps = staves.slice(1).map((stave) => stave.gapAsNumber());
      const firstGap = gaps[0];
      if (gaps.every((gap) => gap === firstGap)) {
        return firstGap;
      }
      return settings.staveGap;
    }
  }
}

export function setStaveGap(gap: number) {
  return async (state: State) => {
    const clampedGap = Math.max(gap, minStaveGap());
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
