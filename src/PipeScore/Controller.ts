/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import patch from '../render/vdom';
import { h, hFrom, V } from '../render/h';
import * as ScoreEvent from './Event';

import { ScoreModel } from './Score/model';
import { StaveModel } from './Stave/model';
import { BarModel } from './Bar/model';
import { NoteModel, TripletModel, BaseNote } from './Note/model';
import { GracenoteModel } from './Gracenote/model';
import { ScoreSelectionModel } from './ScoreSelection/model';
import { SecondTimingModel, DraggedSecondTiming } from './SecondTiming/model';
import { TimeSignatureModel } from './TimeSignature/model';
import { TextBoxModel } from './TextBox/model';
import { DemoNoteModel } from './DemoNote/model';
import { Menu } from './UI/model';

import playScore from './Score/play';

import Score from './Score/functions';
import Stave from './Stave/functions';
import Note from './Note/functions';
import Gracenote from './Gracenote/functions';
import TextBox from './TextBox/functions';
import SecondTiming from './SecondTiming/functions';
import DemoNote from './DemoNote/functions';
import TimeSignature from './TimeSignature/functions';
import { editTimeSignature } from './TimeSignature/view';

import renderScore, { coordinateToStaveIndex } from './Score/view';
import renderUI from './UI/view';

import { deleteXY, closestItem, itemBefore } from './global/xy';
import dialogueBox from './global/dialogueBox';
import { ID, Item } from './global/types';
import { pitchUp, pitchDown } from './global/pitch';

import { flatten, deepcopy } from './global/utils';

import { GracenoteState } from './Gracenote/view';
import { TextBoxState } from './TextBox/view';

import Documentation from './Documentation';

import { PlaybackState, stopAudio, playback } from './Playback';


// Apart from state.score, all of these can be modified
// state.score should not be modified, but copied, so that it can be diffed quickly
interface State {
  draggedNote: BaseNote | null,
  demoNote: DemoNoteModel | null,
  gracenoteState: GracenoteState,
  playbackState: PlaybackState,
  currentMenu: Menu,
  zoomLevel: number,
  justClickedNote: boolean,
  interfaceWidth: number,
  textBoxState: TextBoxState,
  currentDocumentation: string | null,
  showDocumentation: boolean,
  clipboard: (NoteModel | TripletModel | 'bar-break')[] | null,
  selection: ScoreSelectionModel | null,
  draggedText: TextBoxModel | null,
  inputGracenote: GracenoteModel | null,
  score: ScoreModel,
  history: string[],
  future: string[],
  draggedSecondTiming: DraggedSecondTiming | null,
  view: V | null,
  uiView: V | null
}
const state: State = {
  draggedNote: null,
  gracenoteState: { dragged: null },
  playbackState: { bpm: 100 },
  currentMenu: 'normal',
  zoomLevel: 0,
  textBoxState: { selectedText: null },
  currentDocumentation: null,
  showDocumentation: true,
  justClickedNote: false,
  inputGracenote: null,
  interfaceWidth: 300,
  demoNote: null,
  clipboard: null,
  selection: null,
  draggedText: null,
  draggedSecondTiming: null,
  score: Score.init(),
  history: [],
  future: [],
  view: null,
  uiView: null
}


let save: (score: ScoreModel) => void = () => null;

function removeState(state: State) {
  // Removes parts of the state that could be dirty after undo / redo

  state.draggedNote = null;
  state.gracenoteState.dragged = null;
  state.textBoxState.selectedText = null;
  state.selection = null;
  state.draggedText = null;
  state.draggedSecondTiming = null;
}

type BaseNoteCallback = <A extends NoteModel | BaseNote>(note: A, replace: (newNote: A) => void) => boolean;
type TripletModelCallback = <A extends NoteModel | TripletModel>(note: A, replace: (newNote: A) => void) => boolean;

const coerceToTripletCallback = (f: TripletModelCallback | BaseNoteCallback): f is TripletModelCallback => true;
const coerceToBaseCallback = (f: TripletModelCallback | BaseNoteCallback): f is BaseNoteCallback => true;

function noteMap(f: BaseNoteCallback, score: ScoreModel, tripletModels: false): ScoreModel
function noteMap(f: TripletModelCallback, score: ScoreModel, tripletModels: true): ScoreModel
function noteMap(f: BaseNoteCallback | TripletModelCallback, score: ScoreModel, tripletModels: boolean): ScoreModel {
  // Maps over every NoteModel and BaseNote in the score, calling f(note) with each one

  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      for (let k=0; k < bar.notes.length; k++) {
        const n = bar.notes[k];

        if (Note.isNoteModel(n) && coerceToBaseCallback(f)) {
          const done = f(n, (newNote: NoteModel) => {
            bar.notes[k] = { ...newNote };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            makeCorrectTie(newNote, score);
          });
          if (done) return score;
        } else if (Note.isTriplet(n)) {
          if (tripletModels && coerceToTripletCallback(f)) {
            const done = f(n, (newTriplet: TripletModel) => {
              bar.notes[k] = { ...newTriplet };
              stave.bars[j] = { ...bar };
              score.staves[i] = { ...stave };
              makeCorrectTie(newTriplet, score);
            });
            if (done) return score;
          } else if (coerceToBaseCallback(f)) {
            let done = false;
            done = f(n.first, (newNote: BaseNote) => {
              n.first = { ...newNote };
              bar.notes[k] = { ...n };
              stave.bars[j] = { ...bar };
              score.staves[i] = { ...stave };

              makeCorrectTie(n, score);
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

              makeCorrectTie(n, score);
            });
            if (done) return score;
          }
        }
      }
    }
  }
  return score;
}

