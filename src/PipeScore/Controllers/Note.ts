/*
  Controller for note-related events
  Copyright (C) 2021 Archie Maclean
*/
import {
  ScoreEvent,
  UpdatedState,
  noChange,
  viewChanged,
  shouldSave,
  location,
  removeState,
  removeTextState,
} from './Controller';
import { State } from '../State';

import { Pitch } from '../global/pitch';
import { ID, Item } from '../global/id';
import { car, deepcopy, nmap } from '../global/utils';
import { deleteXY, itemBefore } from '../global/xy';

import { Bar } from '../Bar/model';
import { ScoreModel } from '../Score/model';
import { SecondTimingModel } from '../SecondTiming/model';
import { ScoreSelection } from '../Selection/model';

import Score from '../Score/functions';
import DemoNote from '../DemoNote/functions';
import { Note, SingleNote, Triplet, TripletNote } from '../Note/model';
import { dot, NoteLength } from '../Note/notelength';
import { Stave } from '../Stave/model';

export function dragNote(
  note: SingleNote | TripletNote,
  pitch: Pitch,
  state: State
): UpdatedState {
  note.drag(pitch);
  return viewChanged({ ...state, note: { ...state.note, dragged: note } });
}

function addNote(pitch: Pitch, bar: Bar, state: State): UpdatedState;
function addNote(
  pitch: Pitch,
  noteBefore: Note | Triplet,
  state: State
): UpdatedState;
function addNote(
  pitch: Pitch,
  where: Bar | Note | Triplet,
  state: State
): UpdatedState {
  const noteModels = allNotesAndTriplets(state.score);
  let noteBefore: Note | Triplet | null;
  const { bar } = location(where.id, state.score);
  if (where instanceof Bar) {
    noteBefore = previousNote(bar.id, state.score);
  } else {
    noteBefore = where;
  }
  if (state.note.demo && state.note.demo.type === 'note') {
    const newNote = new SingleNote(pitch, state.note.demo.length);
    bar.insertNote(noteBefore, newNote);
    return shouldSave(state);
  } else {
    const note =
      nmap(
        noteBefore,
        (noteBefore) => noteModels[noteModels.indexOf(noteBefore) + 1]
      ) ||
      noteModels[0] ||
      null;
    if (note) {
      if (state.note.demo && state.note.demo.type === 'gracenote') {
        note.addGracenote(pitch, noteBefore);
        return shouldSave(state);
      }
      if (state.gracenote.input) {
        note.addGracenote(state.gracenote.input, noteBefore);
        return shouldSave(state);
      }
    }
  }
  return noChange(state);
}

export function allNotesAndTriplets(score: ScoreModel): Note[] {
  // Flattens all the notes in the score into an array

  return Score.bars(score).flatMap((bar) => bar.notesAndTriplets());
}
export function allNotes(score: ScoreModel): (SingleNote | TripletNote)[] {
  return Triplet.flatten(allNotesAndTriplets(score));
}
function nextNote(id: ID, score: ScoreModel): Note | null {
  // TODO before, this used to return bars / staves. As far as I can tell, this was never used, but check!

  return Bar.nextNote(id, Score.bars(score));
}

function previousNote(id: ID, score: ScoreModel): Note | null {
  // TODO before, this used to return bars / staves. As far as I can tell, this was never used, but check!

  return Bar.previousNote(id, Score.bars(score));
}

export function deleteSelectedNotes(state: State): State {
  // Deletes the selected notes/bars/staves from the score, purges them, modifies and returns the score

  if (!(state.selection instanceof ScoreSelection)) return state;

  let started = false;
  let deletingBars = false;
  const notesToDelete: [Note, Bar][] = [];
  const barsToDelete: [Bar, Stave][] = [];

  all: for (const stave of Score.staves(state.score)) {
    for (const bar of stave.allBars()) {
      if (bar.hasID(state.selection.start)) {
        deletingBars = true;
        started = true;
      }
      for (const note of bar.notesAndTriplets()) {
        if (note.hasID(state.selection.start)) started = true;
        if (started) notesToDelete.push([note, bar]);
        if (note.hasID(state.selection.end)) break all;
      }
      if (started && deletingBars) barsToDelete.push([bar, stave]);
      if (bar.hasID(state.selection.end)) break all;
    }
  }
  notesToDelete.forEach(([note, bar]) => bar.deleteNote(note));

  barsToDelete.forEach(([bar, stave]) => {
    stave.deleteBar(bar);
    if (stave.numberOfBars() === 0)
      state.score.staves.splice(state.score.staves.indexOf(stave), 1);
  });

  return purgeItems(
    [...notesToDelete.map(car), ...barsToDelete.map(car)],
    state
  );
}

function purgeItems(items: Item[], state: State): State {
  // Deletes all references to the items in the array

  const score = deepcopy(state.score);
  for (const note of items) {
    deleteXY(note.id);
    const secondTimingsToDelete: SecondTimingModel[] = [];
    score.secondTimings.forEach((t) => {
      if (t.start === note.id || t.middle === note.id || t.end === note.id) {
        secondTimingsToDelete.push(t);
      }
    });
    secondTimingsToDelete.forEach((t) =>
      score.secondTimings.splice(score.secondTimings.indexOf(t), 1)
    );
    if (
      state.selection instanceof ScoreSelection &&
      (note.hasID(state.selection.start) || note.hasID(state.selection.end))
    ) {
      state.selection = null;
    }
  }
  return state;
}

export function expandSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = nextNote(state.selection.end, state.score);
      if (next) {
        state.selection.end = next.id;
        return viewChanged(state);
      }
    }
    return noChange(state);
  };
}

