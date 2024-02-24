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

import { Bar } from '../Bar';
import { Barline } from '../Bar/barline';
import { Score } from '../Score';
import { BarlineSelection, ScoreSelection } from '../Selection';
import { State } from '../State';
import { TimeSignature } from '../TimeSignature';
import { Relative } from '../global/relativeLocation';
import { ScoreEvent, Update, addToSelection, stopInputMode } from './common';

function setTimeSignatureFrom(
  timeSignature: TimeSignature,
  newTimeSignature: TimeSignature,
  score: Score
) {
  Bar.setTimeSignatureFrom(timeSignature, newTimeSignature, score.bars());
}

export function editTimeSignature(
  timeSignature: TimeSignature,
  newTimeSignature: TimeSignature
): ScoreEvent {
  return async (state: State) => {
    setTimeSignatureFrom(timeSignature, newTimeSignature, state.score);
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

export function clickBar(bar: Bar, mouseEvent: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (mouseEvent.shiftKey && state.selection instanceof ScoreSelection) {
      addToSelection(bar.id, state.selection);
      return Update.ViewChanged;
    }
    state.selection = new ScoreSelection(bar.id, bar.id, true);
    return Update.ViewChanged;
  };
}

export function setBarline(which: 'start' | 'end', what: Barline): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const bar = state.score.location(state.selection.start)?.bar;
      if (bar) {
        bar.setBarline(which, what);
        return Update.ShouldSave;
      }
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
      const newTimeSignature = await bar.timeSignature().edit();
      setTimeSignatureFrom(bar.timeSignature(), newTimeSignature, state.score);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function moveBarToNextLine(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const location = state.score.location(state.selection.start);
      if (location) {
        const { bar, stave } = location;
        const next = state.score.nextStave(stave);
        if (bar === stave.lastBar() && next) {
          stave.deleteBar(bar);
          next.insertBar(bar);
          return Update.ShouldSave;
        }
      }
    }
    return Update.NoChange;
  };
}

export function moveBarToPreviousLine(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const location = state.score.location(state.selection.start);
      if (location) {
        const { bar, stave } = location;
        const previous = state.score.previousStave(stave);
        if (bar === stave.firstBar() && previous) {
          stave.deleteBar(bar);
          previous.appendBar(bar);
          return Update.ShouldSave;
        }
      }
    }
    return Update.NoChange;
  };
}
