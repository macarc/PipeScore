/*
  Controller for note-related events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, location, Update } from './Controller';
import { State } from '../State';

import { Pitch } from '../global/pitch';
import { itemBefore } from '../global/xy';

import { Bar } from '../Bar';
import { ScoreSelection } from '../Selection';

import { Note, SingleNote, Triplet, TripletNote } from '../Note';
import { NoteLength } from '../Note/notelength';
import { DemoGracenote, DemoNote, DemoReactive } from '../DemoNote';
import { SingleGracenote } from '../Gracenote';

export function addNoteBefore(
  pitch: Pitch,
  noteAfter: Note | Triplet
): ScoreEvent {
  return async (state: State) => {
    if (state.demo) {
      const previous = state.score.previousNote(noteAfter.id);
      state.demo.addNote(
        noteAfter,
        pitch,
        state.score.location(noteAfter.id).bar,
        previous
      );
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}
export function addNoteToBarEnd(pitch: Pitch, bar: Bar): ScoreEvent {
  return async (state: State) => {
    if (state.demo) {
      const previous = bar.lastNote();
      state.demo.addNote(null, pitch, bar, previous);
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
export function updateDemoNote(
  x: number,
  staveIndex: number | null
): ScoreEvent {
  return async (state: State) => {
    state.demo?.setX(x);
    state.demo?.setStaveIndex(staveIndex);
    return Update.ViewChanged;
  };
}

export function moveNoteUp(): ScoreEvent {
  return async (state: State) => {
    if (!state.selection) return Update.NoChange;
    state.selection.notes(state.score).forEach((note) => note.moveUp());
    return Update.ShouldSave;
  };
}

export function moveNoteDown(): ScoreEvent {
  return async (state: State) => {
    if (!state.selection) return Update.NoChange;
    state.selection.notes(state.score).forEach((note) => note.moveDown());
    return Update.ShouldSave;
  };
}

export function tieSelectedNotes(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    state.selection
      .notesAndTriplets(state.score)
      .forEach((note) => note.toggleTie(state.score.notesAndTriplets()));
    return Update.ShouldSave;
  };
}

export function addTriplet(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    const selectedNotesAndTriplets = state.selection.notesAndTriplets(
      state.score
    );
    const selectedNotes = state.selection.notes(state.score);

    if (selectedNotes.length >= 3) {
      const first = selectedNotes[0];
      const second = selectedNotes[1];
      const third = selectedNotes[2];
      if (
        first instanceof SingleNote &&
        second instanceof SingleNote &&
        third instanceof SingleNote
      ) {
        const { bar } = location(first, state.score);
        bar.makeTriplet(first, second, third);
        return Update.ShouldSave;
      }
    } else if (selectedNotesAndTriplets.length >= 1) {
      const tr = selectedNotesAndTriplets[0];
      if (tr instanceof Triplet) {
        const { bar } = location(tr, state.score);
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
  const d = state.demo;
  if (d instanceof DemoReactive) d.stop();
  state.demo = null;
}
export function stopInput(): ScoreEvent {
  return async (state: State) => {
    stopInputtingNotes(state);
    return Update.ViewChanged;
  };
}

export function clickNote(
  note: SingleNote | TripletNote,
  event: MouseEvent
): ScoreEvent {
  return async (state: State) => {
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
      state.selection
        .notesAndTriplets(state.score)
        .forEach((note) => note.setLength(length));
    }
    if (!state.demo || state.demo instanceof DemoGracenote) {
      state.demo = new DemoNote(length);
    } else if (state.demo instanceof DemoNote) {
      state.demo.setLength(length);
    }
    return Update.ShouldSave;
  };
}
export function copy(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return Update.NoChange;
    const notes = state.selection.notesAndTriplets(state.score);
    if (notes.length > 0) {
      const { bar: initBar } = location(notes[0], state.score);
      let currentBarId = initBar.id;

      state.clipboard = [];
      notes.forEach((note) => {
        const { bar } = location(note.id, state.score);
        if (currentBarId !== bar.id) {
          state.clipboard?.push('bar-break');
          currentBarId = bar.id;
        }
        state.clipboard?.push(note.copy());
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
      const { bar } = location(id, state.score);
      Bar.pasteNotes(state.clipboard, bar, id, state.score.bars());
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
