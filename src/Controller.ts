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
import { NoteModel } from './Note/model';
import { ScoreSelectionModel } from './ScoreSelection/model';
import { SecondTimingModel } from './SecondTiming/model';
import { TimeSignatureModel } from './TimeSignature/model';
import { TextBoxModel } from './TextBox/model';

import Score from './Score/functions';
import Stave from './Stave/functions';
import Note from './Note/functions';
import Gracenote from './Gracenote/functions';
import TimeSignature from './TimeSignature/functions';
import TextBox from './TextBox/functions';
import SecondTiming from './SecondTiming/functions';

import renderScore from './Score/view';
import renderUI from './UI/view';

import { scoreWidth } from './global/constants';
import { deleteXY } from './global/state';
import { SvgRef } from './global/svg';

import { flatten, deepcopy } from './global/utils';

import { NoteState } from './Note/view';
import { GracenoteState } from './Gracenote/view';
import { UIState } from './UI/view';
import { TextBoxState } from './TextBox/view';

interface State {
  noteState: NoteState,
  gracenoteState: GracenoteState,
  uiState: UIState,
  textBoxState: TextBoxState,
  currentSvg: SvgRef,
  clipboard: NoteModel[] | null,
  selection: ScoreSelectionModel | null,
  draggedText: TextBoxModel | null,
  score: ScoreModel,
  view: V | null,
  uiView: V | null
}

const state: State = {
  noteState: { dragged: null },
  gracenoteState: { dragged: null },
  uiState: { zoomLevel: 100 * (0.75 * window.outerWidth) / scoreWidth, inputLength: null },
  textBoxState: { selectedText: null },
  currentSvg: { current: null },
  clipboard: null,
  selection: null,
  draggedText: null,
  score: Score.init(),
  view: null,
  uiView: null
}

