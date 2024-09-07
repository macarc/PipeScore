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
import { INote, ITriplet } from '../Note';
import { Note } from '../Note/impl';
import { Duration, NoteLength } from '../Note/notelength';
import {
  NotePreview,
  ReactiveGracenotePreview,
  SingleGracenotePreview,
} from '../Preview/impl';
import { GracenoteSelection } from '../Selection/gracenote';
import { ScoreSelection } from '../Selection/score';
import { TripletLineSelection } from '../Selection/tripletline';
import type { State } from '../State';
import type { Pitch } from '../global/pitch';
import { stopInputMode } from './common';
import { type ScoreEvent, Update } from './types';

export function addNoteBefore(pitch: Pitch, noteAfter: INote): ScoreEvent {
  return async (state: State) => {
    if (state.preview) {
      const location = state.score.location(noteAfter.id);

      if (location) {
        state.preview.setLocation(
          location.bar,
          state.score.previousNote(noteAfter.id),
          noteAfter
        );
        state.preview.setPitch(pitch);
        state.preview.makeReal(state.score.notes());
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}

export function addNoteAfterSelection(pitch: Pitch): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const last = state.selection.lastNoteAndBar(state.score);
      const length =
        state.preview instanceof NotePreview
          ? state.preview.length()
          : state.selection.lastNoteAndBar(state.score)?.note?.length() ||
            state.score.previousNote(state.selection.start())?.length();

      if (last.bar) {
        const note = new Note(pitch, length || new NoteLength(Duration.Crotchet));
        last.bar.insertNote(last.note, note);
        // createdByMouseDown is false since this is triggered by keyboard shortcut
        state.selection = ScoreSelection.from(note.id, note.id, false);
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}

export function addNoteToBarEnd(pitch: Pitch, bar: IBar): ScoreEvent {
  return async (state: State) => {
    if (state.preview) {
      state.preview.setLocation(bar, bar.lastNote(), null);
      state.preview.setPitch(pitch);
      state.preview.makeReal(state.score.notes());
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function moveNoteUp(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof GracenoteSelection) {
      state.selection.moveUp(state.score);
      return Update.ShouldSave;
    }

    if (state.selection instanceof ScoreSelection) {
      const notes = state.score.notes();
      for (const note of state.selection.notes(state.score)) {
        note.moveUp();
        note.makeCorrectTie(notes);
      }
      return Update.ShouldSave;
    }

    return Update.NoChange;
  };
}

export function moveNoteDown(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof GracenoteSelection) {
      state.selection.moveDown(state.score);
      return Update.ShouldSave;
    }

    if (state.selection instanceof ScoreSelection) {
      const notes = state.score.notes();
      for (const note of state.selection.notes(state.score)) {
        note.moveDown();
        note.makeCorrectTie(notes);
      }
      return Update.ShouldSave;
    }

    return Update.NoChange;
  };
}

export function tieSelectedNotes(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      if (notes.length === 1) {
        notes[0].toggleTie(state.score.notes());
      } else {
        const allNotes = state.score.notes();
        // Don't tie the first note so that it
        // ties *between* the selected notes
        for (const note of notes.slice(1)) {
          note.toggleTie(allNotes);
        }
      }
      return Update.ShouldSave;
    }

    return Update.NoChange;
  };
}

export function toggleNatural(): ScoreEvent {
  return async (state: State) => {
    if (state.preview instanceof NotePreview) {
      state.preview.toggleNatural();
    }

    if (state.selection instanceof ScoreSelection) {
      for (const note of state.selection.notes(state.score)) {
        note.toggleNatural();
      }
      return Update.ShouldSave;
    }

    return Update.ViewChanged;
  };
}

export function toggleTriplet(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const selected = state.selection.notesAndTriplets(state.score);

      if (selected.length >= 3) {
        // Create triplet
        const first = selected[0];
        const second = selected[1];
        const third = selected[2];
        if (
          first instanceof INote &&
          second instanceof INote &&
          third instanceof INote
        ) {
          const location = state.score.location(first.id);
          if (location) {
            location.bar.makeTriplet(first, second, third);
            return Update.ShouldSave;
          }
        }
      } else if (selected.length >= 1) {
        // Remove triplet
        const tr = selected[0];
        const location = state.score.location(tr.id);
        if (tr instanceof ITriplet && location) {
          location.bar.unmakeTriplet(tr);
          return Update.ShouldSave;
        }
      }
    }
    return Update.NoChange;
  };
}

export function toggleDot(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      for (const note of state.selection.notesAndTriplets(state.score)) {
        note.setLength(note.length().dotted());
      }
    }
    if (state.preview instanceof NotePreview)
      state.preview.setLength(state.preview.length().dotted());
    return Update.ShouldSave;
  };
}

export function stopInput(): ScoreEvent {
  return async (state: State) => {
    stopInputMode(state);
    return Update.ViewChanged;
  };
}

export function clickTripletLine(triplet: ITriplet): ScoreEvent {
  return async (state: State) => {
    stopInputMode(state);
    state.selection = new TripletLineSelection(triplet);
    return Update.ViewChanged;
  };
}

export function clickNote(note: INote, event: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (state.preview instanceof NotePreview) {
      if (note.isPreview()) {
        state.preview?.makeReal(state.score.notes());
        return Update.ShouldSave;
      }

      stopInputMode(state);
    } else if (
      state.preview instanceof ReactiveGracenotePreview ||
      state.preview instanceof SingleGracenotePreview
    ) {
      const location = state.score.location(note.id);
      if (location) {
        state.preview.setLocation(
          location.bar,
          state.score.previousNote(note.id),
          note
        );
        state.preview.makeReal(state.score.notes());
        return Update.ShouldSave;
      }
    } else if (state.selection instanceof ScoreSelection && event.shiftKey) {
      state.selection.extend(note.id);
      return Update.ViewChanged;
    } else {
      state.justClickedNote = true;
      state.selection = ScoreSelection.from(note.id, note.id, true);
    }

    return Update.ViewChanged;
  };
}

export function setInputLength(length: Duration): ScoreEvent {
  return async (state: State) => {
    // If notes are selected, then change their length
    // If inputting same length, stop inputting
    // If inputting different length, change length
    // If none of the above, start inputting length

    let changed = false;

    if (state.selection instanceof ScoreSelection) {
      const selectedNotes = state.selection.notesAndTriplets(state.score);
      for (const note of selectedNotes.flat()) {
        note.setLength(new NoteLength(length));
      }

      if (selectedNotes.length > 0) changed = true;
    }

    if (state.preview instanceof NotePreview) {
      if (state.preview.length().sameNoteLengthName(length)) {
        stopInputMode(state);
      } else {
        state.preview.setLength(new NoteLength(length));
      }

      changed = true;
    }

    if (!changed) {
      // Clear non-score selections in preparation for adding notes to the score
      if (!(state.selection instanceof ScoreSelection)) state.selection = null;

      stopInputMode(state);
      state.preview = new NotePreview(new NoteLength(length));
    }
    return Update.ShouldSave;
  };
}