export function detractSelection(): ScoreEvent {
  return async (state: State) => {
    if (
      state.selection instanceof ScoreSelection &&
      state.selection.start !== state.selection.end
    ) {
      const prev = previousNote(state.selection.end, state.score);
      if (prev) {
        state.selection.end = prev.id;
        return viewChanged(state);
      }
    }
    return noChange(state);
  };
}

export function moveLeft(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const prev = previousNote(state.selection.start, state.score);
      if (prev) {
        return viewChanged({
          ...state,
          selection: new ScoreSelection(prev.id, prev.id),
        });
      }
    }
    return noChange(state);
  };
}

export function moveRight(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      const next = nextNote(state.selection.end, state.score);
      if (next) {
        return viewChanged({
          ...state,
          selection: new ScoreSelection(next.id, next.id),
        });
      }
    }
    return noChange(state);
  };
}
export function updateDemoNote(
  x: number,
  staveIndex: number | null
): ScoreEvent {
  return async (state: State) =>
    state.note.demo
      ? viewChanged({
          ...state,
          note: {
            ...state.note,
            demo: {
              ...state.note.demo,
              staveIndex: staveIndex || 0,
              pitch: (staveIndex !== null || null) && state.note.demo.pitch,
              x,
            },
          },
        })
      : noChange(state);
}

export function moveNoteUp(): ScoreEvent {
  return async (state: State) => {
    if (!state.selection) return noChange(state);
    state.selection.notes(state.score).forEach((note) => note.moveUp());
    return shouldSave(state);
  };
}

export function moveNoteDown(): ScoreEvent {
  return async (state: State) => {
    if (!state.selection) return noChange(state);
    state.selection.notes(state.score).forEach((note) => note.moveDown());
    return shouldSave(state);
  };
}
export function addNoteToBarStart(pitch: Pitch, bar: Bar): ScoreEvent {
  return async (state: State) => addNote(pitch, bar, state);
}

export function tieSelectedNotes(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return noChange(state);
    state.selection
      .notesAndTriplets(state.score)
      .forEach((note) => note.toggleTie(allNotesAndTriplets(state.score)));
    return shouldSave(state);
  };
}

export function addTriplet(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return noChange(state);
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
        return shouldSave(state);
      }
    } else if (selectedNotesAndTriplets.length >= 1) {
      const tr = selectedNotesAndTriplets[0];
      if (tr instanceof Triplet) {
        const { bar } = location(tr, state.score);
        bar.unmakeTriplet(tr);
        return shouldSave(state);
      }
    }
    return noChange(state);
  };
}

export function toggleDot(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection) {
      state.selection
        .notesAndTriplets(state.score)
        .forEach((note) => note.toggleDot());
    }
    return shouldSave({
      ...state,
      note:
        state.note.demo && state.note.demo.type === 'note'
          ? {
              ...state.note,
              demo: {
                ...state.note.demo,
                length: dot(state.note.demo.length),
              },
            }
          : state.note,
    });
  };
}
export function addNoteAfter(
  pitch: Pitch,
  noteBefore: Note | Triplet
): ScoreEvent {
  return async (state: State) => addNote(pitch, noteBefore, state);
}
export function stopInputtingNotes(): ScoreEvent {
  return async (state: State) => viewChanged(removeState(state));
}

export function clickNote(
  note: SingleNote | TripletNote,
  event: MouseEvent
): ScoreEvent {
  return async (state: State) => {
    state = removeTextState(state);
    if (state.gracenote.input) {
      const previous = previousNote(note.id, state.score);
      note.addGracenote(state.gracenote.input, previous);
      return shouldSave(state);
    } else {
      const stateAfterFirstSelection = viewChanged({
        ...state,
        justClickedNote: true,
        note: { dragged: note, demo: null },
        selection: new ScoreSelection(note.id, note.id),
      });

      if (event.shiftKey) {
        if (state.selection instanceof ScoreSelection) {
          if (itemBefore(state.selection.end, note.id)) {
            state.selection.end = note.id;
            return viewChanged({
              ...state,
              justClickedNote: true,
              note: { dragged: note, demo: null },
            });
          } else if (itemBefore(note.id, state.selection.start)) {
            state.selection.start = note.id;
            return viewChanged({
              ...state,
              justClickedNote: true,
              note: { dragged: note, demo: null },
            });
          } else {
            return noChange(state);
          }
        }
      }
      return stateAfterFirstSelection;
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
    return shouldSave({
      ...state,
      note: {
        ...state.note,
        demo:
          !state.note.demo || state.note.demo.type === 'gracenote'
            ? DemoNote.init(length)
            : state.note.demo.type === 'note' &&
              state.note.demo.length !== length
            ? { ...state.note.demo, length }
            : state.note.demo,
      },
    });
  };
}
export function copy(): ScoreEvent {
  return async (state: State) => {
    if (!(state.selection instanceof ScoreSelection)) return noChange(state);
    const notes = state.selection.notesAndTriplets(state.score);
    if (notes.length > 0) {
      const { bar: initBar } = location(notes[0], state.score);
      let currentBarId = initBar.id;

      const clipboard: (Note | 'bar-break')[] = notes.map((note) => {
        const { bar } = location(note.id, state.score);
        if (currentBarId !== bar.id) {
          clipboard.push('bar-break');
          currentBarId = bar.id;
        }
        return note.copy();
      });

      return noChange({ ...state, clipboard });
    }
    return noChange(state);
  };
}

export function paste(): ScoreEvent {
  return async (state: State) => {
    if (state.selection instanceof ScoreSelection && state.clipboard) {
      const id = state.selection.end;
      const { bar } = location(id, state.score);
      Bar.pasteNotes(state.clipboard, bar, id, Score.bars(state.score));
      return shouldSave(state);
    }
    return noChange(state);
  };
}
