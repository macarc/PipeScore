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

import { type IBar, setTimeSignatureFrom } from '../Bar';
import { Bar } from '../Bar/impl';
import type { Barline } from '../Barline';
import type { IScore } from '../Score';
import { BarlineSelection } from '../Selection/barline';
import { ScoreSelection } from '../Selection/score';
import type { State } from '../State';
import type { ITimeSignature } from '../TimeSignature';
import { timeSignatureEditDialog } from '../TimeSignature/edit';
import { Relative } from '../global/relativeLocation';
import { reversed } from '../global/utils';
import { stopInputMode } from './common';
import { type ScoreEvent, Update } from './types';

function setTimeSignature(
  timeSignature: ITimeSignature,
  newTimeSignature: ITimeSignature,
  score: IScore
) {
  setTimeSignatureFrom(timeSignature, newTimeSignature, score.bars());
}

export function editTimeSignature(timeSignature: ITimeSignature): ScoreEvent {
  return async (state: State) => {
    const newTimeSignature = await timeSignatureEditDialog(timeSignature);
    setTimeSignature(timeSignature, newTimeSignature, state.score);
    return Update.ShouldSave;
  };
}

export function addAnacrusis(where: Relative): ScoreEvent {
  return async (state: State) => {
    const bar =
      state.selection instanceof ScoreSelection
        ? state.selection.bar(state.score)
        : where === Relative.before
          ? state.score.firstOnPage(0)
          : state.score.lastOnPage(0);

    if (bar) {
      const stave = state.score.location(bar.id)?.stave;
      if (stave) {
        stave.replaceBar(new Bar(bar.timeSignature(), true), bar, where);
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}

export function addBar(where: Relative): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      state.selection.addBar(where, state.score);
      return Update.ShouldSave;
    }

    return Update.NoChange;
  };
}

export function clickBarline(drag: (x: number) => void): ScoreEvent {
  return async (state: State) => {
    stopInputMode(state);
    state.selection = new BarlineSelection(drag, true);
    return Update.ViewChanged;
  };
}

export function resetBarLength(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const bars = state.selection.bars(state.score);
      for (const bar of bars) {
        bar.fixedWidth = 'auto';
      }
      if (bars.length > 0) {
        const prev = state.score.previousBar(bars[0].id);
        if (prev) prev.fixedWidth = 'auto';
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function clickBar(bar: IBar, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      state.selection.extend(bar.id);
      return Update.ViewChanged;
    }
    state.selection = new ScoreSelection(bar.id, bar.id, true);
    return Update.ViewChanged;
  };
}

export function setBarline(which: 'start' | 'end', what: Barline): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const bar of state.selection.bars(state.score)) {
        bar.setBarline(which, what);
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function editBarTimeSignature(): ScoreEvent {
  return async (state: State) => {
    const bar =
      state.selection instanceof ScoreSelection
        ? state.score.location(state.selection.start)?.bar
        : state.score.bars()[0];

    if (bar) {
      const newTimeSignature = await timeSignatureEditDialog(bar.timeSignature());
      setTimeSignature(bar.timeSignature(), newTimeSignature, state.score);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function moveBarToNextLine(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const { tune, bar, stave } of reversed(
        state.selection.barLocations(state.score)
      )) {
        const nextStave = tune.nextStave(stave);
        if (bar === stave.lastBar() && nextStave) {
          stave.deleteBar(bar);
          nextStave.insertBar(bar);
        }
        if (stave.bars().length === 0) {
          tune.deleteStave(stave);
        }
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function moveBarToPreviousLine(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const { tune, bar, stave } of state.selection.barLocations(state.score)) {
        const previousStave = tune.previousStave(stave);
        if (bar === stave.firstBar() && previousStave) {
          stave.deleteBar(bar);
          previousStave.appendBar(bar);
        }
        if (stave.bars().length === 0) {
          tune.deleteStave(stave);
        }
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
