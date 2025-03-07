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

import type { IBar } from '../Bar';
import type { Barline } from '../Barline';
import { setTimeSignatureFrom } from '../Measure';
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
  setTimeSignatureFrom(timeSignature, newTimeSignature, score.measures());
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
          ? state.score.firstOnPage(0, 0)
          : state.score.lastOnPage(0, 0);

    if (bar) {
      const stave = state.score.location(bar.id)?.stave;
      if (stave) {
        stave.insertMeasure(bar.measure(), where, true);
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}

export function addMeasure(where: Relative): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      state.selection.addMeasure(where, state.score);
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

export function resetMeasureLength(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const measures = state.selection.bars(state.score);
      for (const bar of measures) {
        bar.measure().fixedWidth = 'auto';
      }
      if (measures.length > 0) {
        const prev = state.score.previousBar(measures[0].id);
        if (prev) prev.measure().fixedWidth = 'auto';
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
    state.selection = ScoreSelection.from(bar.id, bar.id, true);
    return Update.ViewChanged;
  };
}

export function setBarline(which: 'start' | 'end', what: Barline): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const measure of state.selection.measures(state.score)) {
        measure.setBarline(which, what);
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function editBarTimeSignature(): ScoreEvent {
  return async (state: State) => {
    const measure =
      state.selection instanceof ScoreSelection
        ? state.score.location(state.selection.start())?.measure
        : state.score.measures()[0];

    if (measure) {
      const newTimeSignature = await timeSignatureEditDialog(
        measure.timeSignature()
      );
      setTimeSignature(measure.timeSignature(), newTimeSignature, state.score);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function moveBarToNextLine(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const { tune, measure, stave } of reversed(
        state.selection.measureLocations(state.score)
      )) {
        const nextStave = tune.nextStave(stave);
        if (measure === stave.lastMeasure() && nextStave) {
          stave.deleteMeasure(measure);
          nextStave.prependMeasure(measure);
        }
        if (stave.measures().length === 0) {
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
      for (const { tune, measure, stave } of state.selection.measureLocations(
        state.score
      )) {
        const previousStave = tune.previousStave(stave);
        if (measure === stave.firstMeasure() && previousStave) {
          stave.deleteMeasure(measure);
          previousStave.appendMeasure(measure);
        }
        if (stave.measures().length === 0) {
          tune.deleteStave(stave);
        }
      }
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
