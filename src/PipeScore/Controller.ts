/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import patch from './render/vdom';
import { h, hFrom, V } from './render/h';
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

import Score from './Score/functions';
import Stave from './Stave/functions';
import Note from './Note/functions';
import Gracenote from './Gracenote/functions';
import TextBox from './TextBox/functions';
import SecondTiming from './SecondTiming/functions';
import DemoNote from './DemoNote/functions';
import TimeSignature from './TimeSignature/functions';

import renderScore, { coordinateToStaveIndex } from './Score/view';
import renderUI from './UI/view';

import { scoreWidth } from './global/constants';
import { deleteXY, closestItem, itemBefore } from './global/xy';
import { ID, Item } from './global/types';

import { flatten, deepcopy, nmap } from './global/utils';

import { GracenoteState } from './Gracenote/view';
import { TextBoxState } from './TextBox/view';


// Apart from state.score, all of these can be modified
// state.score should not be modified, but copied, so that it can be diffed quickly
interface State {
  draggedNote: BaseNote | null,
  demoNote: DemoNoteModel | null,
  gracenoteState: GracenoteState,
  zoomLevel: number,
  interfaceWidth: number,
  resizingInterface: boolean,
  textBoxState: TextBoxState,
  clipboard: (NoteModel | TripletModel)[] | null,
  selection: ScoreSelectionModel | null,
  draggedText: TextBoxModel | null,
  inputGracenote: GracenoteModel | null,
  score: ScoreModel,
  history: ScoreModel[],
  future: ScoreModel[],
  draggedSecondTiming: DraggedSecondTiming | null,
  view: V | null,
  uiView: V | null
}
const state: State = {
  draggedNote: null,
  gracenoteState: { dragged: null },
  zoomLevel: 100 * (0.75 * Math.max(window.innerWidth, 800)) / scoreWidth,
  textBoxState: { selectedText: null },
  inputGracenote: null,
  interfaceWidth: 300,
  resizingInterface: false,
  demoNote: null,
  clipboard: null,
  selection: null,
  draggedText: null,
  draggedSecondTiming: null,
  score: Score.init(),
  history: [Score.init()],
  future: [],
  view: null,
  uiView: null
}


function removeState(state: State) {
  // Removes parts of the state that could be dirty after undo / redo

  state.draggedNote = null;
  state.gracenoteState.dragged = null;
  state.textBoxState.selectedText = null;
  state.selection = null;
  state.draggedText = null;
  state.draggedSecondTiming = null;
  state.resizingInterface = false;
}

function noteMap(f: <A extends NoteModel | BaseNote>(note: A, replace: (newNote: A) => void
                                                    ) => boolean, score: ScoreModel): ScoreModel {
  // Maps over every NoteModel and BaseNote in the score, calling f(note) with each one

  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      for (let k=0; k < bar.notes.length; k++) {
        const n = bar.notes[k];

        if (Note.isNoteModel(n)) {
          const done = f(n, (newNote: NoteModel) => {
            bar.notes[k] = { ...newNote };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            if (Note.isNoteModel(newNote) && Note.isNoteModel(n) && (newNote.tied !== n.tied || newNote.length !== n.length)) {
              // todo do this in single pass (i.e. in this loop);
              makeCorrectTie(newNote, score);
            }
          });
          if (done) return score;
        } else if (Note.isTriplet(n)) {
          let done = false;
          done = f(n.first, (newNote: BaseNote) => {
            n.first = { ...newNote };
            bar.notes[k] = { ...n };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
          });
          if (done) return score;
          done = f(n.second, (newNote: BaseNote) => {
            n.second = { ...newNote };
            bar.notes[k] = { ...n };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
          });
          if (done) return score;
          done = f(n.third, (newNote: BaseNote) => {
            n.third = { ...newNote };
            bar.notes[k] = { ...n };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
          });
          if (done) return score;
        }
      }
    }
  }
  return score;
}

