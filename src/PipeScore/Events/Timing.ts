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
import { TimingSelection } from '../Selection/timing';
import type { State } from '../State';
import type { ITiming, TimingPart } from '../Timing';
import { SecondTiming, SingleTiming } from '../Timing/impl';
import { type ScoreEvent, Update } from './types';

export function addSingleTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const location =
        state.score.location(state.selection.start()) ||
        state.score.lastBarAndStave();

      if (location) {
        const { bar } = location;
        state.score.addTiming(new SingleTiming(bar.id, bar.id));
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}

export function addSecondTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const start = state.score.location(state.selection.start());
      if (start) {
        const end = state.score.nextBar(start.bar.id);
        if (end) {
          state.score.addTiming(new SecondTiming(start.bar.id, end.id, end.id));
          return Update.ShouldSave;
        }
      }
    }
    return Update.NoChange;
  };
}

export function clickTiming(timing: ITiming, part: TimingPart): ScoreEvent {
  return async (state: State) => {
    state.selection = new TimingSelection(timing, part, true);
    return Update.ViewChanged;
  };
}

export function editTimingText(timing: ITiming): ScoreEvent {
  return async () => {
    await timing.editText();
    return Update.ShouldSave;
  };
}
