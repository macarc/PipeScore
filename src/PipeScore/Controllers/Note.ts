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
  currentBar,
  removeState,
  removeTextState,
} from './Controller';
import { State } from '../State';

import { Pitch, pitchDown, pitchUp } from '../global/pitch';
import { ID, Item } from '../global/id';
import {
  deepcopy,
  flatten,
  nmap,
  replace,
  replaceIndex,
} from '../global/utils';
import { deleteXY, itemBefore } from '../global/xy';

import { BaseNote, NoteModel, TripletModel, NoteLength } from '../Note/model';
import { BarModel } from '../Bar/model';
import { ScoreModel } from '../Score/model';
import { SecondTimingModel } from '../SecondTiming/model';
import { ScoreSelectionModel } from '../ScoreSelection/model';

import Gracenote from '../Gracenote/functions';
import Note from '../Note/functions';
import Score from '../Score/functions';
import DemoNote from '../DemoNote/functions';

function indexOfId(id: ID, noteModels: Item[]): number {
  // Finds the index of the item with the specified ID in noteModels

  for (let i = 0; i < noteModels.length; i++) {
    if (noteModels[i].id === id) {
      return i;
    }
  }
  return -1;
}

const isBar = (it: NoteModel | TripletModel | BarModel): it is BarModel =>
  (it as BarModel).notes !== undefined;

function addNote(pitch: Pitch, bar: BarModel, state: State): UpdatedState;
function addNote(
  pitch: Pitch,
  noteBefore: NoteModel | TripletModel,
  state: State
): UpdatedState;
function addNote(
  pitch: Pitch,
  where: BarModel | NoteModel | TripletModel,
  state: State
): UpdatedState {
  const noteModels = currentNoteModels(state.score);
  let noteBefore: NoteModel | TripletModel | null;
  const { bar, stave } = currentBar(where.id, state.score);
  if (isBar(where)) {
    const id = previousNote(bar.id, state.score);
    noteBefore = nmap(
      id,
      (id) => noteModels.find((note) => note.id === id) || null
    );
  } else {
    noteBefore = where;
  }
  if (state.note.demo && state.note.demo.type === 'note') {
    const newNote = Note.init(pitch, state.note.demo.length);
    return shouldSave({
      ...state,
      // todo - should we need to correct tie?
      score: makeCorrectTie(newNote, {
        ...state.score,
        staves: replace(stave, 1, state.score.staves, {
          ...stave,
          bars: replace(bar, 1, stave.bars, {
            ...bar,
            notes: replaceIndex(
              nmap(
                noteBefore,
                (noteBefore) => bar.notes.indexOf(noteBefore) + 1
              ) || 0,
              0,
              bar.notes,
              newNote
            ),
          }),
        }),
      }),
    });
  } else if (state.note.demo && state.note.demo.type === 'gracenote') {
    const previousPitch = nmap(noteBefore, (noteBefore) =>
      Note.isTriplet(noteBefore) ? noteBefore.third.pitch : noteBefore.pitch
    );
    const note =
      nmap(
        noteBefore,
        (noteBefore) => noteModels[noteModels.indexOf(noteBefore) + 1]
      ) ||
      noteModels[0] ||
      null;
    if (note && Note.isNoteModel(note)) {
      return shouldSave({
        ...state,
        score: changeNoteFrom(
          note.id,
          {
            ...note,
            gracenote: Gracenote.addSingle(
              note.gracenote,
              pitch,
              note.pitch,
              previousPitch
            ),
          },
          state.score
        ),
      });
    } else if (note && Note.isTriplet(note)) {
      return shouldSave({
        ...state,
        score: changeNoteFrom(
          note.first.id,
          {
            ...note.first,
            gracenote: Gracenote.addSingle(
              note.first.gracenote,
              pitch,
              note.first.pitch,
              previousPitch
            ),
          },
          state.score
        ),
      });
    }
  } else if (state.gracenote.input) {
    const note = nmap(
      noteBefore,
      (noteBefore) => noteModels[noteModels.indexOf(noteBefore) + 1]
    );
    if (note && Note.isNoteModel(note)) {
      return shouldSave({
        ...state,
        score: changeNoteFrom(
          note.id,
          { ...note, gracenote: state.gracenote.input },
          state.score
        ),
      });
    } else if (note && Note.isTriplet(note)) {
      return shouldSave({
        ...state,
        score: changeNoteFrom(
          note.first.id,
          { ...note.first, gracenote: state.gracenote.input },
          state.score
        ),
      });
    }
  }
  return noChange(state);
}