function changeNoteFrom(id: ID, note: NoteModel, score: ScoreModel): ScoreModel {
  // Replaces note in score

  return noteMap(<A extends NoteModel | BaseNote>(n: A, replace: (newNote: A) => void) => {
    if (Note.isNoteModel(n) && n.id === id) {
      replace(note as A);
      return true;
    } else {
      return false;
    }
  }, score);
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
  }, score);
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
  }, score);
}

function changeGracenoteFrom(oldGracenote: GracenoteModel, newGracenote: GracenoteModel, score: ScoreModel): ScoreModel {
  // Replaces oldGracenote with newGracenote

  return noteMap((n,replace) => {
    if (Note.isNoteModel(n) && n.gracenote === oldGracenote) {
      replace({ ...n, gracenote: newGracenote });
      return true;
    }

    return false;
  }, score);
}

  function makeCorrectTie(noteModel: NoteModel, score = state.score) {
  // Corrects the pitches of any notes tied to noteModel

  const bars = Score.bars(score);
  const noteModels = flatten(bars.map(b => b.notes));
  for (let i=0; i < noteModels.length; i++) {
    if (noteModels[i].id === noteModel.id) {
      let b = i;
      let previousNote = noteModels[b];
      while ((b > 0) && !Note.isTriplet(previousNote) && previousNote.tied) {
        previousNote = noteModels[b - 1];
        if (Note.isTriplet(previousNote)) {
          break;
        }
        previousNote.pitch = noteModel.pitch;
        b -= 1;
      }
      let a = i;
      let nextNote = noteModels[a + 1];
      while ((a < noteModels.length - 1) && !Note.isTriplet(nextNote) && nextNote.tied) {
        if (Note.isTriplet(nextNote)) {
          break;
        }
        nextNote.pitch = noteModel.pitch;
        a += 1;
        nextNote = noteModels[a + 1];
      }
      break;
    }
  }
}

function deleteNotes(notes: (NoteModel | TripletModel)[], score: ScoreModel): ScoreModel {
  // Deletes the notes from the score, modifies and returns it

  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      for (let k=0; k < bar.notes.length; ) {
        const n = bar.notes[k];
        if (notes.includes(n)) {
          bar.notes.splice(k,1);
          stave.bars[j] = { ...bar };
          score.staves[i] = { ...stave };
        } else {
          k++;
        }
      }
    }
  }
  score = purgeItems(Note.flattenTriplets(notes), score);
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

