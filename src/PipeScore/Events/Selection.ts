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

import { NoteOrTriplet, noteToJSON } from '../Note';
import { noteFromJSON } from '../Note/impl';
import { SavedNoteOrTriplet } from '../SavedModel';
import { GracenoteSelection } from '../Selection/gracenote';
import { ScoreSelection } from '../Selection/score';
import { State } from '../State';
import { splitOn } from '../global/utils';
import { ScoreEvent, Update } from './types';

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

function browserSupportsCopying() {
  // Notably, Firefox doesn't support this
  return (
    navigator &&
    navigator.clipboard &&
    navigator.clipboard.writeText !== undefined &&
    navigator.clipboard.readText !== undefined
  );
}

export function copy(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;

    const notes = state.selection.notesAndTriplets(state.score);
    if (notes.length > 0) {
      const initialBar = state.score.location(notes[0].id)?.bar;

      if (initialBar) {
        let currentBarId = initialBar.id;

        const noteList: (SavedNoteOrTriplet | 'bar-break')[] = [];

        for (const note of notes) {
          const bar = state.score.location(note.id)?.bar;
          if (bar && currentBarId !== bar.id) {
            noteList.push('bar-break');
            currentBarId = bar.id;
          }
          noteList.push(noteToJSON(note));
        }

        if (browserSupportsCopying()) {
          navigator.clipboard.writeText(
            JSON.stringify({
              'data-type': 'pipescore-copied-notes',
              notes: noteList,
            })
          );
        } else {
          console.log(
            "Browser doesn't support copying, falling back to PipeScore clipboard"
          );
          state.clipboard = noteList;
        }
      }

      return Update.NoChange;
    }
    return Update.NoChange;
  };
}

function pasteNotes(state: State, notes: (SavedNoteOrTriplet | 'bar-break')[]) {
  const copiedNotes = splitOn(
    'bar-break',
    notes
      // we have to copy (replace ID) here rather than when copying in case they paste it more than once
      .map((note) => (typeof note === 'string' ? note : noteFromJSON(note).copy()))
  ) as NoteOrTriplet[][];

  if (state.selection instanceof ScoreSelection) {
    const id = state.selection.start;
    const startingBar =
      state.score.location(id)?.bar || state.score.lastBarAndStave()?.bar;
    if (startingBar) {
      let startedPasting = false;

      for (const bar of state.score.bars()) {
        if (bar.hasID(startingBar.id)) {
          startedPasting = true;
          if (bar.hasID(id)) {
            const notesToDelete = bar.notes();
            for (const note of notesToDelete) {
              bar.deleteNote(note);
            }
          }
        } else if (startedPasting) {
          // Only delete the current notes if we aren't on the first bar
          // since we should append to the first, then replace for the rest
          bar.clearNotes();
        }

        if (startedPasting) {
          const notesToPaste = copiedNotes.shift();
          if (notesToPaste) {
            bar.appendNotes(notesToPaste);
          } else {
            break;
          }
        }
      }
      return Update.ShouldSave;
    }
  }
  return Update.NoChange;
}

function pasteFromPipeScoreClipboard(state: State) {
  if (state.clipboard) {
    return pasteNotes(state, state.clipboard);
  }
  return Update.NoChange;
}

export function paste(): ScoreEvent {
  return async (state: State) => {
    if (browserSupportsCopying()) {
      const text = await navigator.clipboard.readText();
      try {
        const pasted = JSON.parse(text);
        if (pasted?.['data-type'] === 'pipescore-copied-notes') {
          const noteList = pasted.notes as (SavedNoteOrTriplet | 'bar-break')[];
          return pasteNotes(state, noteList);
        }
        console.log("Pasted item wasn't notes, falling back to PipeScore clipboard");
        return pasteFromPipeScoreClipboard(state);
      } catch {
        console.log(
          "Couldn't parse pasted item, falling back to PipeScore clipboard"
        );
        return pasteFromPipeScoreClipboard(state);
      }
    }
    console.log(
      "Browser doesn't support pasting, falling back to PipeScore clipboard"
    );
    return pasteFromPipeScoreClipboard(state);
  };
}