export function dispatch(event: ScoreEvent.ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
  const noteModels = currentNoteModels();
  const selectedNotes = selectionToNotes(state.selection, noteModels);
  if (ScoreEvent.isMouseMovedOver(event)) {
    if (state.noteState.dragged !== null && event.pitch !== state.noteState.dragged.pitch) {
      changed = true;
      const newNote = { ...state.noteState.dragged, pitch: event.pitch };
      changeNote(state.noteState.dragged, newNote);
      if (state.selection) {
        if (state.selection.start === state.noteState.dragged) state.selection.start = newNote;
        if (state.selection.end === state.noteState.dragged) state.selection.end = newNote;
      }
      state.noteState.dragged = newNote;
      makeCorrectTie(state.noteState.dragged);
    }
    if (state.gracenoteState.dragged !== null && event.pitch !== state.gracenoteState.dragged.note) {
      changed = true;
      state.gracenoteState.dragged.note = event.pitch;
    }
  } else if (ScoreEvent.isNoteClicked(event)) {
    state.noteState.dragged = event.note;
    changed = true;
    if (! event.event.shiftKey) {
      state.selection = { start: event.note, end: event.note };
    } else {
      if (state.selection === null) {
        state.selection = { start: event.note, end: event.note };
      } else {
        const ind = noteModels.indexOf(event.note);
        if (ind < noteModels.indexOf(state.selection.start)) {
          state.selection.start = event.note;
        } else if (ind > noteModels.indexOf(state.selection.end)) {
          state.selection.end = event.note;
        }
      }
    }
  } else if (ScoreEvent.isSingleGracenoteClicked(event)) {
    state.gracenoteState.dragged = event.gracenote;
    changed = true;
  } else if (ScoreEvent.isBackgroundClicked(event)) {
    if (selectedNotes.length > 0) {
      state.selection = null
      changed = true;
    }
    if (state.uiState.inputLength !== null) {
      state.uiState.inputLength = null;
      changed = true;
    }
    if (state.textBoxState.selectedText !== null) {
      state.textBoxState.selectedText = null;
      changed = true;
    }
  } else if (ScoreEvent.isMouseUp(event)) {
    if (state.noteState.dragged !== null || state.gracenoteState.dragged !== null) {
      state.noteState.dragged = null;
      state.gracenoteState.dragged = null;
      changed = true;
    }
  } else if (ScoreEvent.isDeleteSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      // TODO
      // quadratic!
      noteModels.forEach(note => {
        if (selectedNotes.includes(note)) {
          deleteNote(note);
        }
      });
      state.selection = null;
      changed = true;
    }
  } else if (ScoreEvent.isSetGracenoteOnSelected(event)) {
    selectedNotes.forEach(note => note.gracenote = Gracenote.from(event.value));
    changed = true;
  } else if (ScoreEvent.isSetInputLength(event)) {
    if (event.length !== state.uiState.inputLength) {
      state.uiState.inputLength = event.length;
      changed = true;
    }
  } else if (ScoreEvent.isStopInputtingNotes(event)) {
     if (state.uiState.inputLength !== null) {
       state.uiState.inputLength = null;
       changed = true;
     }
  } else if (ScoreEvent.isAddNoteAfter(event)) {
    if (state.uiState.inputLength !== null) {
      const { bar } = currentBar(event.noteBefore);
      const newNote = Note.init(event.pitch, state.uiState.inputLength);
      bar.notes.splice(bar.notes.indexOf(event.noteBefore) + 1, 0, newNote);
      changed = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
    }
  } else if (ScoreEvent.isAddNoteToBarStart(event)) {
    if (state.uiState.inputLength) {
      const newNote = Note.init(event.pitch, state.uiState.inputLength);
      event.bar.notes.unshift(newNote);
      changed = true;
      makeCorrectTie(newNote);
    }
  } else if (ScoreEvent.isToggleDotted(event)) {
    selectedNotes.forEach(note => note.length = Note.toggleDot(note.length));
    if (state.uiState.inputLength !== null) state.uiState.inputLength = Note.toggleDot(state.uiState.inputLength);
    changed = true;
  } else if (ScoreEvent.isAddTriplet(event)) {
    // TODO
    /*
    if (selectedNotes.length > 0 && inputLength !== null) { 
      const { groupNote, bar } = currentBar(selectedNotes[0]);
      bar.notes.splice(bar.notes.indexOf(groupNote) + 1, 0, Note.initTriplet(inputLength));
      changed = true;
    }
    */
  } else if (ScoreEvent.isChangeZoomLevel(event)) {
    if (event.zoomLevel !== state.uiState.zoomLevel) {
      state.uiState.zoomLevel = event.zoomLevel;
      changed = true;
    }
  } else if (ScoreEvent.isTextClicked(event)) {
    state.textBoxState.selectedText = event.text
    state.draggedText = event.text;
    changed = true;
  } else if (ScoreEvent.isTextMouseUp(event)) {
    state.draggedText = null;
  } else if (ScoreEvent.isTextDragged(event)) {
    if (state.draggedText !== null) {
      TextBox.setCoords(state.draggedText, event.x, event.y);
      changed = true
    }
  } else if (ScoreEvent.isCentreText(event)) {
    if (state.textBoxState.selectedText !== null) {
      TextBox.centre(state.textBoxState.selectedText, scoreWidth);
      changed = true;
    }
  } else if (ScoreEvent.isAddText(event)) {
    state.score.textBoxes.push(TextBox.init());
    changed = true;
  } else if (ScoreEvent.isDeleteText(event)) {
    if (state.textBoxState.selectedText !== null) {
      state.score.textBoxes.splice(state.score.textBoxes.indexOf(state.textBoxState.selectedText), 1);
      changed = true;
    }
  } else if (ScoreEvent.isEditText(event)) {
    const newText = prompt("Enter new text:", event.text.text);
    if (newText && newText !== event.text.text) {
      event.text.text = newText;
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
      bar.notes.forEach(note => deleteNote(note));
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
      const notes: NoteModel[] = flatten(stave.bars.map(bar => bar.notes));
      notes.forEach(note => deleteNote(note));
      Score.deleteStave(state.score, stave);
      changed = true;
    }
  } else if (ScoreEvent.isTieSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      selectedNotes.forEach(note => {
        note.tied = !note.tied
        makeCorrectTie(note);
      });
      changed = true;
    }
  } else if (ScoreEvent.isAddSecondTiming(event)) {
    if (selectedNotes.length >= 3) {
      const notes = sortByPosition(selectedNotes);
      state.score.secondTimings.push(SecondTiming.init(notes[0].id, notes[1].id, notes[2].id));
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
    // TODO
    // setClipboard(JSON.parse(JSON.stringify(selectedNotes)));
  } else if (ScoreEvent.isPaste(event)) {
    // TODO
    /*
    if (! selection || ! clipboard) {
      return;
    }
    const toPaste = clipboard.map(note => {
      const n = Note.initNote(note.pitch, note.length, note.tied);
      n.gracenote = deepcopy(note.gracenote);
      return n;
    });
    const pasteAfter = selection.end;
    const { bar } = currentBar(pasteAfter);
    bar.notes.splice(bar.notes.length, 0, Note.groupNoteFrom(toPaste));
    changed = true;
    */
  } else {
    return event;
  }

  if (changed) {
    updateView(state.score);
  }
}



