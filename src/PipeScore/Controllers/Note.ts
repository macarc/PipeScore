/*
  Controller for note-related events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, noteLocation, Update } from './Controller';
import { State } from '../State';

import { Pitch } from '../global/pitch';
import { itemBefore } from '../global/xy';

import { Bar } from '../Bar';
import {
  ScoreSelection,
  TripletLineSelection,
  GracenoteSelection,
} from '../Selection';

import { Note, SingleNote, Triplet } from '../Note';
import { NoteLength, sameNoteLengthName } from '../Note/notelength';
import { DemoNote, DemoReactive } from '../DemoNote';
import { SingleGracenote } from '../Gracenote';

export function addNoteBefore(
  pitch: Pitch,
  noteAfter: Note | Triplet
): ScoreEvent {
  return async (state: State) => {
    if (state.demo) {
      const previous = state.score.previousNote(noteAfter.id);
      const note = state.demo.addNote(
        noteAfter,
        pitch,
        state.score.location(noteAfter.id).bar,
        previous
      );
      if (note) note.makeCorrectTie(state.score.notes());
      state.justAddedNote = true;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}
export function addNoteAfterSelection(pitch: Pitch): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const last = state.selection.lastBar(state.score);
      const length =
        state.demo instanceof DemoNote
          ? state.demo.length()
          : state.selection.selectedNote(state.score)?.lengthForInput() || null;
      if (length) {
        const note = new SingleNote(pitch, length);
        last.bar.insertNote(last.note, note);
        state.selection = new ScoreSelection(note.id, note.id);
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}
export function addNoteToBarEnd(pitch: Pitch, bar: Bar): ScoreEvent {
  return async (state: State) => {
    if (state.demo) {
      const previous = bar.lastNote();
      const note = state.demo.addNote(null, pitch, bar, previous);
      if (note) note.makeCorrectTie(state.score.notes());
      state.justClickedNote = true;
      state.justAddedNote = true;
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

export function moveLeft(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const prev = state.score.previousNote(state.selection.start);
      if (prev) {
        state.selection = new ScoreSelection(prev.id, prev.id);
        return Update.ViewChanged;
      }
    }
    return Update.NoChange;
  };
}

export function moveRight(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = state.score.nextNote(state.selection.end);
      if (next) {
        state.selection = new ScoreSelection(next.id, next.id);
        return Update.ViewChanged;
      }
    }
    return Update.NoChange;
  };
}

export function moveNoteUp(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof GracenoteSelection) {
      const gracenote = state.selection.single();
      if (gracenote) gracenote.moveUp();
      return Update.ShouldSave;
    } else if (state.selection) {
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
      const gracenote = state.selection.single();
      if (gracenote) gracenote.moveDown();
      return Update.ShouldSave;
    } else if (state.selection) {
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
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    const notes = state.selection.notes(state.score);
    notes.length === 1
      ? notes[0].toggleTie(state.score.notes())
      : notes
          .slice(1) // So that it only ties between the selected notes
          .forEach((note) => note.toggleTie(state.score.notes()));
    return Update.ShouldSave;
  };
}

export function addTriplet(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    const selected = state.selection.notesAndTriplets(state.score);

    if (selected.length >= 3) {
      const first = selected[0];
      const second = selected[1];
      const third = selected[2];
      if (
        first instanceof SingleNote &&
        second instanceof SingleNote &&
        third instanceof SingleNote
      ) {
        const { bar } = noteLocation(first, state.score);
        bar.makeTriplet(first, second, third);
        return Update.ShouldSave;
      }
    } else if (selected.length >= 1) {
      const tr = selected[0];
      if (tr instanceof Triplet) {
        const { bar } = noteLocation(tr, state.score);
        bar.unmakeTriplet(tr);
        return Update.ShouldSave;
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
        .forEach((note) => note.toggleDot());
    }
    if (state.demo instanceof DemoNote) state.demo.toggleDot();
    return Update.ShouldSave;
  };
}
export function stopInputtingNotes(state: State) {
  state.demo?.stop();
  state.demo = null;
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
    state.selection = new TripletLineSelection(triplet);
    return Update.ViewChanged;
  };
}
export function clickNote(note: SingleNote, event: MouseEvent): ScoreEvent {
  return async (state: State) => {
    if (state.demo instanceof DemoNote) {
      if (note.isDemo()) {
        state.demo?.addSelf(null);
        state.justAddedNote = true;
        return Update.ShouldSave;
      } else {
        stopInputtingNotes(state);
      }
    }
    if (
      state.demo instanceof DemoReactive ||
      state.demo instanceof SingleGracenote
    ) {
      const previous = state.score.previousNote(note.id);
      // TODO BUG this should use the demo note
      note.addGracenote(state.demo.toGracenote(), previous);
      return Update.ShouldSave;
    } else {
      if (event.shiftKey) {
        if (state.selection instanceof ScoreSelection) {
          if (itemBefore(state.selection.end, note.id)) {
            state.selection.end = note.id;
            state.selection.drag(note);
            state.justClickedNote = true;
            return Update.ViewChanged;
          } else if (itemBefore(note.id, state.selection.start)) {
            state.selection.start = note.id;
            state.selection.drag(note);
            state.justClickedNote = true;
            return Update.ViewChanged;
          } else {
            return Update.ShouldSave;
          }
        }
      }
      state.justClickedNote = true;
      state.selection = new ScoreSelection(note.id, note.id).drag(note);
      return Update.ViewChanged;
    }
  };
}

export function setInputLength(length: NoteLength): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const notes = state.selection.notesAndTriplets(state.score);
      if (notes.length > 0) notes.forEach((note) => note.setLength(length));
      else {
        stopInputtingNotes(state);
        state.demo = new DemoNote(length);
      }
    } else if (state.demo instanceof DemoNote) {
      if (sameNoteLengthName(state.demo.length(), length)) {
        stopInputtingNotes(state);
      } else {
        state.demo.setLength(length);
      }
    } else {
      state.selection = null;
      stopInputtingNotes(state);
      state.demo = new DemoNote(length);
    }
    return Update.ShouldSave;
  };
}
export function copy(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    const notes = state.selection.notesAndTriplets(state.score);
    if (notes.length > 0) {
      const { bar: initBar } = noteLocation(notes[0], state.score);
      let currentBarId = initBar.id;

      state.clipboard = [];
      notes.forEach((note) => {
        const { bar } = noteLocation(note.id, state.score);
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
      const id = state.selection.end;
      const { bar } = noteLocation(id, state.score);
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
