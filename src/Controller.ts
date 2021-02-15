/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import patch from './render/vdom';
import { h } from './render/h';
import * as ScoreEvent from './Event';

import { ScoreModel } from './Score/model';
import { StaveModel } from './Stave/model';
import { BarModel } from './Bar/model';
import { NoteModel } from './Note/model';
import { ScoreSelectionModel } from './ScoreSelection/model';
import { SecondTimingModel } from './SecondTiming/model';
import { TimeSignatureModel } from './TimeSignature/model';

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
import {
  inputLength, setInputLength,
  zoomLevel, setZoomLevel,
  draggedNote, setDraggedNote, unDragNote,
  draggedGracenote, setDraggedGracenote,
  currentSvg,
  clipboard, setClipboard,
  selection, setSelection,
  draggedText, setDraggedText,
  selectedText, setSelectedText,
  view, setView,
  uiView, setUIView,
  score,
  deleteXY
} from './global/state';

import { flatten, deepcopy } from './global/utils';

export function dispatch(event: ScoreEvent.ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
  const noteModels = currentNoteModels();
  const selectedNotes = selectionToNotes(selection, noteModels);
  if (ScoreEvent.isMouseMovedOver(event)) {
    if (draggedNote !== null && event.pitch !== draggedNote.pitch) {
      changed = true;
      draggedNote.pitch = event.pitch;
      makeCorrectTie(draggedNote);
    }
    if (draggedGracenote !== null && event.pitch !== draggedGracenote.note) {
      changed = true;
      draggedGracenote.note = event.pitch;
    }
  } else if (ScoreEvent.isNoteClicked(event)) {
    setDraggedNote(event.note);
    changed = true;
    if (! event.event.shiftKey) {
      setSelection({ start: event.note, end: event.note });
    } else {
      if (selection === null) {
        setSelection({ start: event.note, end: event.note });
      } else {
        const ind = noteModels.indexOf(event.note);
        if (ind < noteModels.indexOf(selection.start)) {
          selection.start = event.note;
        } else if (ind > noteModels.indexOf(selection.end)) {
          selection.end = event.note;
        }
      }
    }
  } else if (ScoreEvent.isSingleGracenoteClicked(event)) {
    setDraggedGracenote(event.gracenote);
    changed = true;
  } else if (ScoreEvent.isBackgroundClicked(event)) {
    if (selectedNotes.length > 0) {
      setSelection(null);
      changed = true;
    }
    if (inputLength !== null) {
      setInputLength(null);
      changed = true;
    }
    if (selectedText !== null) {
      setSelectedText(null);
      changed = true;
    }
  } else if (ScoreEvent.isMouseUp(event)) {
    if (draggedNote !== null || draggedGracenote !== null) {
      unDragNote();
      setDraggedGracenote(null)
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
      setSelection(null);
      changed = true;
    }
  } else if (ScoreEvent.isSetGracenoteOnSelected(event)) {
    selectedNotes.forEach(note => note.gracenote = Gracenote.from(event.value));
    changed = true;
  } else if (ScoreEvent.isSetInputLength(event)) {
    if (event.length !== inputLength) {
      setInputLength(event.length);
      changed = true;
    }
  } else if (ScoreEvent.isStopInputtingNotes(event)) {
     if (inputLength !== null) {
       setInputLength(null);
     }
  } else if (ScoreEvent.isAddNoteAfter(event)) {
    if (inputLength !== null) {
      const { bar } = currentBar(event.noteBefore);
      const newNote = Note.init(event.pitch, inputLength);
      bar.notes.splice(bar.notes.indexOf(event.noteBefore) + 1, 0, newNote);
      changed = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
    }
  } else if (ScoreEvent.isAddNoteToBarStart(event)) {
    if (inputLength) {
      const newNote = Note.init(event.pitch, inputLength);
      event.bar.notes.unshift(newNote);
      changed = true;
      makeCorrectTie(newNote);
    }
  } else if (ScoreEvent.isToggleDotted(event)) {
    selectedNotes.forEach(note => note.length = Note.toggleDot(note.length));
    if (inputLength !== null) setInputLength(Note.toggleDot(inputLength));
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
    if (event.zoomLevel !== zoomLevel) {
      setZoomLevel(event.zoomLevel);
      changed = true;
    }
  } else if (ScoreEvent.isTextClicked(event)) {
    setSelectedText(event.text)
    setDraggedText(event.text);
    changed = true;
  } else if (ScoreEvent.isTextMouseUp(event)) {
    setDraggedText(null);
  } else if (ScoreEvent.isTextDragged(event)) {
    if (draggedText !== null) {
      TextBox.setCoords(draggedText, event.x, event.y);
      changed = true
    }
  } else if (ScoreEvent.isCentreText(event)) {
    if (selectedText !== null) {
      TextBox.centre(selectedText, scoreWidth);
      changed = true;
    }
  } else if (ScoreEvent.isAddText(event)) {
    score.textBoxes.push(TextBox.init());
    changed = true;
  } else if (ScoreEvent.isDeleteText(event)) {
    if (selectedText !== null) {
      score.textBoxes.splice(score.textBoxes.indexOf(selectedText), 1);
      changed = true;
    }
  } else if (ScoreEvent.isEditText(event)) {
    const newText = prompt("Enter new text:", event.text.text);
    if (newText && newText !== event.text.text) {
      event.text.text = newText;
      changed = true;
    }
  } else if (ScoreEvent.isAddBar(event)) {
    if (selection) {
      const { bar, stave } = currentBar(selection.start);
      Stave.addBar(stave, bar);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteBar(event)) {
    if (selection) {
      // todo delete all selected bars
      const { bar, stave } = currentBar(selection.start);
      bar.notes.forEach(note => deleteNote(note));
      deleteXY(bar.id);
      Stave.deleteBar(stave, bar);
      changed = true;
    }
  } else if (ScoreEvent.isAddStave(event)) {
    if (selection) {
      const { stave } = currentBar(selection.start);
      Score.addStave(score, stave);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteStave(event)) {
    if (selection) {
      // todo delete all selected staves
      const { stave } = currentBar(selection.start);
      const notes: NoteModel[] = flatten(stave.bars.map(bar => bar.notes));
      notes.forEach(note => deleteNote(note));
      Score.deleteStave(score, stave);
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
      score.secondTimings.push(SecondTiming.init(notes[0].id, notes[1].id, notes[2].id));
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
    updateView(score);
  }
}



function makeCorrectTie(noteModel: NoteModel) {
  // corrects the pitches of any notes tied to noteModel
  const bars = Score.bars(score);
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
  const bars = Score.bars(score);
  const noteModels = flatten(bars.map(b => b.notes));

  notes.sort((a,b) => noteModels.indexOf(a) > noteModels.indexOf(b) ? 1 : -1);
  return notes;
}

function dragText(event: MouseEvent) {
  if (draggedText !== null) {
    const svg = currentSvg.current;
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

function deleteNote(note: NoteModel) {
  const { bar } = currentBar(note);
  bar.notes.splice(bar.notes.indexOf(note), 1);
  deleteXY(note.id);
  const secondTimingsToDelete: SecondTimingModel[] = [];
  score.secondTimings.forEach(t => {
    if (t.start === note.id || t.middle === note.id || t.end === note.id) {
      secondTimingsToDelete.push(t);
    }
  });
  secondTimingsToDelete.forEach(t =>
    score.secondTimings.splice(score.secondTimings.indexOf(t), 1));
  if (selection && (note === selection.start || note === selection.end)) {
    setSelection(null);
  }
}

function currentBar(note: NoteModel): { stave: StaveModel, bar: BarModel } {
  // This is extremely inefficient and should only be used in instances that don't occur regularly
  const staves = Score.staves(score);
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
  const bars = Score.bars(score);
  return flatten(bars.map(b => b.notes));
}


function selectionToNotes(selection: ScoreSelectionModel | null, noteModels: NoteModel[]): NoteModel[] {
  if (selection === null) return [];
  const startInd = noteModels.indexOf(selection.start);
  const endInd = noteModels.indexOf(selection.end);
  if (startInd !== -1 && endInd !== -1) {
    return noteModels.slice(startInd, endInd + 1);
  } else {
    return [];
  }
}

function setTimeSignatureFrom(timeSignature: TimeSignatureModel, newTimeSignature: TimeSignatureModel) {
  const bars = Score.bars(score);
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
    svgRef: currentSvg,
    zoomLevel: zoomLevel,
    selection: selection,
    updateView: () => null,
    dispatch
  }
  const newView = h('div', [renderScore(score, scoreProps)]);
  const newUIView = renderUI(dispatch);
  patch(view, newView);
  setView(newView);
  patch(uiView, newUIView);
  setUIView(newUIView);
}


export default function startController(): void {
  window.addEventListener('mousemove', dragText);
  // initially set the notes to be the right groupings
  updateView(score);
}
