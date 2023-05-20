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
import { ScoreSelection } from '../Selection/score_selection';
import { GracenoteSelection, TextSelection } from '../Selection';
import { Bar } from '../Bar';

export function moveLeft(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const prev = state.score.previousNote(state.selection.start);
      if (prev) {
        state.selection = new ScoreSelection(prev.id, prev.id, false);
        return Update.ViewChanged;
      }
    } else if (state.selection instanceof GracenoteSelection) {
      state.selection.previousNote();
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function moveRight(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = state.score.nextNote(state.selection.end);
      if (next) {
        state.selection = new ScoreSelection(next.id, next.id, false);
        return Update.ViewChanged;
      }
    } else if (state.selection instanceof GracenoteSelection) {
      state.selection.nextNote();
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function expandSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = state.score.nextNote(state.selection.end);
      if (next) {
        state.selection.end = next.id;
        return Update.ViewChanged;
      }
    }
    return Update.NoChange;
  };
}

export function detractSelection(): ScoreEvent {
  return async (state: State) => {
    if (
      state.selection instanceof ScoreSelection &&
      state.selection.start !== state.selection.end
    ) {
      const prev = state.score.previousNote(state.selection.end);
      if (prev) {
        state.selection.end = prev.id;
        return Update.ViewChanged;
      }
    }
    return Update.NoChange;
  };
}

export function moveLeftBarwise(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const prev = state.score.previousBar(state.selection.end);
      if (prev) state.selection = new ScoreSelection(prev.id, prev.id, false);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function moveRightBarwise(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = state.score.nextBar(state.selection.end);
      if (next) state.selection = new ScoreSelection(next.id, next.id, false);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function deleteSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      state.selection = state.selection.delete(state.score);
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function copy(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    const notes = state.selection.notesAndTriplets(state.score);
    if (notes.length > 0) {
      const { bar: initBar } = state.score.location(notes[0].id);
      let currentBarId = initBar.id;

      state.clipboard = [];
      notes.forEach((note) => {
        const { bar } = state.score.location(note.id);
        if (currentBarId !== bar.id) {
          state.clipboard?.push('bar-break');
          currentBarId = bar.id;
        }
        state.clipboard?.push(note);
      });
      return Update.NoChange;
    }
    return Update.NoChange;
  };
}

export function paste(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection && state.clipboard) {
      const id = state.selection.start;
      const { bar } = state.score.location(id);
      Bar.pasteNotes(
        state.clipboard
          .slice()
          // we have to do it here rather than when copying in case they paste it more than once
          .map((note) => (typeof note === 'string' ? note : note.copy())),
        bar,
        id,
        state.score.bars()
      );
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