function changeNoteFrom(id: ID, note: NoteModel | BaseNote, score: ScoreModel): ScoreModel {
  // Replaces note in score

  return noteMap(<A extends NoteModel | BaseNote>(n: A, replace: (newNote: A) => void) => {
    if (n.id === id) {
      replace(note as A);
      return true;
    } else {
      return false;
    }
  }, score, false);
}

function changeTripletNoteFrom(id: ID, newNote: BaseNote, score: ScoreModel): ScoreModel {
  // Replaces triplet note with newNote in the score

  return noteMap(<A extends NoteModel | BaseNote>(n: A, replace: (newNote: A) => void) => {
    if (! Note.isNoteModel(n) && n.id === id) {
      replace(newNote as A);
      return true;
    } else {
      return false;
    }
  }, score, false);
}

function changeNotes(notes: (NoteModel | BaseNote)[], f: <T extends NoteModel | BaseNote>(note: T) => T, score: ScoreModel): ScoreModel {
  // Replaces each note with f(note) in the score

  let notesChanged = 0;
  return noteMap((n,replace) => {
    if (notes.includes(n)) {
      const newNote = f(n);
      replace(newNote);
      notesChanged++;

      return notesChanged === notes.length;
    } else {
      return false;
    }
  }, score, false);
}
function changeNotesAndTriplets(notes: (NoteModel | TripletModel)[], f: <T extends NoteModel | TripletModel>(note: T) => T, score: ScoreModel): ScoreModel {
  // Replaces each note with f(note) in the score

  let notesChanged = 0;
  return noteMap((n,replace) => {
    if (notes.includes(n)) {
      const newNote = f(n);
      replace(newNote);
      notesChanged++;

      return notesChanged === notes.length;
    } else {
      return false;
    }
  }, score, true);
}