export function currentNoteModels(
  score: ScoreModel
): (NoteModel | TripletModel)[] {
  // Flattens all the notes in the score into an array

  const bars = Score.bars(score);
  return flatten(bars.map((b) => b.notes));
}

export function selectionToNotes(
  selection: ScoreSelectionModel | null,
  score: ScoreModel,
  noteModels: (NoteModel | TripletModel)[]
): BaseNote[] {
  // Finds all the notes (including notes within triplets) that are selected within noteModels
  // This can't just flatten rawSelectionToNotes because it takes into account that only part of a triplet may be selected,
  // whereas rawSelectionToNotes doesn't

  if (selection === null) return [];
  const notes = Note.flattenTriplets(noteModels);
  let startInd = indexOfId(selection.start, notes);
  let endInd = indexOfId(selection.end, notes);
  if (startInd !== -1 && endInd !== -1) {
    return notes.slice(startInd, endInd + 1);
  } else {
    const bars = Score.bars(score);
    if (startInd === -1) {
      const barIdx = indexOfId(selection.start, bars);
      if (barIdx !== -1) {
        const firstNote = bars[barIdx].notes[0];
        if (firstNote) startInd = indexOfId(firstNote.id, notes);
      }
    }
    if (endInd === -1) {
      const barIdx = indexOfId(selection.end, bars);
      if (barIdx !== -1) {
        const lastNote = bars[barIdx].notes[bars[barIdx].notes.length - 1];
        if (lastNote) endInd = indexOfId(lastNote.id, notes);
      }
    }

    if (startInd !== -1 && endInd !== -1) {
      return notes.slice(startInd, endInd + 1);
    } else {
      return [];
    }
  }
}

function rawSelectionToNotes(
  noteModels: (NoteModel | TripletModel)[],
  score: ScoreModel,
  selection: ScoreSelectionModel | null
): (NoteModel | TripletModel)[] {
  // Finds all the notes and triplets that are selected within noteModels

  if (selection === null) return [];

  let startInd = indexOfId(selection.start, noteModels);
  let endInd = indexOfId(selection.end, noteModels);
  if (startInd !== -1 && endInd !== -1) {
    return noteModels.slice(startInd, endInd + 1);
  } else {
    const bars = Score.bars(score);
    if (startInd === -1) {
      const barIdx = indexOfId(selection.start, bars);
      if (barIdx !== -1) {
        const firstNote = bars[barIdx].notes[0];
        if (firstNote) startInd = indexOfId(firstNote.id, noteModels);
      } else {
        for (const note of noteModels) {
          if (
            Note.isTriplet(note) &&
            [note.first.id, note.second.id, note.third.id].includes(
              selection.start
            )
          ) {
            startInd = indexOfId(note.id, noteModels);
          }
        }
      }
    }
    if (endInd === -1) {
      const barIdx = indexOfId(selection.end, bars);
      if (barIdx !== -1) {
        const lastNote = bars[barIdx].notes[bars[barIdx].notes.length - 1];
        if (lastNote) endInd = indexOfId(lastNote.id, noteModels);
      } else {
        for (const note of noteModels) {
          if (
            Note.isTriplet(note) &&
            [note.first.id, note.second.id, note.third.id].includes(
              selection.end
            )
          ) {
            endInd = indexOfId(note.id, noteModels);
          }
        }
      }
    }

    if (startInd !== -1 && endInd !== -1) {
      return noteModels.slice(startInd, endInd + 1);
    } else {
      return [];
    }
  }
}
function nextNote(id: ID, score: ScoreModel): ID | null {
  let lastWasIt = false;
  for (let i = 0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j = 0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      lastWasIt = lastWasIt || bar.id === id;
      for (let k = 0; k < bar.notes.length; k++) {
        const note = bar.notes[k];

        if (Note.isTriplet(note)) {
          if (lastWasIt) return note.first.id;
          if (note.first.id === id) return note.second.id;
          if (note.second.id === id) return note.third.id;
          lastWasIt = note.third.id === id;
        } else {
          if (lastWasIt) return note.id;
          lastWasIt = note.id === id;
        }
      }
    }
  }
  return null;
}

