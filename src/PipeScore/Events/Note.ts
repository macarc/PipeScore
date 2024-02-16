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

import {
  ScoreEvent,
  Update,
  stopInputtingNotes,
  addToSelection,
} from './common';
import { State } from '../State';
import { Pitch } from '../global/pitch';
import { Bar } from '../Bar';
import {
  ScoreSelection,
  TripletLineSelection,
  GracenoteSelection,
} from '../Selection';
import { Note, Triplet } from '../Note';
import {
  NotePreview,
  CustomGracenotePreview,
  ReactiveGracenotePreview,
} from '../Preview';
import { Duration, NoteLength } from '../Note/notelength';

export function addNoteBefore(pitch: Pitch, noteAfter: Note): ScoreEvent {
  return async (state: State) => {
    if (state.preview) {
      state.preview.setLocation(
        state.score.location(noteAfter.id).bar,
        state.score.previousNote(noteAfter.id),
        noteAfter
      );
      state.preview.setPitch(pitch);
      state.preview.makeReal(state.score.notes());
      return Update.ShouldSave;
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
          : state.selection.note(state.score)?.length();
      if (length) {
        const note = new Note(pitch, length);
        last.bar.insertNote(last.note, note);
        // createdByMouseDown is false since this is triggered by keyboard shortcut
        state.selection = new ScoreSelection(note.id, note.id, false);
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}
export function addNoteToBarEnd(pitch: Pitch, bar: Bar): ScoreEvent {
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
    } else if (state.selection instanceof ScoreSelection) {
      const notes = state.score.notes();
      state.selection.notes(state.score).forEach((note) => {
        note.moveUp();
        note.makeCorrectTie(notes);
      });
      return Update.ShouldSave;
    } else {
      return Update.NoChange;
    }
  };
}

export function moveNoteDown(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof GracenoteSelection) {
      state.selection.moveDown(state.score);
      return Update.ShouldSave;
    } else if (state.selection instanceof ScoreSelection) {
      const notes = state.score.notes();
      state.selection.notes(state.score).forEach((note) => {
        note.moveDown();
        note.makeCorrectTie(notes);
      });
      return Update.ShouldSave;
    } else {
      return Update.NoChange;
    }
  };
}

export function tieSelectedNotes(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notes(state.score);
      if (notes.length === 1) {
        notes[0].toggleTie(state.score.notes());
      } else {
        notes
          // Don't tie the first note so that it
          // ties *between* the selected notes
          .slice(1)
          .forEach((note) => note.toggleTie(state.score.notes()));
      }
      return Update.ShouldSave;
    } else {
      return Update.NoChange;
    }
  };
}

export function toggleNatural(): ScoreEvent {
  return async (state: State) => {
    if (state.preview instanceof NotePreview) state.preview.toggleNatural();
    if (state.selection instanceof ScoreSelection) {
      state.selection
        ?.notes(state.score)
        .forEach((note) => note.toggleNatural());
      return Update.ShouldSave;
    }
    return Update.ViewChanged;
  };
}

export function addTriplet(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const selected = state.selection.notesAndTriplets(state.score);

      if (selected.length >= 3) {
        // Create triplet
        const first = selected[0];
        const second = selected[1];
        const third = selected[2];
        if (
          first instanceof Note &&
          second instanceof Note &&
          third instanceof Note
        ) {
          const { bar } = state.score.location(first.id);
          bar.makeTriplet(first, second, third);
          return Update.ShouldSave;
        }
      } else if (selected.length >= 1) {
        // Remove triplet
        const tr = selected[0];
        if (tr instanceof Triplet) {
          const { bar } = state.score.location(tr.id);
          bar.unmakeTriplet(tr);
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
      state.selection
        .notesAndTriplets(state.score)
        .forEach((note) => note.setLength(note.length().dotted()));
    }
    if (state.preview instanceof NotePreview)
      state.preview.setLength(state.preview.length().dotted());
    return Update.ShouldSave;
  };
}

export function stopInput(): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    return Update.ViewChanged;
  };
}

export function clickTripletLine(triplet: Triplet): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    state.selection = new TripletLineSelection(triplet, true);
    return Update.ViewChanged;
  };
}

export function clickNote(note: Note, event: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (state.preview instanceof NotePreview) {
      if (note.isPreview()) {
        state.preview?.makeReal(state.score.notes());
        return Update.ShouldSave;
      } else {
        stopInputtingNotes(state);
      }
    }
    if (
      state.preview instanceof ReactiveGracenotePreview ||
      state.preview instanceof CustomGracenotePreview
    ) {
      state.preview.setLocation(
        state.score.location(note.id).bar,
        state.score.previousNote(note.id),
        note
      );
      state.preview.makeReal(state.score.notes());
      return Update.ShouldSave;
    }
    if (event.shiftKey && state.selection instanceof ScoreSelection) {
      addToSelection(note.id, state.selection);
      return Update.ViewChanged;
    }
    state.justClickedNote = true;
    state.selection = new ScoreSelection(note.id, note.id, true);
    return Update.ViewChanged;
  };
}

export function setInputLength(length: Duration): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notesAndTriplets(state.score);
      if (notes.length > 0)
        notes.forEach((note) => note.setLength(new NoteLength(length)));
      else {
        stopInputtingNotes(state);
        state.preview = new NotePreview(new NoteLength(length));
      }
    } else if (state.preview instanceof NotePreview) {
      if (state.preview.length().sameNoteLengthName(length)) {
        stopInputtingNotes(state);
      } else {
        state.preview.setLength(new NoteLength(length));
      }
    } else {
      state.selection = null;
      stopInputtingNotes(state);
      state.preview = new NotePreview(new NoteLength(length));
    }
    return Update.ShouldSave;
  };
}
