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
import { SecondTimingModel } from './SecondTiming/model';
import { TimeSignatureModel } from './TimeSignature/model';
import { TextBoxModel } from './TextBox/model';
import { DemoNoteModel } from './DemoNote/model';

import Score from './Score/functions';
import Stave from './Stave/functions';
import Note from './Note/functions';
import Gracenote from './Gracenote/functions';
import TimeSignature from './TimeSignature/functions';
import TextBox from './TextBox/functions';
import SecondTiming from './SecondTiming/functions';
import DemoNote from './DemoNote/functions';

import renderScore, { coordinateToStaveIndex } from './Score/view';
import renderUI from './UI/view';

import { scoreWidth } from './global/constants';
import { deleteXY } from './global/state';
import { ID, Item } from './global/types';

import { flatten, deepcopy, nmap } from './global/utils';

import { NoteState } from './Note/view';
import { GracenoteState } from './Gracenote/view';
import { TextBoxState } from './TextBox/view';

// Apart from state.score, all of these can be modified
// state.score should not be modified, but copied, so that it can be diffed quickly
interface State {
  noteState: NoteState,
  demoNote: DemoNoteModel | null,
  gracenoteState: GracenoteState,
  zoomLevel: number,
  textBoxState: TextBoxState,
  clipboard: (NoteModel | TripletModel)[] | null,
  selection: ScoreSelectionModel | null,
  draggedText: TextBoxModel | null,
  inputGracenote: GracenoteModel | null,
  score: ScoreModel,
  history: ScoreModel[],
  future: ScoreModel[],
  view: V | null,
  uiView: V | null
}

function removeState(state: State) {
  // removes parts of the state that could be dirty after undo / redo
  state.noteState.dragged = null;
  state.gracenoteState.dragged = null;
  state.textBoxState.selectedText = null;
  state.selection = null;
  state.draggedText = null;
}

const state: State = {
  noteState: { dragged: null },
  gracenoteState: { dragged: null },
  zoomLevel: 100 * (0.75 * Math.max(window.outerWidth, 800)) / scoreWidth,
  textBoxState: { selectedText: null },
  inputGracenote: null,
  demoNote: null,
  clipboard: null,
  selection: null,
  draggedText: null,
  score: Score.init(),
  history: [Score.init()],
  future: [],
  view: null,
  uiView: null
}

function noteMap(f: <A extends NoteModel | BaseNote>(note: A, replace: (newNote: A) => ScoreModel
                                                    ) => [ScoreModel, boolean], score: ScoreModel): ScoreModel {
  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      for (let k=0; k < bar.notes.length; k++) {
        const n = bar.notes[k];

        if (Note.isNoteModel(n)) {
          const [ns, done] = f(n, (newNote: NoteModel) => {
            bar.notes[k] = { ...newNote };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            return { ...score };
          });
          score = ns;
          if (done) return score;
        } else if (Note.isTriplet(n)) {
          let ns: ScoreModel, done: boolean;
          [ns, done] = f(n.first, (newNote: BaseNote) => {
            n.first = { ...newNote };
            bar.notes[k] = { ...n };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            return { ...score };
          });
          score = ns;
          if (done) return score;
          [ns, done] = f(n.second, (newNote: BaseNote) => {
            n.second = { ...newNote };
            bar.notes[k] = { ...n };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            return { ...score };
          });
          score = ns;
          if (done) return score;
          [ns, done] = f(n.third, (newNote: BaseNote) => {
            n.third = { ...newNote };
            bar.notes[k] = { ...n };
            stave.bars[j] = { ...bar };
            score.staves[i] = { ...stave };
            return { ...score };
          });
          score = ns;
          if (done) return score;
        }
      }
    }
  }
  return score;
}

function changeNoteFrom(id: ID, note: NoteModel, score: ScoreModel): ScoreModel {
  return noteMap(<A extends NoteModel | BaseNote>(n: A,replace: (newNote: A) => ScoreModel) => {
    if (Note.isNoteModel(n) && n.id === id) {
      score = replace(note as A);
      // todo do this in single pass (i.e. in this loop);
      makeCorrectTie(note, score);
      return [{ ...score }, true];
    } else {
      return [ score, false ];
    }
  }, score);
}