function previousNote(id: ID, score: ScoreModel): ID | null {
  let last: ID | null = null;
  for (let i = 0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j = 0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      if (bar.id === id) return last;
      for (let k = 0; k < bar.notes.length; k++) {
        const note = bar.notes[k];

        if (Note.isTriplet(note)) {
          if (note.first.id === id) return last;
          if (note.second.id === id) return note.first.id;
          if (note.third.id === id) return note.second.id;
          last = note.third.id;
        } else {
          if (note.id === id) return last;
          last = note.id;
        }
      }
    }
  }
  return null;
}

function makeCorrectTie(
  noteModel: NoteModel | TripletModel,
  score: ScoreModel
): ScoreModel {
  // Corrects the pitches of any notes tied to noteModel

  const bars = Score.bars(score);
  const noteModels = flatten(bars.map((b) => b.notes));

  const pitch = Note.isTriplet(noteModel)
    ? noteModel.first.pitch
    : noteModel.pitch;
  for (let i = 0; i < noteModels.length; i++) {
    if (noteModels[i].id === noteModel.id) {
      let b = i;
      let previousNote = noteModels[b];
      while (b > 0 && previousNote.tied) {
        previousNote = noteModels[b - 1];
        if (Note.isTriplet(previousNote)) {
          previousNote.third.pitch = pitch;
          break;
        } else {
          previousNote.pitch = pitch;
          b -= 1;
        }
      }
      if (Note.isNoteModel(noteModel)) {
        let a = i;
        let nextNote = noteModels[a + 1];
        while (a < noteModels.length - 1 && nextNote.tied) {
          if (Note.isTriplet(nextNote)) {
            if (nextNote.tied) {
              nextNote.first.pitch = pitch;
              break;
            }
          } else {
            nextNote.pitch = pitch;
            a += 1;
            nextNote = noteModels[a + 1];
          }
        }
        break;
      }
    }
  }

  return score;
}

function pasteNotes(
  notes: (NoteModel | TripletModel | 'bar-break')[],
  start: BarModel,
  index: number,
  score: ScoreModel
): ScoreModel {
  // Puts all the notes in the notes array into the score with the correct bar breaks
  // Does *not* change ids, e.t.c. so notes should already be unique with notes on score

  // TODO make immutable

  let startedPasting = false;

  for (let i = 0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j = 0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      if (bar.id === start.id || startedPasting) {
        if (bar.id === start.id) {
          if (index !== bar.notes.length) {
            bar.notes.splice(
              index,
              0,
              ...(notes.filter((note) => note !== 'bar-break') as (
                | NoteModel
                | TripletModel
              )[])
            );
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            return score;
          }
        } else {
          bar.notes = [];
        }
        startedPasting = true;
        let currentPastingNote = notes.shift();
        while (currentPastingNote && currentPastingNote !== 'bar-break') {
          bar.notes.push(currentPastingNote);
          currentPastingNote = notes.shift();
        }
        if (notes.length === 0) {
          stave.bars[j] = { ...bar };
          score.staves[i] = { ...stave };
          return score;
        }
      }

      if (startedPasting) stave.bars[j] = { ...bar };
    }

    if (startedPasting) score.staves[i] = { ...stave };
  }

  return score;
}

export function deleteSelectedNotes(state: State): State {
  // Deletes the selected notes/bars/staves from the score, purges them, modifies and returns the score

  if (state.selection === null) return state;

  let started = false;
  let deletingBars = false;
  const itemsDeleted: Item[] = [];

  all: for (let i = 0; i < state.score.staves.length; i++) {
    const stave = state.score.staves[i];
    for (let j = 0; j < stave.bars.length; ) {
      const bar = stave.bars[j];
      if (state.selection.start === bar.id) {
        deletingBars = true;
        started = true;
      }
      for (let k = 0; k < bar.notes.length; ) {
        const n = bar.notes[k];
        if (state.selection.start === n.id) {
          started = true;
        } else if (
          Note.isTriplet(n) &&
          [n.first.id, n.second.id, n.third.id].includes(state.selection.start)
        ) {
          started = true;
        }

        if (started) {
          itemsDeleted.push(...bar.notes.splice(k, 1));
        } else {
          k++;
        }

        if (state.selection.end === n.id) {
          break all;
        } else if (
          Note.isTriplet(n) &&
          [n.first.id, n.second.id, n.third.id].includes(state.selection.end)
        ) {
          break all;
        }
      }

      if (started && deletingBars) {
        itemsDeleted.push(...stave.bars.splice(j, 1));
        if (stave.bars.length === 0) {
          state.score.staves.splice(i, 1);
        }
      } else {
        j++;
      }

      if (state.selection.end === bar.id) break all;
    }
  }
  return purgeItems(itemsDeleted, state);
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
      state.selection &&
      (note.id === state.selection.start || note.id === state.selection.end)
    ) {
      state.selection = null;
    }
  }
  return state;
}
type BaseNoteCallback = <A extends NoteModel | BaseNote>(
  note: A,
  replace: (newNote: A) => void
) => boolean;
type TripletModelCallback = <A extends NoteModel | TripletModel>(
  note: A,
  replace: (newNote: A) => void
) => boolean;