function makeCorrectTie(noteModel: NoteModel) {
  // corrects the pitches of any notes tied to noteModel
  const bars = Score.bars(state.score);
  const noteModels = flatten(bars.map(b => b.notes));
  for (let i=0; i < noteModels.length; i++) {
    if (noteModels[i].id === noteModel.id) {
      let b = i;
      while ((b > 0) && noteModels[b].tied) {
        noteModels[b - 1].pitch = noteModel.pitch;
        b -= 1;
      }
      let a = i;
      while ((a < noteModels.length - 1) && noteModels[a + 1].tied) {
        noteModels[a + 1].pitch = noteModel.pitch;
        a += 1;
      }
      break;
    }
  }
}

function sortByPosition(notes: NoteModel[]) {
  const bars = Score.bars(state.score);
  const noteModels = flatten(bars.map(b => b.notes));

  notes.sort((a,b) => noteModels.indexOf(a) > noteModels.indexOf(b) ? 1 : -1);
  return notes;
}

function dragText(event: MouseEvent) {
  if (state.draggedText !== null) {
    const svg = state.currentSvg.current;
    if (svg == null) {
      return;
    } else {
      const CTM = svg.getScreenCTM();
      if (CTM == null) return;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      const svgPt = pt.matrixTransform(CTM.inverse());

      dispatch({ name: 'text dragged', x: svgPt.x, y: svgPt.y });
    }
  }
}

function changeNote(oldNote: NoteModel, newNote: NoteModel): void {
  const staves = Score.staves(state.score);
  for (const stave of staves) {
    const bars = Stave.bars(stave);
    for (const bar of bars) {
      const ind = bar.notes.indexOf(oldNote);
      if (ind !== -1) {
        bar.notes.splice(ind, 1, newNote);
      }
    }
  }
}

function deleteNote(note: NoteModel) {
  const { bar } = currentBar(note);
  bar.notes.splice(bar.notes.indexOf(note), 1);
  deleteXY(note.id);
  const secondTimingsToDelete: SecondTimingModel[] = [];
  state.score.secondTimings.forEach(t => {
    if (t.start === note.id || t.middle === note.id || t.end === note.id) {
      secondTimingsToDelete.push(t);
    }
  });
  secondTimingsToDelete.forEach(t =>
    state.score.secondTimings.splice(state.score.secondTimings.indexOf(t), 1));
  if (state.selection && (note === state.selection.start || note === state.selection.end)) {
    state.selection = null;
  }
}

function currentBar(note: NoteModel): { stave: StaveModel, bar: BarModel } {
  // This is extremely inefficient and should only be used in instances that don't occur regularly
  const staves = Score.staves(state.score);
  for (const stave of staves) {
    const bars = Stave.bars(stave);
    for (const bar of bars) {
      if (bar.notes.includes(note)) {
        return { stave, bar };
      }
    }
  }

  return { stave: staves[0], bar: Stave.bars(staves[0])[0] }
}

function currentNoteModels(): NoteModel[] {
  const bars = Score.bars(state.score);
  return flatten(bars.map(b => b.notes));
}


function selectionToNotes(selection: ScoreSelectionModel | null, noteModels: NoteModel[]): NoteModel[] {
  if (state.selection === null) return [];
  const startInd = noteModels.indexOf(state.selection.start);
  const endInd = noteModels.indexOf(state.selection.end);
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
    svgRef: state.currentSvg,
    zoomLevel: state.uiState.zoomLevel,
    selection: state.selection,
    updateView: () => null,
    noteState: state.noteState,
    gracenoteState: state.gracenoteState,
    textBoxState: state.textBoxState,
    dispatch
  }
  const newView = h('div', [renderScore(score, scoreProps)]);
  const newUIView = renderUI(dispatch, state.uiState);
  // todo 
  if (state.view) patch(state.view, newView);
  if (state.uiView) patch(state.uiView, newUIView);
  state.view = newView;
  state.uiView = newUIView;
}


export default function startController(): void {
  window.addEventListener('mousemove', dragText);
  // initially set the notes to be the right groupings
  state.view = hFrom('score');
  state.uiView = hFrom('ui');
  updateView(state.score);
}