function changeTripletNoteFrom(id: ID, newNote: BaseNote, score: ScoreModel): ScoreModel {
  return noteMap(<A extends NoteModel | BaseNote>(n: A,replace: (newNote: A) => ScoreModel) => {
    if (! Note.isNoteModel(n) && n.id === id) {
      score = replace(newNote as A);
      return [ { ...score }, true ];
    } else {
      return [ score, false ];
    }
  }, score);
}

function changeNotes(notes: (NoteModel | BaseNote)[], f: <T extends NoteModel | BaseNote>(note: T) => T, score: ScoreModel): ScoreModel {
  let notesChanged = 0;
  return noteMap((n,replace) => {
    if (notes.includes(n)) {
      const newNote = f(n);
      score = replace(newNote);
      if (Note.isNoteModel(newNote) && Note.isNoteModel(n) && (newNote.tied !== n.tied || newNote.length !== n.length)) {
        makeCorrectTie(newNote, score);
      }

      notesChanged++;

      return [{ ...score }, notesChanged === notes.length];
    } else {
      return [ score, false ];
    }
  }, score);
}

function changeGracenoteFrom(oldGracenote: GracenoteModel, newGracenote: GracenoteModel, score: ScoreModel): ScoreModel {
  return noteMap((n,replace) => {
    if (Note.isNoteModel(n) && n.gracenote === oldGracenote) {
      score = replace({ ...n, gracenote: newGracenote });
      return [{ ...score }, true];
    }

    return [ score, false ];
  }, score);
}

  function makeCorrectTie(noteModel: NoteModel, score = state.score) {
  // corrects the pitches of any notes tied to noteModel
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

function deleteNotes(notesToDelete: (NoteModel | TripletModel)[], score: ScoreModel): ScoreModel {
  let numberDeleted = 0;
  for (let i=0; i < score.staves.length; i++) {
    const stave = score.staves[i];
    for (let j=0; j < stave.bars.length; j++) {
      const bar = stave.bars[j];
      for (let k=0; k < bar.notes.length; ) {
        const note = bar.notes[k];
        if (notesToDelete.includes(note)) {
          bar.notes.splice(k, 1);
          stave.bars[j] = { ...bar };
          score.staves[i] = { ...stave };
          const secondTimingsToDelete: SecondTimingModel[] = [];
          score.secondTimings.forEach(t => {
            if (t.start === note.id || t.middle === note.id || t.end === note.id) {
              secondTimingsToDelete.push(t);
            }
          });
          secondTimingsToDelete.forEach(t =>
            score.secondTimings.splice(score.secondTimings.indexOf(t), 1));
          if (state.selection && (note.id === state.selection.start || note.id === state.selection.end)) {
            state.selection = null;
          }

          numberDeleted++;
          if (numberDeleted === notesToDelete.length) {
            return { ...score };
          }
        } else {
          k++;
        }
      }
    }
  }

  return { ...score };
}

export function dispatch(event: ScoreEvent.ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
  const noteModels = currentNoteModels();
  const rawSelectedNotes = rawSelectionToNotes(state.selection, noteModels);
  const selectedNotes = selectionToNotes(state.selection, noteModels);

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
      state.noteState.dragged = event.note;
      if (! event.event.shiftKey) {
        state.selection = { start: event.note.id, end: event.note.id };
      } else {
        if (state.selection === null) {
          state.selection = { start: event.note.id, end: event.note.id };
        } else {
          if (Note.isNoteModel(event.note)) {
            const ind = noteModels.indexOf(event.note);
            if (ind < indexOfId(state.selection.start, noteModels)) {
              state.selection.start = event.note.id;
            } else if (ind > indexOfId(state.selection.end, noteModels)) {
              state.selection.end = event.note.id;
            }
          } else {
            // If it's a tripleted note, you can only select it on its own
            state.selection = { start: event.note.id, end: event.note.id };
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
    if (state.selection) {
      state.selection = null
      changed = true;
    }
    if (state.demoNote !== null) {
      state.demoNote = null;
      changed = true;
    }
    if (state.textBoxState.selectedText !== null) {
      state.textBoxState.selectedText = null;
      changed = true;
    }
    if (state.inputGracenote !== null) {
      state.inputGracenote = null;
      changed = true;
    }
  } else if (ScoreEvent.isMouseUp(event)) {
    if (state.noteState.dragged !== null || state.gracenoteState.dragged !== null) {
      state.noteState.dragged = null;
      state.gracenoteState.dragged = null;
      changed = true;
    }
  } else if (ScoreEvent.isTextClicked(event)) {
    state.textBoxState.selectedText = event.text
    state.draggedText = event.text;
    changed = true;
  } else if (ScoreEvent.isTextMouseUp(event)) {
    state.draggedText = null;
  } else if (ScoreEvent.isSetInputLength(event)) {
    state.inputGracenote = null;
    if (!state.demoNote) {
      state.demoNote = DemoNote.init(event.length)
    } else if (event.length !== state.demoNote.length) {
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

    if (state.noteState.dragged !== null && event.pitch !== state.noteState.dragged.pitch) {
      changed = true;
      if (Note.isNoteModel(state.noteState.dragged)) {
        const newNote = { ...state.noteState.dragged, pitch: event.pitch };
        state.score = changeNoteFrom(state.noteState.dragged.id, newNote, state.score);
        state.noteState.dragged = newNote;
      } else {
        // It must be a triplet
        const newNote = { ...state.noteState.dragged, pitch: event.pitch };
        state.score = changeTripletNoteFrom(state.noteState.dragged.id, newNote, state.score);
        state.noteState.dragged = newNote;
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
      changed = true;
    }
  } else if (ScoreEvent.isAddNoteAfter(event)) {
    if (state.demoNote !== null) {
      const { bar, stave } = currentBar(event.noteBefore);
      const newNote = Note.init(event.pitch, state.demoNote.length);
      bar.notes.splice(bar.notes.indexOf(event.noteBefore) + 1, 0, newNote);
      stave.bars[stave.bars.indexOf(bar)] = { ...bar };
      state.score.staves[state.score.staves.indexOf(stave)] = { ...stave };
      changed = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
    }
  } else if (ScoreEvent.isAddNoteToBarStart(event)) {
    if (state.demoNote) {
      const newNote = Note.init(event.pitch, state.demoNote.length);
      event.bar.notes.unshift(newNote);
      changed = true;
      makeCorrectTie(newNote);
    }
  } else if (ScoreEvent.isToggleDotted(event)) {
    state.score = changeNotes(selectedNotes,note => Note.isNoteModel(note) ? ({ ...note, length:  Note.toggleDot(note.length) }) : note, state.score);
    if (state.demoNote !== null) state.demoNote.length = Note.toggleDot(state.demoNote.length);
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
    const newText = prompt("Enter new text:", event.text.text);
    if (newText && newText !== event.text.text) {
      const newTextBox = { ...event.text, text: newText };
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(event.text), 1, newTextBox);
      state.textBoxState.selectedText = newTextBox;
      changed = true;
    }
  } else if (ScoreEvent.isAddBar(event)) {
    if (state.selection) {
      const { bar, stave } = currentBar(state.selection.start);
      Stave.addBar(stave, bar);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteBar(event)) {
    if (state.selection) {
      // todo delete all selected bars
      const { bar, stave } = currentBar(state.selection.start);
      state.score = deleteNotes(bar.notes, state.score);
      deleteXY(bar.id);
      Stave.deleteBar(stave, bar);
      changed = true;
    }
  } else if (ScoreEvent.isAddStave(event)) {
    if (state.selection) {
      const { stave } = currentBar(state.selection.start);
      Score.addStave(state.score, stave);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteStave(event)) {
    if (state.selection) {
      // todo delete all selected staves
      const { stave } = currentBar(state.selection.start);
      const notes: (NoteModel | TripletModel)[] = flatten(stave.bars.map(bar => bar.notes));
      state.score = deleteNotes(notes, state.score);
      Score.deleteStave(state.score, stave);
      changed = true;
    }
  } else if (ScoreEvent.isTieSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      // TODO fix triplets
      state.score = changeNotes(selectedNotes, note => Note.isNoteModel(note) ? ({ ...note, tied: !note.tied }) : note, state.score);
      changed = true;
    }
  } else if (ScoreEvent.isAddSecondTiming(event)) {
    if (selectedNotes.length >= 3) {
      state.score.secondTimings.push(SecondTiming.init(selectedNotes[0].id, selectedNotes[1].id, selectedNotes[2].id));
      changed = true;
    }
  } else if (ScoreEvent.isEditTimeSignatureNumerator(event)) {
    const newNumerator = prompt('Enter new top number:', event.timeSignature[0].toString());
    if (! newNumerator) return;
    const asNumber = parseInt(newNumerator, 10);

    if (asNumber === event.timeSignature[0]) return;

    if (!isNaN(asNumber) && asNumber > 0) {
      setTimeSignatureFrom(event.timeSignature, [asNumber, event.timeSignature[1]]);
      changed = true;
    } else {
      alert('Invalid time signature');
    }
  } else if (ScoreEvent.isEditTimeSignatureDenominator(event)) {
    const newDenominator = prompt('Enter new bottom number:', event.timeSignature[1].toString());
    if (! newDenominator) return;
    const denom = TimeSignature.parseDenominator(newDenominator);

    if (denom === event.timeSignature[1]) return;

    if (denom === null) {
      alert('Invalid time signature - PipeScore only supports 4 and 8 time signatures right now, sorry.');
    } else {
      setTimeSignatureFrom(event.timeSignature, [event.timeSignature[0], denom]);
      changed = true;
    }
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
  } else {
    return event;
  }

  if (changed) {
    if (JSON.stringify(state.history[state.history.length - 1]) !== JSON.stringify(state.score)) {
      state.history.push(JSON.parse(JSON.stringify(state.score)));
    }
    updateView(state.score);
  }
}


function indexOfId(id: ID, noteModels: Item[]): number {
  for (let i=0; i<noteModels.length; i++) {
    if (noteModels[i].id === id) {
      return i;
    } 
  }
  return -1;
}
function mouseMove(event: MouseEvent) {
  if (state.draggedText !== null || state.demoNote !== null) {
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
      } else if (state.demoNote) {
        const newStaveIndex = coordinateToStaveIndex(svgPt.y);
        dispatch({ name: 'update demo note', x: svgPt.x, staveIndex: newStaveIndex });
      }
    }
  }
}

function currentBar(note: NoteModel | ID | TripletModel): { stave: StaveModel, bar: BarModel } {
  // This is extremely inefficient and should only be used in instances that don't occur regularly
  const staves = Score.staves(state.score);
  if (typeof note === 'number') {
    for (const stave of staves) {
      const bars = Stave.bars(stave);
      for (const bar of bars) {
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
  const bars = Score.bars(state.score);
  return flatten(bars.map(b => b.notes));
}

function selectionToNotes(selection: ScoreSelectionModel | null, noteModels: (NoteModel | TripletModel)[]): (NoteModel | BaseNote)[] {
  if (state.selection === null) return [];
  const notes = Note.flattenTriplets(noteModels);
  const startInd = indexOfId(state.selection.start, notes);
  const endInd = indexOfId(state.selection.end, notes);
  if (startInd !== -1 && endInd !== -1) {
    return notes.slice(startInd, endInd + 1);
  } else {
    return [];
  }
}

function rawSelectionToNotes(selection: ScoreSelectionModel | null, noteModels: (NoteModel | TripletModel)[]): (NoteModel | TripletModel)[] {
  if (state.selection === null) return [];
  const startInd = indexOfId(state.selection.start, noteModels);
  const endInd = indexOfId(state.selection.end, noteModels);
  if (startInd !== -1 && endInd !== -1) {
    return noteModels.slice(startInd, endInd + 1);
  } else {
    return [];
  }
}

function setTimeSignatureFrom(timeSignature: TimeSignatureModel, newTimeSignature: TimeSignatureModel) {
  const bars = Score.bars(state.score);
  let atTimeSignature = false;
  for (const bar of bars) {
    if (bar.timeSignature === timeSignature) {
      atTimeSignature = true;
    }
    if (atTimeSignature) {
      bar.timeSignature = newTimeSignature;
    }
  }
}

const updateView = (score: ScoreModel) => {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;

  const scoreProps = {
    zoomLevel: state.zoomLevel,
    selection: state.selection,
    updateView: () => null,
    noteState: state.noteState,
    gracenoteState: state.gracenoteState,
    textBoxState: state.textBoxState,
    demoNote: state.demoNote,
    dispatch
  }
  const uiProps = {
    zoomLevel: state.zoomLevel,
    inputLength: nmap(state.demoNote, n => n.length),
    gracenoteInput: state.inputGracenote
  }
  const newView = h('div', [renderScore(score, scoreProps)]);
  const newUIView = renderUI(dispatch, uiProps);
  if (state.view) patch(state.view, newView);
  if (state.uiView) patch(state.uiView, newUIView);
  state.view = newView;
  state.uiView = newUIView;
}


export default function startController(): void {
  window.addEventListener('mousemove', mouseMove);
  // initially set the notes to be the right groupings
  state.view = hFrom('score');
  state.uiView = hFrom('ui');
  updateView(state.score);
}