const coerceToTripletCallback = (
  f: TripletModelCallback | BaseNoteCallback
): f is TripletModelCallback => true;
const coerceToBaseCallback = (
  f: TripletModelCallback | BaseNoteCallback
): f is BaseNoteCallback => true;

export function noteMap(
  f: BaseNoteCallback,
  score: ScoreModel,
  tripletModels: false
): ScoreModel;
export function noteMap(
  f: TripletModelCallback,
  score: ScoreModel,
  tripletModels: true
): ScoreModel;
export function noteMap(
  f: BaseNoteCallback | TripletModelCallback,
  score: ScoreModel,
  tripletModels: boolean
): ScoreModel {
  // Maps over every NoteModel and BaseNote in the score, calling f(note) with each one

  for (let i = 0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j = 0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      for (let k = 0; k < bar.notes.length; k++) {
        const n = bar.notes[k];

        if (Note.isNoteModel(n) && coerceToBaseCallback(f)) {
          const done = f(n, (newNote: NoteModel) => {
            bar.notes[k] = { ...newNote };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            score = makeCorrectTie(newNote, score);
          });
          if (done) return score;
        } else if (Note.isTriplet(n)) {
          if (tripletModels && coerceToTripletCallback(f)) {
            const done = f(n, (newTriplet: TripletModel) => {
              bar.notes[k] = { ...newTriplet };
              stave.bars[j] = { ...bar };
              score.staves[i] = { ...stave };
              score = makeCorrectTie(newTriplet, score);
            });
            if (done) return score;
          } else if (coerceToBaseCallback(f)) {
            let done = false;
            done = f(n.first, (newNote: BaseNote) => {
              n.first = { ...newNote };
              bar.notes[k] = { ...n };
              stave.bars[j] = { ...bar };
              score.staves[i] = { ...stave };

              score = makeCorrectTie(n, score);
            });
            if (done) return score;
            done = f(n.second, (newNote: BaseNote) => {
              n.second = { ...newNote };
              bar.notes[k] = { ...n };
              stave.bars[j] = { ...bar };
              score.staves[i] = { ...stave };

              // Don't need to make correct tie here, as second note is never tied
            });
            if (done) return score;
            done = f(n.third, (newNote: BaseNote) => {
              n.third = { ...newNote };
              bar.notes[k] = { ...n };
              stave.bars[j] = { ...bar };
              score.staves[i] = { ...stave };

              score = makeCorrectTie(n, score);
            });
            if (done) return score;
          }
        }
      }
    }
  }
  return score;
}

export function changeNoteFrom(
  id: ID,
  note: NoteModel | BaseNote,
  score: ScoreModel
): ScoreModel {
  // Replaces note in score

  return noteMap(
    <A extends NoteModel | BaseNote>(n: A, replace: (newNote: A) => void) => {
      if (n.id === id) {
        replace(note as A);
        return true;
      } else {
        return false;
      }
    },
    score,
    false
  );
}

export function changeTripletNoteFrom(
  id: ID,
  newNote: BaseNote,
  score: ScoreModel
): ScoreModel {
  // Replaces triplet note with newNote in the score

  return noteMap(
    <A extends NoteModel | BaseNote>(n: A, replace: (newNote: A) => void) => {
      if (!Note.isNoteModel(n) && n.id === id) {
        replace(newNote as A);
        return true;
      } else {
        return false;
      }
    },
    score,
    false
  );
}

