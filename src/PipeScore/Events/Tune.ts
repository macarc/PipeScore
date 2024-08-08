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
import type { Relative } from '../global/relativeLocation';
import { Settings } from '../global/settings';
import { type ScoreEvent, Update } from './types';

export function addTune(where: Relative): ScoreEvent {
  return async (state: State) => {
    const tune =
      state.selection instanceof ScoreSelection && state.selection.tune(state.score);
    state.score.addTune(tune || null, where);
    return Update.ShouldSave;
  };
}

export function deleteTune(): ScoreEvent {
  return async (state: State) => {
    const tune =
      state.selection instanceof ScoreSelection && state.selection.tune(state.score);
    if (tune) {
      state.score.deleteTune(tune);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function setTuneGap(gap: number): ScoreEvent {
  return async (state: State) => {
    const tune =
      (state.selection instanceof ScoreSelection &&
        state.selection.tune(state.score)) ||
      state.score.tunes()[0];
    if (tune) {
      tune.setTuneGap(gap);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function resetTuneGap(): ScoreEvent {
  return async (state: State) => {
    const tune =
      (state.selection instanceof ScoreSelection &&
        state.selection.tune(state.score)) ||
      state.score.tunes()[0];
    if (tune) {
      tune.setTuneGap(Settings.defaultTuneGap);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
