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
import type { State } from '../State';
import { minStaveGap } from '../Stave/view';
import { Relative } from '../global/relativeLocation';
import { Settings, settings } from '../global/settings';
import { first, last } from '../global/utils';
import { type ScoreEvent, Update } from './types';

export function addStave(where: Relative): ScoreEvent {
  return async (state: State) => {
    const location =
      state.selection instanceof ScoreSelection &&
      state.score.location(state.selection.start());

    if (location) {
      location.tune.addStave(location.stave, where);
    } else if (where === Relative.before) {
      // Add stave before first tune
      first(state.score.tunes())?.addStave(null, Relative.before);
    } else if (where === Relative.after) {
      // Add stave after last tune
      last(state.score.tunes())?.addStave(null, Relative.after);
    }

    return Update.ShouldSave;
  };
}

export function deleteStave(): ScoreEvent {
  return async (state: State) => {
    const staves =
      state.selection instanceof ScoreSelection &&
      state.selection.staveLocations(state.score);

    if (staves) {
      for (const { tune, stave } of staves) {
        tune.deleteStave(stave);
      }
      return Update.ShouldSave;
    }

    return Update.NoChange;
  };
}

export function setStaveGap(gap: number) {
  return async () => {
    const clampedGap = Math.max(gap, minStaveGap());
    settings.staveGap = clampedGap;
    return Update.ShouldSave;
  };
}

export function resetStaveGap() {
  return async () => {
    settings.staveGap = Settings.defaultStaveGap;
    return Update.ShouldSave;
  };
}

export function addHarmonyStave() {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const stave of state.selection.staves(state.score)) {
        stave.addHarmony();
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function addHarmonyStaveToAll() {
  return async (state: State) => {
    for (const stave of state.score.staves()) {
      stave.addHarmony();
    }
    return Update.ShouldSave;
  };
}

export function removeHarmonyStave() {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const stave of state.selection.staves(state.score)) {
        stave.removeHarmony();
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