export function dispatch(event: ScoreEvent.ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
  const noteModels = currentNoteModels();
  const rawSelectedNotes = rawSelectionToNotes(noteModels);
  const selectedNotes = selectionToNotes(noteModels);

  //
  // STATE events
  // Events that modify the state rather than the score
  //
  if (ScoreEvent.isNoteClicked(event)) {
    changed = true;
    if (state.inputGracenote) {
      if (Note.isNoteModel(event.note)) {
        state.score = changeNoteFrom(event.note.id, { ...event.note, gracenote: state.inputGracenote }, state.score);
      } else {
        state.score = changeTripletNoteFrom(event.note.id, { ...event.note, gracenote: state.inputGracenote }, state.score);
      }
    } else {
      state.demoNote = null;
      state.draggedNote = event.note;
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
      changed = true;
    }
  } else if (ScoreEvent.isSingleGracenoteClicked(event)) {
    state.gracenoteState.dragged = event.gracenote;
    changed = true;
  } else if (ScoreEvent.isBackgroundClicked(event)) {
    removeState(state);
    state.demoNote = null;
    state.inputGracenote = null;
    changed = true;
  } else if (ScoreEvent.isMouseUp(event)) {
    if (state.draggedNote || state.gracenoteState.dragged || state.draggedText || state.draggedSecondTiming || state.resizingInterface) {
      state.draggedNote = null;
      state.gracenoteState.dragged = null;
      state.draggedText = null;
      state.draggedSecondTiming = null;
      state.resizingInterface = false;
      changed = true;
    }
  } else if (ScoreEvent.isTextClicked(event)) {
    state.textBoxState.selectedText = event.text
    state.draggedText = event.text;
    changed = true;
  } else if (ScoreEvent.isTextMouseUp(event)) {
    state.draggedText = null;
    changed = true;
  } else if (ScoreEvent.isSetInputLength(event)) {
    state.inputGracenote = null;
    if (!state.demoNote || state.demoNote.type === 'gracenote') {
      state.demoNote = DemoNote.init(event.length)
      changed = true;
    } else if (state.demoNote.type === 'note' && event.length !== state.demoNote.length) {
      state.demoNote.length = event.length;
      changed = true;
    }
  } else if (ScoreEvent.isStopInputtingNotes(event)) {
     if (state.demoNote !== null) {
       state.demoNote = null;
       state.inputGracenote = null;
       changed = true;
     }
  } else if (ScoreEvent.isChangeZoomLevel(event)) {
    if (event.zoomLevel !== state.zoomLevel) {
      state.zoomLevel = event.zoomLevel;
      changed = true;
    }
  }

  //
  // SCORE events
  // Events that modify the score
  //
  else if (ScoreEvent.isUndo(event)) {
    if (state.history.length > 1) {
      state.score = state.history[state.history.length - 2];
      const last = state.history.pop();
      if (last) state.future.push(last);
      removeState(state);
      changed = true;
    }
  } else if (ScoreEvent.isRedo(event)) {
    const last = state.future.pop();
    if (last) {
      state.score = last;
      removeState(state);
      changed = true;
    }
  } else if (ScoreEvent.isMouseMovedOver(event)) {
    if (state.demoNote && state.demoNote.pitch !== event.pitch) {
      state.demoNote.pitch = event.pitch;
      changed = true;
    }

    if (state.draggedNote !== null && event.pitch !== state.draggedNote.pitch) {
      changed = true;
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
      changed = true;
      const newGracenote = { ...state.gracenoteState.dragged, note: event.pitch };
      state.score = changeGracenoteFrom(state.gracenoteState.dragged, newGracenote, state.score);
      state.gracenoteState.dragged = newGracenote;
    }
  } else if (ScoreEvent.isDeleteSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      state.score = deleteNotes(rawSelectedNotes, state.score);
      state.selection = null;
      changed = true;
    }
  } else if (ScoreEvent.isSetGracenoteOnSelected(event)) {
    if (state.selection) {
      const newGracenote = Gracenote.from(event.value);
      state.score = changeNotes(selectedNotes, note => ({ ...note, gracenote: newGracenote }), state.score);
      changed = true;
    } else {
      state.inputGracenote = Gracenote.from(event.value);
      state.demoNote = null;
      if (state.inputGracenote.type === 'single') {
        state.demoNote = DemoNote.initDemoGracenote();
      }
      changed = true;
    }
  } else if (ScoreEvent.isAddNoteAfter(event)) {
    if (state.demoNote && state.demoNote.type === 'note') {
      const { bar, stave } = currentBar(event.noteBefore);
      const newNote = Note.init(event.pitch, state.demoNote.length);
      bar.notes.splice(bar.notes.indexOf(event.noteBefore) + 1, 0, newNote);
      stave.bars[stave.bars.indexOf(bar)] = { ...bar };
      state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };
      changed = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
    } else if (state.demoNote && state.demoNote.type === 'gracenote') {
      const note = noteModels[noteModels.indexOf(event.noteBefore) + 1];
      if (note && Note.isNoteModel(note)) {
        state.score = changeNoteFrom(note.id, { ...note, gracenote: Gracenote.initSingle(event.pitch) }, state.score);
        changed = true;
      }
    }
  } else if (ScoreEvent.isAddNoteToBarStart(event)) {
    if (state.demoNote && state.demoNote.type === 'note') {
      // todo make immutable
      const newNote = Note.init(event.pitch, state.demoNote.length);
      event.bar.notes.unshift(newNote);
      changed = true;
      makeCorrectTie(newNote);
    } else if (state.demoNote && state.demoNote.type === 'gracenote') {
      const note = event.bar.notes[0];
      if (note && Note.isNoteModel(note)) {
        state.score = changeNoteFrom(note.id, { ...note, gracenote: Gracenote.initSingle(event.pitch) }, state.score);
        changed = true;
      }
    }
  } else if (ScoreEvent.isToggleDotted(event)) {
    state.score = changeNotes(selectedNotes,note => Note.isNoteModel(note) ? ({ ...note, length:  Note.toggleDot(note.length) }) : note, state.score);
    if (state.demoNote && state.demoNote.type === 'note') state.demoNote.length = Note.toggleDot(state.demoNote.length);
    changed = true;
  } else if (ScoreEvent.isAddTriplet(event)) {
    if (selectedNotes.length >= 3) {
      const first = selectedNotes[0];
      const second = selectedNotes[1];
      const third = selectedNotes[2];
      if (Note.isNoteModel(first) && Note.isNoteModel(second) && Note.isNoteModel(third)) {
        const { bar, stave } = currentBar(first);
        bar.notes.splice(bar.notes.indexOf(first), 3, Note.initTriplet(first,second,third));
        stave.bars[stave.bars.indexOf(bar)] = { ...bar };
        state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };
        changed = true;
      }
    }
  } else if (ScoreEvent.isDragSecondTiming(event)) {
    if (state.draggedSecondTiming) {
      if (state.draggedSecondTiming.secondTiming[state.draggedSecondTiming.dragged] !== event.closest) {
        const newSecondTiming = { ...state.draggedSecondTiming.secondTiming, [state.draggedSecondTiming.dragged]: event.closest };
        if (SecondTiming.isValid(newSecondTiming)) {
          state.score.secondTimings.splice(state.score.secondTimings.indexOf(state.draggedSecondTiming.secondTiming), 1, newSecondTiming);
          state.draggedSecondTiming.secondTiming = newSecondTiming;
          changed = true;
        }
      }
    }
  } else if (ScoreEvent.isTextDragged(event)) {
    if (state.draggedText !== null) {
      const newText = TextBox.setCoords(state.draggedText, event.x, event.y);
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.draggedText), 1, newText);
      state.textBoxState.selectedText = newText;
      changed = true
    }
  } else if (ScoreEvent.isCentreText(event)) {
    if (state.textBoxState.selectedText !== null) {
      const newText = TextBox.centre(state.textBoxState.selectedText, scoreWidth);
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.textBoxState.selectedText), 1, newText);
      state.textBoxState.selectedText = newText;
      changed = true;
    }
  } else if (ScoreEvent.isAddText(event)) {
    state.score = { ...state.score, textBoxes: [ ...state.score.textBoxes, TextBox.init() ] };
    changed = true;
  } else if (ScoreEvent.isDeleteText(event)) {
    if (state.textBoxState.selectedText !== null) {
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.textBoxState.selectedText), 1);
      state.textBoxState.selectedText = null;
      state.draggedText = null;
      changed = true;
    }
  } else if (ScoreEvent.isEditText(event)) {
    if (event.newText !== event.text.text) {
      const newTextBox = { ...event.text, text: event.newText };
      state.score.textBoxes[state.score.textBoxes.indexOf(event.text)] = newTextBox;
      state.textBoxState.selectedText = newTextBox;
      changed = true;
    }
  } else if (ScoreEvent.isAddAnacrusis(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);
      Stave.addAnacrusis(stave, bar, event.before);
      changed = true;
    }
  } else if (ScoreEvent.isAddBar(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);
      Stave.addBar(stave, bar, event.before);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteBar(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);
      state.score = purgeItems([bar, ...Note.flattenTriplets(bar.notes)], state.score);
      state.score.staves[state.score.staves.indexOf(stave)] = Stave.deleteBar(stave, bar);
      changed = true;
    }
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
    changed = true;
  } else if (ScoreEvent.isAddStave(event)) {
    if (state.selection) {
      const { stave } = currentBar(state.selection.start);
      Score.addStave(state.score, stave, event.before);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteStave(event)) {
    if (state.selection) {
      // todo delete all selected staves
      const { stave } = currentBar(state.selection.start);
      for (const bar of stave.bars) {
        state.score = purgeItems([bar, ...Note.flattenTriplets(bar.notes)], state.score);
      }
      state.score = Score.deleteStave(state.score, stave);
      changed = true;
    }
  } else if (ScoreEvent.isTieSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      // TODO fix triplets
      state.score = changeNotes(selectedNotes, note => Note.isNoteModel(note) ? ({ ...note, tied: !note.tied }) : note, state.score);
      changed = true;
    }
  } else if (ScoreEvent.isClickSecondTiming(event)) {
    state.draggedSecondTiming = { secondTiming: event.secondTiming, dragged: event.part };
    changed = true;
  } else if (ScoreEvent.isAddSecondTiming(event)) {
    if (selectedNotes.length >= 3) {
      const newSecondTiming = SecondTiming.init(selectedNotes[0].id, selectedNotes[1].id, selectedNotes[2].id);
      state.score.secondTimings.push(newSecondTiming);
      changed = true;
    }
  } else if (ScoreEvent.isEditTimeSignature(event)) {
    setTimeSignatureFrom(event.timeSignature, event.newTimeSignature);
    changed = true;
  } else if (ScoreEvent.isCopy(event)) {
    state.clipboard = deepcopy(rawSelectedNotes);
  } else if (ScoreEvent.isPaste(event)) {
    if (! state.selection || ! state.clipboard) {
      return;
    }
    const toPaste = state.clipboard.map(n => Note.copyNote(n));
    const id = state.selection.end;
    const { bar } = currentBar(id);
    const pasteAfter = bar.notes.find(n => n.id === id);
    if (pasteAfter) bar.notes.splice(bar.notes.indexOf(pasteAfter) + 1, 0, ...toPaste);
    changed = true;
  } else if (ScoreEvent.isStartResizingUserInterface(event)) {
    state.resizingInterface = true;
  } else if (ScoreEvent.isResizeUserInterface(event)) {
    state.interfaceWidth = event.width;
    changed = true;
  } else {
    return event;
  }

  if (changed) {
    if (JSON.stringify(state.history[state.history.length - 1]) !== JSON.stringify(state.score)) {
      state.history.push(JSON.parse(JSON.stringify(state.score)));
    }
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

  return { stave: staves[0], bar: Stave.bars(staves[0])[0] }
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
      atTimeSignature = true;
    }
    if (atTimeSignature) {
      if (TimeSignature.equal(bar.timeSignature, timeSignature)) {
        bar.timeSignature = newTimeSignature;
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
    updateView: () => null,
    noteState: { dragged: state.draggedNote, inputtingNotes: state.demoNote !== null },
    gracenoteState: state.gracenoteState,
    textBoxState: state.textBoxState,
    demoNote: state.demoNote,
    dispatch
  }
  const uiProps = {
    zoomLevel: state.zoomLevel,
    inputLength: (state.demoNote && state.demoNote.type === 'note') ? state.demoNote.length : null,
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

  if (state.resizingInterface) {
    dispatch({ name: 'resize user interface', width: window.innerWidth - event.clientX });

  } else if (state.draggedText !== null || state.demoNote !== null || state.draggedSecondTiming !== null) {
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

export default function startController(): void {
  // Initial render, hooks event listeners

  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch({ name: 'mouse up' }));
  // initially set the notes to be the right groupings
  state.view = hFrom('score');
  state.uiView = hFrom('ui');
  updateView();
}