export function changeNotes(
  notes: (NoteModel | BaseNote)[],
  f: <T extends NoteModel | BaseNote>(note: T) => T,
  score: ScoreModel
): ScoreModel {
  // Replaces each note with f(note) in the score

  let notesChanged = 0;
  return noteMap(
    (n, replace) => {
      if (notes.includes(n)) {
        const newNote = f(n);
        replace(newNote);
        notesChanged++;

        return notesChanged === notes.length;
      } else {
        return false;
      }
    },
    score,
    false
  );
}
function changeNotesAndTriplets(
  notes: (NoteModel | TripletModel)[],
  f: <T extends NoteModel | TripletModel>(note: T) => T,
  score: ScoreModel
): ScoreModel {
  // Replaces each note with f(note) in the score

  let notesChanged = 0;
  return noteMap(
    (n, replace) => {
      if (notes.includes(n)) {
        const newNote = f(n);
        replace(newNote);
        notesChanged++;

        return notesChanged === notes.length;
      } else {
        return false;
      }
    },
    score,
    true
  );
}
export function expandSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      const next = nextNote(state.selection.end, state.score);
      if (next) {
        return viewChanged({
          ...state,
          selection: { ...state.selection, end: next },
        });
      }
    }
    return noChange(state);
  };
}

export function detractSelection(): ScoreEvent {
  return async (state: State) => {
    if (state.selection && state.selection.start !== state.selection.end) {
      const prev = previousNote(state.selection.end, state.score);
      if (prev) {
        return viewChanged({
          ...state,
          selection: { ...state.selection, end: prev },
        });
      }
    }
    return noChange(state);
  };
}

export function moveLeft(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      const prev = previousNote(state.selection.start, state.score);
      if (prev) {
        return viewChanged({
          ...state,
          selection: { start: prev, end: prev },
        });
      }
    }
    return noChange(state);
  };
}

