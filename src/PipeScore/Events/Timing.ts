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

import { ScoreSelection, TimingSelection } from '../Selection';
import { State } from '../State';
import { SecondTiming, SingleTiming, Timing, TimingPart } from '../Timing';
import { after } from '../global/utils';
import { ScoreEvent, Update } from './common';

export function addSingleTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const location =
        state.score.location(state.selection.start) ||
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
      const start = state.score.location(state.selection.start);
      if (start) {
        const end = after(start.bar, state.score.bars());
        if (end) {
          state.score.addTiming(new SecondTiming(start.bar.id, end.id, end.id));
          return Update.ShouldSave;
        }
      }
    }
    return Update.NoChange;
  };
}

export function clickTiming(timing: Timing, part: TimingPart): ScoreEvent {
  return async (state: State) => {
    state.selection = new TimingSelection(timing, part, true);
    return Update.ViewChanged;
  };
}

export function editTimingText(timing: Timing): ScoreEvent {
  return async () => {
    await timing.editText();
    return Update.ShouldSave;
  };
}