function changeGracenoteFrom(oldGracenote: GracenoteModel, newGracenote: GracenoteModel, score: ScoreModel): ScoreModel {
  // Replaces oldGracenote with newGracenote

  return noteMap((n,replace) => {
    if (Note.isNoteModel(n) && n.gracenote === oldGracenote) {
      replace({ ...n, gracenote: newGracenote });
      return true;
    }

    return false;
  }, score, false);
}

  function makeCorrectTie(noteModel: NoteModel | TripletModel, score = state.score) {
  // Corrects the pitches of any notes tied to noteModel

  const bars = Score.bars(score);
  const noteModels = flatten(bars.map(b => b.notes));

  const pitch = Note.isTriplet(noteModel) ? noteModel.first.pitch : noteModel.pitch;
  for (let i=0; i < noteModels.length; i++) {
    if (noteModels[i].id === noteModel.id) {
      let b = i;
      let previousNote = noteModels[b];
      while ((b > 0)  && previousNote.tied) {
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
        while ((a < noteModels.length - 1) && nextNote.tied) {
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
}

function pasteNotes(notes: (NoteModel | TripletModel | 'bar-break')[], start: BarModel, index: number, score: ScoreModel): ScoreModel {
  // Puts all the notes in the notes array into the score with the correct bar breaks
  // Does *not* change ids, e.t.c. so notes should already be unique with notes on score

  let startedPasting = false;

  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j = 0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      if ((bar.id === start.id) || startedPasting) {
        if (bar.id === start.id) {
          if (index !== bar.notes.length) {
            bar.notes.splice(index, 0, ...notes.filter(note => note !== 'bar-break') as (NoteModel | TripletModel)[])
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

function deleteSelection(selection: ScoreSelectionModel, score: ScoreModel): ScoreModel {
  // Deletes the selected notes/bars/staves from the score, purges them, modifies and returns the score

  let started = false;
  let deletingBars = false;
  const itemsDeleted: Item[] = [];

  all:
  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j = 0; j < stave.bars.length; ) {
      const bar = stave.bars[j];
      if (selection.start === bar.id) {
        deletingBars = true;
        started = true;
      }
      for (let k=0; k < bar.notes.length; ) {
        const n = bar.notes[k];
        if (selection.start === n.id) {
          started = true;
        } else if (Note.isTriplet(n) && [n.first.id,n.second.id,n.third.id].includes(selection.start)) {
          started = true;
        }

        if (started) {
          itemsDeleted.push(...bar.notes.splice(k, 1));
        } else {
          k++;
        }

        if (selection.end === n.id) {
          break all;
        } else if (Note.isTriplet(n) && [n.first.id,n.second.id,n.third.id].includes(selection.end)) {
          break all;
        }
      }

      if (started && deletingBars) {
        itemsDeleted.push(...stave.bars.splice(j, 1));
        if (stave.bars.length === 0) {
          score.staves.splice(i, 1);
        }
      } else {
        j++;
      }

      if (selection.end === bar.id) break all;

    }
  }
  score = purgeItems(itemsDeleted, score);
  return { ...score };
}

function purgeItems(items: Item[], oldScore: ScoreModel): ScoreModel {
  // Deletes all references to the items in the array

  const score = { ...oldScore };
  for (const note of items) {
    deleteXY(note.id);
    const secondTimingsToDelete: SecondTimingModel[] = [];
    score.secondTimings.forEach(t => {
      if (t.start === note.id || t.middle === note.id || t.end === note.id) {
        secondTimingsToDelete.push(t);
      }
    });
    secondTimingsToDelete.forEach(t => score.secondTimings.splice(score.secondTimings.indexOf(t), 1));
    if (state.selection && (note.id === state.selection.start || note.id === state.selection.end)) {
      state.selection = null;
    }
  }
  return score;
}

function nextNote(id: ID, score: ScoreModel): ID | null {
  let lastWasIt = false;
  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      lastWasIt = lastWasIt || (bar.id === id);
      for (let k=0; k < bar.notes.length; k++) {
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
  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      if (bar.id === id) return last;
      for (let k=0; k < bar.notes.length; k++) {
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

function removeNoteState() {
  state.demoNote = null;
  state.draggedNote = null;
  state.inputGracenote = null;
  state.selection = null;
}

function removeTextState() {
  state.draggedText = null;
  state.textBoxState.selectedText = null;
}

export async function dispatch(event: ScoreEvent.ScoreEvent): Promise<void> {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let viewChanged = true;
  // Setting shouldSave will not force saving, it will just mean that the score will be diffed and saved if it is different
  let shouldSave = false;
  const noteModels = currentNoteModels();
  const rawSelectedNotes = rawSelectionToNotes(noteModels);
  const selectedNotes = selectionToNotes(noteModels);

  //
  // STATE events
  // Events that modify the state rather than the score
  //
  if (state.justClickedNote && ScoreEvent.isMouseMovedOver(event)) {
    // This occurs when the note's head is changed from receiving pointer events to not receiving them.
    // That triggers a mouseOver on the note box below, which is undesirable as it moves the note head.
    state.justClickedNote = false;
    viewChanged = false;
  } else if (ScoreEvent.isNoteClicked(event)) {
    removeTextState();
    if (state.inputGracenote) {
      if (Note.isNoteModel(event.note)) {
        state.score = changeNoteFrom(event.note.id, { ...event.note, gracenote: state.inputGracenote }, state.score);
      } else {
        state.score = changeTripletNoteFrom(event.note.id, { ...event.note, gracenote: state.inputGracenote }, state.score);
      }
      shouldSave = true;
    } else {
      state.demoNote = null;
      state.draggedNote = event.note;
      state.justClickedNote = true;
      if (! event.event.shiftKey) {
        state.selection = { start: event.note.id, end: event.note.id };
      } else {
        if (state.selection === null) {
          state.selection = { start: event.note.id, end: event.note.id };
        } else {
          if (itemBefore(state.selection.end, event.note.id)) {
            state.selection.end = event.note.id;
          } else if (itemBefore(event.note.id, state.selection.start)) {
            state.selection.start = event.note.id;
          }
        }
      }
    }
  } else if (ScoreEvent.isUpdateDemoNote(event)) {
    if (state.demoNote) {
      state.demoNote.staveIndex = event.staveIndex || 0;
      if (event.staveIndex === null) state.demoNote.pitch = null;
      state.demoNote.x = event.x;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isSingleGracenoteClicked(event)) {
    state.justClickedNote = true;
    state.gracenoteState.dragged = event.gracenote;
    state.demoNote = null;
  } else if (ScoreEvent.isBackgroundClicked(event)) {
    removeState(state);
    state.demoNote = null;
    state.inputGracenote = null;
  } else if (ScoreEvent.isMouseUp(event)) {
    if (state.draggedNote || state.gracenoteState.dragged || state.draggedText || state.draggedSecondTiming) {
      state.draggedNote = null;
      state.gracenoteState.dragged = null;
      state.draggedText = null;
      state.draggedSecondTiming = null;
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isTextClicked(event)) {
    removeNoteState();
    state.textBoxState.selectedText = event.text
    state.draggedText = event.text;
  } else if (ScoreEvent.isBarClicked(event)) {
    if (event.mouseEvent.shiftKey && state.selection) {
      if (itemBefore(state.selection.end, event.bar.id)) {
        state.selection = { ...state.selection, end: event.bar.id };
      } else if (itemBefore(event.bar.id, state.selection.end)) {
        state.selection = { ...state.selection, start: event.bar.id };
      }
    } else {
      state.selection = { start: event.bar.id, end: event.bar.id };
    }
  } else if (ScoreEvent.isClickSecondTiming(event)) {
    state.draggedSecondTiming = { secondTiming: event.secondTiming, dragged: event.part };
  } else if (ScoreEvent.isTextMouseUp(event)) {
    state.draggedText = null;
    shouldSave = true;
  } else if (ScoreEvent.isSetInputLength(event)) {
    state.inputGracenote = null;
    state.score = changeNotesAndTriplets(rawSelectedNotes, note => ({ ...note, length: event.length }), state.score);
    shouldSave = true;
    if (!state.demoNote || state.demoNote.type === 'gracenote') {
      state.demoNote = DemoNote.init(event.length)
    } else if (state.demoNote.type === 'note' && event.length !== state.demoNote.length) {
      state.demoNote.length = event.length;
    }
  } else if (ScoreEvent.isStopInputtingNotes(event)) {
    viewChanged = false;
    if (state.demoNote) {
      state.demoNote = null;
      viewChanged = true;
    }
    if (state.inputGracenote) {
      state.inputGracenote = null;
      viewChanged = true;
    }
  } else if (ScoreEvent.isExpandSelection(event)) {
    if (state.selection) {
      const next = nextNote(state.selection.end, state.score);
      if (next) {
        state.selection.end = next;
      } else {
        viewChanged = false;
      }
    }
  } else if (ScoreEvent.isDetractSelection(event)) {
    if (state.selection && state.selection.start !== state.selection.end) {
      const prev = previousNote(state.selection.end, state.score);
      if (prev) {
        state.selection.end = prev;
      } else {
        viewChanged = false;
      }
    }
  } else if (ScoreEvent.isChangeZoomLevel(event)) {
    if (event.zoomLevel !== state.zoomLevel) {
      state.zoomLevel = event.zoomLevel;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isStartPlayback(event)) {
    playback(state.playbackState, playScore(state.score));
    viewChanged = false;
  } else if (ScoreEvent.isStopPlayback(event)) {
    stopAudio();
    viewChanged = false;
  } else if (ScoreEvent.isSetPlaybackBpm(event)) {
    state.playbackState.bpm = event.bpm;
    viewChanged = false;
  } else if (ScoreEvent.isPrint(event)) {
    // Printing is a bit annoying on browsers - to print the SVG element, a new window is created
    // and that window is printed
    // That doesn't allow all the control I need though - e.g. margins are there by default which
    // makes it uncentred, and that can't be changed in JS. So I'm just adding a plea to the user to fix it :)

    const blankEl = document.createElement('div');
    const blankH = hFrom(blankEl);
    const props = {
      zoomLevel: 100,
      selection: null,
      noteState: { dragged: null, inputtingNotes: false },
      gracenoteState: { dragged: null },
      textBoxState: { selectedText: null },
      demoNote: null,
      dispatch: () => null
    };

    // Patch it onto a new element with none of the state (e.g. zoom, selected elements)
    patch(blankH, h('div', [renderScore(state.score, props)]));
    const contents = blankEl.innerHTML;

    await dialogueBox([
      h('p', ["When printing, please ensure you set 'Margins' to 'None', for best results."]),
      h('p', ['This means your browser will use the PipeScore margins, rather than its own automatic margins, which will be off-centre.'
      ])], () => null, null, false);
    const popupWindow = window.open('', '_blank', 'scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,resizable');
    if (popupWindow) {
      popupWindow.document.open();
      popupWindow.document.write(`<style>* { font-family: sans-serif; margin: 0; padding: 0; } @page { size: ${state.score.width > state.score.height ? 'landscape' : 'portrait'}; }</style>` + contents);
      popupWindow.print();
      popupWindow.document.close();
    }
  } else if (ScoreEvent.isSetMenu(event)) {
    state.currentMenu = event.menu;
    state.demoNote = null;
    state.inputGracenote = null;
  } else if (ScoreEvent.isDocHover(event)) {
    state.currentDocumentation = event.element;
  } else if (ScoreEvent.isToggleDoc(event)) {
    state.showDocumentation = !state.showDocumentation;
  }

  //
  // SCORE events
  // Events that modify the score
  //
  else if (ScoreEvent.isUndo(event)) {
    if (state.history.length > 1) {
      const last = state.history.pop();
      const beforeLast = state.history.pop();
      if (beforeLast) {
        state.score = JSON.parse(beforeLast);
        if (last) state.future.push(last);
        removeState(state);
        shouldSave = true;
      } else {
        viewChanged = false;
      }
    }
  } else if (ScoreEvent.isRedo(event)) {
    const last = state.future.pop();
    if (last) {
      state.score = JSON.parse(last);
      removeState(state);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isMouseMovedOver(event)) {
    viewChanged = false;

    if (state.demoNote && state.demoNote.pitch !== event.pitch) {
      viewChanged = true;
      state.demoNote.pitch = event.pitch;
    }

    if (state.draggedNote !== null && event.pitch !== state.draggedNote.pitch) {
      viewChanged = true;
      // Don't save here, since it should only be handled on mouse up (to avoid saving intermediate steps)
      if (Note.isNoteModel(state.draggedNote)) {
        const newNote = { ...state.draggedNote, pitch: event.pitch };
        state.score = changeNoteFrom(state.draggedNote.id, newNote, state.score);
        state.draggedNote = newNote;
      } else {
        // It must be a triplet
        const newNote = { ...state.draggedNote, pitch: event.pitch };
        state.score = changeTripletNoteFrom(state.draggedNote.id, newNote, state.score);
        state.draggedNote = newNote;
      }
    }
    if (state.gracenoteState.dragged !== null && event.pitch !== state.gracenoteState.dragged.note) {
      viewChanged = true;
      shouldSave = true;
      const newGracenote = { ...state.gracenoteState.dragged, note: event.pitch };
      state.score = changeGracenoteFrom(state.gracenoteState.dragged, newGracenote, state.score);
      state.gracenoteState.dragged = newGracenote;
    }
  } else if (ScoreEvent.isDeleteSelected(event)) {
    viewChanged = false;

    if (state.selection) {
      viewChanged = true;
      state.score = deleteSelection(state.selection, state.score);
      state.selection = null;
      shouldSave = true;
    }
    if (state.textBoxState.selectedText !== null) {
      viewChanged = true;
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.textBoxState.selectedText), 1);
      state.textBoxState.selectedText = null;
      state.draggedText = null;
      shouldSave = true;
    }
  } else if (ScoreEvent.isSetGracenoteOnSelected(event)) {
    if (state.selection) {
      const newGracenote = Gracenote.from(event.value);
      state.score = changeNotes(selectedNotes, note => ({ ...note, gracenote: newGracenote }), state.score);
      shouldSave = true;
    } else {
      state.inputGracenote = Gracenote.from(event.value);
      state.demoNote = null;
      if (state.inputGracenote.type === 'single') {
        state.demoNote = DemoNote.initDemoGracenote();
      }
    }
  } else if (ScoreEvent.isAddGracenoteToTriplet(event)) {
    if (state.demoNote && state.demoNote.type === 'gracenote') {
      state.score = changeNoteFrom(event.triplet[event.which].id, { ...event.triplet[event.which], gracenote: Gracenote.initSingle(event.pitch) }, state.score);
    } else if (state.inputGracenote) {
      state.score = changeNoteFrom(event.triplet[event.which].id, { ...event.triplet[event.which], gracenote: state.inputGracenote }, state.score);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isMoveNoteUp(event)) {
    if (selectedNotes.length > 0) {
      changeNotes(selectedNotes, note => ({ ...note, pitch: pitchUp(note.pitch) }), state.score);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isMoveNoteDown(event)) {
    if (selectedNotes.length > 0) {
      changeNotes(selectedNotes, note => ({ ...note, pitch: pitchDown(note.pitch) }), state.score);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddNoteAfter(event)) {
    if (state.demoNote && state.demoNote.type === 'note') {
      const { bar, stave } = currentBar(event.noteBefore);
      const newNote = Note.init(event.pitch, state.demoNote.length);
      bar.notes.splice(bar.notes.indexOf(event.noteBefore) + 1, 0, newNote);
      stave.bars[stave.bars.indexOf(bar)] = { ...bar };
      state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };
      shouldSave = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
    } else if (state.demoNote && state.demoNote.type === 'gracenote') {
      const note = noteModels[noteModels.indexOf(event.noteBefore) + 1];
      if (note && Note.isNoteModel(note)) {
        state.score = changeNoteFrom(note.id, { ...note, gracenote: Gracenote.initSingle(event.pitch) }, state.score);
        shouldSave = true;
      } else {
        viewChanged = false;
      }
    } else if (state.inputGracenote) {
      const note = noteModels[noteModels.indexOf(event.noteBefore) + 1];
      if (note && Note.isNoteModel(note)) {
        state.score = changeNoteFrom(note.id, ({ ...note, gracenote: state.inputGracenote }), state.score);
        shouldSave = true;
      } else if (note && Note.isTriplet(note)) {
        state.score = changeNoteFrom(note.first.id, ({ ...note.first, gracenote: state.inputGracenote }), state.score);
        shouldSave = true;
      }
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddNoteToBarStart(event)) {
    if (state.demoNote && state.demoNote.type === 'note') {
      // todo make immutable
      const newNote = Note.init(event.pitch, state.demoNote.length);
      event.bar.notes.unshift(newNote);
      shouldSave = true;
      makeCorrectTie(newNote);
    } else if (state.demoNote && state.demoNote.type === 'gracenote') {
      const note = event.bar.notes[0];
      if (note && Note.isNoteModel(note)) {
        state.score = changeNoteFrom(note.id, { ...note, gracenote: Gracenote.initSingle(event.pitch) }, state.score);
        shouldSave = true;
      } else if (note && Note.isTriplet(note)) {
        state.score = changeNoteFrom(note.first.id, { ...note.first, gracenote: Gracenote.initSingle(event.pitch) }, state.score);
        shouldSave = true;
      } else {
        viewChanged = false;
      }
    } else if (state.inputGracenote) {
      const note = event.bar.notes[0]
      if (note && Note.isNoteModel(note)) {
        state.score = changeNoteFrom(note.id, ({ ...note, gracenote: state.inputGracenote }), state.score);
        shouldSave = true;
      } else if (note && Note.isTriplet(note)) {
        state.score = changeNoteFrom(note.first.id, ({ ...note.first, gracenote: state.inputGracenote }), state.score);
        shouldSave = true;
      } else {
        viewChanged = false;
      }
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isToggleDotted(event)) {
    state.score = changeNotesAndTriplets(rawSelectedNotes,note => ({ ...note, length:  Note.toggleDot(note.length) }), state.score);
    if (state.demoNote && state.demoNote.type === 'note') state.demoNote.length = Note.toggleDot(state.demoNote.length);
    shouldSave = true;
  } else if (ScoreEvent.isAddTriplet(event)) {
    viewChanged = false;
    if (selectedNotes.length >= 3) {
      const first = selectedNotes[0];
      const second = selectedNotes[1];
      const third = selectedNotes[2];
      if (Note.isNoteModel(first) && Note.isNoteModel(second) && Note.isNoteModel(third)) {
        const { bar, stave } = currentBar(first);
        bar.notes.splice(bar.notes.indexOf(first), 3, Note.initTriplet(first,second,third));
        stave.bars[stave.bars.indexOf(bar)] = { ...bar };
        state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };

        viewChanged = true;
        shouldSave = true;
      }
    } else if (rawSelectedNotes.length >= 1) {
      const tr = rawSelectedNotes[0];
      if (Note.isTriplet(tr)) {
        const { bar, stave } = currentBar(tr);

        bar.notes.splice(bar.notes.indexOf(tr), 1, ...Note.tripletNoteModels(tr));
        stave.bars[stave.bars.indexOf(bar)] = { ...bar };
        state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };

        viewChanged = true;
        shouldSave = true;
      }
    }
  } else if (ScoreEvent.isDragSecondTiming(event)) {
    viewChanged = false;
    if (state.draggedSecondTiming) {
      const oldSecondTiming = state.draggedSecondTiming.secondTiming;
      if (state.draggedSecondTiming.secondTiming[state.draggedSecondTiming.dragged] !== event.closest) {
        const newSecondTiming = { ...state.draggedSecondTiming.secondTiming, [state.draggedSecondTiming.dragged]: event.closest };
        if (SecondTiming.isValid(newSecondTiming, state.score.secondTimings.filter(st => st !== oldSecondTiming))) {
          state.score.secondTimings.splice(state.score.secondTimings.indexOf(state.draggedSecondTiming.secondTiming), 1, newSecondTiming);
          state.draggedSecondTiming.secondTiming = newSecondTiming;
          viewChanged = true;
        }
      }
    }
  } else if (ScoreEvent.isTextDragged(event)) {
    if (state.draggedText !== null &&
        event.x < state.score.width &&
        event.x > 0 &&
        event.y < state.score.height &&
        event.y > 0) {
      const newText = TextBox.setCoords(state.draggedText, event.x, event.y);
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.draggedText), 1, newText);
      state.textBoxState.selectedText = newText;
      state.draggedText = newText;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isCentreText(event)) {
    if (state.textBoxState.selectedText !== null) {
      const newText = TextBox.toggleCentre(state.textBoxState.selectedText, state.score.width);
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.textBoxState.selectedText), 1, newText);
      state.textBoxState.selectedText = newText;
      state.draggedText = null;
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddText(event)) {
    state.score = { ...state.score, textBoxes: [ ...state.score.textBoxes, TextBox.init() ] };
    shouldSave = true;
  } else if (ScoreEvent.isEditText(event)) {
    if (event.newText !== event.text.text || event.newSize !== event.text.size) {
      const newTextBox = { ...event.text, size: event.newSize, text: event.newText };
      state.score.textBoxes[state.score.textBoxes.indexOf(event.text)] = newTextBox;
      state.textBoxState.selectedText = newTextBox;
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddAnacrusis(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);
      Stave.addAnacrusis(stave, bar, event.before);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddBar(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);
      Stave.addBar(stave, bar, event.before);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isSetBarRepeat(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);

      // This has to be done because TypeScript :/
      if (event.which === 'frontBarline') {
        bar[event.which] = event.what;
      } else if (event.which === 'backBarline') {
        bar[event.which] = event.what;
      }

      stave.bars[stave.bars.indexOf(bar)] = { ...bar };
      state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isEditBarTimeSignature(event)) {
    if (state.selection !== null) {
      const { bar } = currentBar(state.selection.start);
      const newTimeSignature = await editTimeSignature(bar.timeSignature)
      setTimeSignatureFrom(bar.timeSignature, newTimeSignature);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddStave(event)) {
    if (state.selection) {
      const { stave } = currentBar(state.selection.start);
      Score.addStave(state.score, stave, event.before);
    } else {
      Score.addStave(state.score, state.score.staves[state.score.staves.length - 1], event.before);
    }
    shouldSave = true;
  } else if (ScoreEvent.isTieSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      state.score = changeNotesAndTriplets(rawSelectedNotes, note => ({ ...note, tied: !note.tied }), state.score);
      shouldSave = true;
    } else {
      viewChanged = false;
    }
  } else if (ScoreEvent.isAddSecondTiming(event)) {
    viewChanged = false;
    if (state.selection) {
      const { bar: start } = currentBar(state.selection.start);
      let middle: ID | null = null;
      let end: ID | null = null;
      let started = false;
      all:
      for (const stave of state.score.staves) {
        for (const bar of stave.bars) {
          if (started) {
            middle = bar.id;
            end = bar.id;
            break all;
          }
          if (bar === start) {
            started = true;
          }
        }
      }
      if (middle && end) {
        const newSecondTiming = SecondTiming.init(start.id, middle, end);
        if (SecondTiming.isValid(newSecondTiming, state.score.secondTimings)) {
          state.score.secondTimings.push(newSecondTiming);
          viewChanged = false;
          shouldSave = true;
        }
      }
    }
  } else if (ScoreEvent.isEditTimeSignature(event)) {
    setTimeSignatureFrom(event.timeSignature, event.newTimeSignature);
    shouldSave = true;
  } else if (ScoreEvent.isCopy(event)) {
    viewChanged = false;
    if (rawSelectedNotes.length > 0) {
      state.clipboard = [];
      const { bar: initBar } = currentBar(rawSelectedNotes[0]);
      let currentBarId = initBar.id;
      for (const note of rawSelectedNotes) {
        const { bar } = currentBar(note.id)
        if (currentBarId !== bar.id) {
          state.clipboard.push('bar-break');
          currentBarId = bar.id;
        }
        state.clipboard.push(deepcopy(note));
      }
    }
  } else if (ScoreEvent.isPaste(event)) {
    if (! state.selection || ! state.clipboard) {
      return;
    }
    const toPaste = state.clipboard.map(n => n === 'bar-break' ? n : Note.copyNote(n));
    const id = state.selection.end;
    const { bar } = currentBar(id);
    const indexInBar = bar.notes.findIndex(n => n.id === id);
    const indexToPlace = indexInBar === -1 ? bar.notes.length : indexInBar + 1;
    state.score = pasteNotes(toPaste, bar, indexToPlace, state.score);
    shouldSave = true;
  } else if (ScoreEvent.isToggleLandscape(event)) {
    const tmp = state.score.width;
    state.score.width = state.score.height;
    state.score.height = tmp;
    state.zoomLevel *= state.score.height / state.score.width;
    state.score.textBoxes = state.score.textBoxes.map(text => ({
      ...text,
      x: (text.x === 'centre') ? 'centre' : text.x / state.score.height * state.score.width,
      y: text.y / state.score.width * state.score.height
    }));
    shouldSave = true;
  } else {
    // never
    return event;
  }

  if (shouldSave) {
    if (state.score.textBoxes[0]) {
      state.score.name = state.score.textBoxes[0].text;
    }
    const asJSON = JSON.stringify(state.score);
    if (state.history[state.history.length - 1] !== asJSON) {
      state.history.push(asJSON);
      save(state.score);
    }
  }
  if (viewChanged) {
    updateView();
  }
}


function indexOfId(id: ID, noteModels: Item[]): number {
  // Finds the index of the item with the specified ID in noteModels

  for (let i=0; i<noteModels.length; i++) {
    if (noteModels[i].id === id) {
      return i;
    }
  }
  return -1;
}
function currentBar(note: NoteModel | ID | TripletModel): { stave: StaveModel, bar: BarModel } {
  // Finds the parent bar and stave of the note passed

  const staves = Score.staves(state.score);
  if (typeof note === 'number') {
    for (const stave of staves) {
      const bars = Stave.bars(stave);
      for (const bar of bars) {
        if (bar.id === note) {
          return { stave, bar };
        }
        for (const noteModel of bar.notes) {
          if (noteModel.id === note) {
            return { stave, bar };
          }
        }
      }
    }
  } else {
    for (const stave of staves) {
      const bars = Stave.bars(stave);
      for (const bar of bars) {
        if (bar.notes.includes(note)) {
          return { stave, bar };
        }
      }
    }
  }

  const lastStaveBars = Stave.bars(staves[staves.length - 1]);
  return { stave: staves[staves.length - 1], bar: lastStaveBars[lastStaveBars.length - 1] }
}

function currentNoteModels(): (NoteModel | TripletModel)[] {
  // Flattens all the notes in the score into an array

  const bars = Score.bars(state.score);
  return flatten(bars.map(b => b.notes));
}

function selectionToNotes(noteModels: (NoteModel | TripletModel)[]): BaseNote[] {
  // Finds all the notes (including notes within triplets) that are selected within noteModels
  // This can't just flatten rawSelectionToNotes because it takes into account that only part of a triplet may be selected,
  // whereas rawSelectionToNotes doesn't

  if (state.selection === null) return [];
  const notes = Note.flattenTriplets(noteModels);
  let startInd = indexOfId(state.selection.start, notes);
  let endInd = indexOfId(state.selection.end, notes);
  if (startInd !== -1 && endInd !== -1) {
    return notes.slice(startInd, endInd + 1);
  } else {
    const bars = Score.bars(state.score);
    if (startInd === -1) {
      const barIdx = indexOfId(state.selection.start, bars);
      if (barIdx !== -1) {
        const firstNote = bars[barIdx].notes[0];
        if (firstNote) startInd = indexOfId(firstNote.id, notes)
      }
    }
    if (endInd === -1) {
      const barIdx = indexOfId(state.selection.end, bars);
      if (barIdx !== -1) {
        const lastNote = bars[barIdx].notes[bars[barIdx].notes.length - 1];
        if (lastNote) endInd = indexOfId(lastNote.id, notes)
      }
    }

    if (startInd !== -1 && endInd !== -1) {
      return notes.slice(startInd, endInd + 1);
    } else {
      return [];
    }
  }
}

function rawSelectionToNotes(noteModels: (NoteModel | TripletModel)[]): (NoteModel | TripletModel)[] {
  // Finds all the notes and triplets that are selected within noteModels

  if (state.selection === null) return [];

  let startInd = indexOfId(state.selection.start, noteModels);
  let endInd = indexOfId(state.selection.end, noteModels);
  if (startInd !== -1 && endInd !== -1) {
    return noteModels.slice(startInd, endInd + 1);
  } else {
    const bars = Score.bars(state.score);
    if (startInd === -1) {
      const barIdx = indexOfId(state.selection.start, bars);
      if (barIdx !== -1) {
        const firstNote = bars[barIdx].notes[0];
        if (firstNote) startInd = indexOfId(firstNote.id, noteModels)
      } else {
        for (const note of noteModels) {
          if (Note.isTriplet(note) && [note.first.id,note.second.id,note.third.id].includes(state.selection.start)) {
            startInd = indexOfId(note.id, noteModels);
          }
        }
      }
    }
    if (endInd === -1) {
      const barIdx = indexOfId(state.selection.end, bars);
      if (barIdx !== -1) {
        const lastNote = bars[barIdx].notes[bars[barIdx].notes.length - 1];
        if (lastNote) endInd = indexOfId(lastNote.id, noteModels)
      } else {
        for (const note of noteModels) {
          if (Note.isTriplet(note) && [note.first.id,note.second.id,note.third.id].includes(state.selection.end)) {
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

function setTimeSignatureFrom(timeSignature: TimeSignatureModel, newTimeSignature: TimeSignatureModel) {
  // Replaces timeSignature with newTimeSignature, and flows forward

  // TODO make this immutable
  const bars = Score.bars(state.score);
  let atTimeSignature = false;
  for (const bar of bars) {
    if (bar.timeSignature === timeSignature) {
      bar.timeSignature = newTimeSignature;
      atTimeSignature = true;
      continue;
    }
    if (atTimeSignature) {
      if (TimeSignature.equal(bar.timeSignature, timeSignature)) {
        bar.timeSignature = TimeSignature.copy(newTimeSignature);
      } else {
        break;
      }
    }
  }
}

const updateView = () => {
  // Redraws the view

  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;

  const scoreProps = {
    zoomLevel: state.zoomLevel,
    selection: state.selection,
    noteState: { dragged: state.draggedNote, inputtingNotes: state.demoNote !== null || state.inputGracenote !== null },
    gracenoteState: state.gracenoteState,
    textBoxState: state.textBoxState,
    demoNote: state.demoNote,
    dispatch
  }
  const uiProps = {
    zoomLevel: state.zoomLevel,
    inputLength: (state.demoNote && state.demoNote.type === 'note') ? state.demoNote.length : null,
    docs: state.showDocumentation ? Documentation.get(state.currentDocumentation || '') || 'Hover over different parts of the user interface to view the help documentation here.' : null,
    currentMenu: state.currentMenu,
    playbackBpm: state.playbackState.bpm,
    width: state.interfaceWidth,
    gracenoteInput: state.inputGracenote
  }
  const newView = h('div', [renderScore(state.score, scoreProps)]);
  const newUIView = renderUI(dispatch, uiProps);
  if (state.view) patch(state.view, newView);
  if (state.uiView) patch(state.uiView, newUIView);
  state.view = newView;
  state.uiView = newUIView;
}

function mouseMove(event: MouseEvent) {
  // The callback that occurs on mouse move
  // - drags text (if necessary)
  // - moves demo note (if necessary)
  if (state.draggedText !== null || state.demoNote !== null || state.draggedSecondTiming !== null) {
    const svg = document.getElementById('score-svg');
    if (svg == null) {
      return;
    } else if (svg instanceof SVGSVGElement) {
      const CTM = svg.getScreenCTM();
      if (CTM == null) return;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      const svgPt = pt.matrixTransform(CTM.inverse());

      // these should be mutually exclusive so else/if works fine
      if (state.draggedText !== null) {
        dispatch({ name: 'text dragged', x: svgPt.x, y: svgPt.y });
      } else if (state.draggedSecondTiming) {
        dispatch({ name: 'drag second timing', closest: closestItem(svgPt.x, svgPt.y, state.draggedSecondTiming.dragged !== 'end') });
        updateView();
      } else if (state.demoNote) {
        const newStaveIndex = coordinateToStaveIndex(svgPt.y);
        dispatch({ name: 'update demo note', x: svgPt.x, staveIndex: newStaveIndex });
      }
    }
  }
}

export default function startController(score: ScoreModel, saveDB: (score: ScoreModel) => void): void {
  // Initial render, hooks event listeners

  save = saveDB;
  state.score = score;
  state.history = [JSON.parse(JSON.stringify(score))];
  state.zoomLevel = 100 * .9 * (Math.max(window.innerWidth, 800) - 300) / score.width;
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch({ name: 'mouse up' }));
  // initially set the notes to be the right groupings
  state.view = hFrom('score');
  state.uiView = hFrom('ui');
  updateView();
}