export function moveRight(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      const next = nextNote(state.selection.end, state.score);
      if (next) {
        return viewChanged({
          ...state,
          selection: { start: next, end: next },
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
    const selectedNotes = selectionToNotes(
      state.selection,
      state.score,
      currentNoteModels(state.score)
    );
    return selectedNotes.length > 0
      ? shouldSave({
          ...state,
          score: changeNotes(
            selectedNotes,
            (note) => ({ ...note, pitch: pitchUp(note.pitch) }),
            state.score
          ),
        })
      : noChange(state);
  };
}

export function moveNoteDown(): ScoreEvent {
  return async (state: State) => {
    const selectedNotes = selectionToNotes(
      state.selection,
      state.score,
      currentNoteModels(state.score)
    );
    return selectedNotes.length > 0
      ? shouldSave({
          ...state,
          score: changeNotes(
            selectedNotes,
            (note) => ({ ...note, pitch: pitchDown(note.pitch) }),
            state.score
          ),
        })
      : noChange(state);
  };
}
export function addNoteToBarStart(pitch: Pitch, bar: BarModel): ScoreEvent {
  return async (state: State) => addNote(pitch, bar, state);
}

export function tieSelectedNotes(): ScoreEvent {
  return async (state: State) =>
    selectionToNotes(
      state.selection,
      state.score,
      currentNoteModels(state.score)
    ).length > 0
      ? shouldSave({
          ...state,
          score: changeNotesAndTriplets(
            rawSelectionToNotes(
              currentNoteModels(state.score),
              state.score,
              state.selection
            ),
            (note) => ({ ...note, tied: !note.tied }),
            state.score
          ),
        })
      : noChange(state);
}

export function addTriplet(): ScoreEvent {
  return async (state: State) => {
    const noteModels = currentNoteModels(state.score);
    const rawSelectedNotes = rawSelectionToNotes(
      noteModels,
      state.score,
      state.selection
    );
    const selectedNotes = selectionToNotes(
      state.selection,
      state.score,
      noteModels
    );

    if (selectedNotes.length >= 3) {
      const first = selectedNotes[0];
      const second = selectedNotes[1];
      const third = selectedNotes[2];
      if (
        Note.isNoteModel(first) &&
        Note.isNoteModel(second) &&
        Note.isNoteModel(third)
      ) {
        const { bar, stave } = currentBar(first, state.score);
        return shouldSave({
          ...state,
          score: {
            ...state.score,
            staves: replace(stave, 1, state.score.staves, {
              ...stave,
              bars: replace(bar, 1, stave.bars, {
                ...bar,
                notes: replace(
                  first,
                  3,
                  bar.notes,
                  Note.initTriplet(first, second, third)
                ),
              }),
            }),
          },
        });
      }
    } else if (rawSelectedNotes.length >= 1) {
      const tr = rawSelectedNotes[0];
      if (Note.isTriplet(tr)) {
        const { bar, stave } = currentBar(tr, state.score);

        return shouldSave({
          ...state,
          score: {
            ...state.score,
            staves: replace(stave, 1, state.score.staves, {
              ...stave,
              bars: replace(bar, 1, stave.bars, {
                ...bar,
                notes: replace(tr, 1, bar.notes, ...Note.tripletNoteModels(tr)),
              }),
            }),
          },
        });
      }
    }
    return noChange(state);
  };
}

export function toggleDot(): ScoreEvent {
  return async (state: State) =>
    shouldSave({
      ...state,
      score: changeNotesAndTriplets(
        rawSelectionToNotes(
          currentNoteModels(state.score),
          state.score,
          state.selection
        ),
        (note) => ({ ...note, length: Note.toggleDot(note.length) }),
        state.score
      ),
      note:
        state.note.demo && state.note.demo.type === 'note'
          ? {
              ...state.note,
              demo: {
                ...state.note.demo,
                length: Note.toggleDot(state.note.demo.length),
              },
            }
          : state.note,
    });
}
export function addNoteAfter(
  pitch: Pitch,
  noteBefore: NoteModel | TripletModel
): ScoreEvent {
  return async (state: State) => addNote(pitch, noteBefore, state);
}
export function stopInputtingNotes(): ScoreEvent {
  return async (state: State) => viewChanged(removeState(state));
}

export function clickNote(note: BaseNote, event: MouseEvent): ScoreEvent {
  return async (state: State) => {
    state = removeTextState(state);
    if (state.gracenote.input) {
      if (Note.isNoteModel(note)) {
        return shouldSave({
          ...state,
          score: changeNoteFrom(
            note.id,
            { ...note, gracenote: state.gracenote.input },
            state.score
          ),
        });
      } else {
        return shouldSave({
          ...state,
          score: changeTripletNoteFrom(
            note.id,
            { ...note, gracenote: state.gracenote.input },
            state.score
          ),
        });
      }
    } else {
      const stateAfterFirstSelection = viewChanged({
        ...state,
        justClickedNote: true,
        note: { dragged: note, demo: null },
        selection: { start: note.id, end: note.id },
      });

      if (!event.shiftKey) {
        return stateAfterFirstSelection;
      } else {
        if (state.selection === null) {
          return stateAfterFirstSelection;
        } else {
          if (itemBefore(state.selection.end, note.id)) {
            return viewChanged({
              ...state,
              justClickedNote: true,
              note: { dragged: note, demo: null },
              selection: { ...state.selection, end: note.id },
            });
          } else if (itemBefore(note.id, state.selection.start)) {
            return viewChanged({
              ...state,
              justClickedNote: true,
              note: { dragged: note, demo: null },
              selection: { ...state.selection, start: note.id },
            });
          }
        }
      }
    }
    return noChange(state);
  };
}

export function setInputLength(length: NoteLength): ScoreEvent {
  return async (state: State) =>
    shouldSave({
      ...state,
      score: changeNotesAndTriplets(
        rawSelectionToNotes(
          currentNoteModels(state.score),
          state.score,
          state.selection
        ),
        (note) => ({ ...note, length: length }),
        state.score
      ),
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
}
export function copy(): ScoreEvent {
  return async (state: State) => {
    const rawSelectedNotes = rawSelectionToNotes(
      currentNoteModels(state.score),
      state.score,
      state.selection
    );
    if (rawSelectedNotes.length > 0) {
      const clipboard: (NoteModel | TripletModel | 'bar-break')[] = [];
      const { bar: initBar } = currentBar(rawSelectedNotes[0], state.score);
      let currentBarId = initBar.id;
      for (const note of rawSelectedNotes) {
        const { bar } = currentBar(note.id, state.score);
        if (currentBarId !== bar.id) {
          clipboard.push('bar-break');
          currentBarId = bar.id;
        }
        clipboard.push(deepcopy(note));
      }

      return noChange({ ...state, clipboard });
    }
    return noChange(state);
  };
}

export function paste(): ScoreEvent {
  return async (state: State) => {
    if (state.selection && state.clipboard) {
      const toPaste = state.clipboard.map((n) =>
        n === 'bar-break' ? n : Note.copyNote(n)
      );
      const id = state.selection.end;
      const { bar } = currentBar(id, state.score);
      const indexInBar = bar.notes.findIndex((n) => n.id === id);
      const indexToPlace =
        indexInBar === -1 ? bar.notes.length : indexInBar + 1;
      return shouldSave({
        ...state,
        score: pasteNotes(toPaste, bar, indexToPlace, state.score),
      });
    }
    return noChange(state);
  };
}
