/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { render } from 'uhtml';
import { flatten, deepcopy, scoreWidth } from './all';
import { NoteModel } from './Note/model';
import Note from './Note/functions';
import { TimeSignatureModel } from './TimeSignature/model';
import { timeSignatureToBeatDivision, parseDenominator } from './TimeSignature/functions';
import TextBox from './TextBox/functions';
import { ScoreModel } from './Score/model';
import Score from './Score/functions';
import { StaveModel } from './Stave/model';
import { addBarToStave, deleteBarFromStave } from './Stave/functions';
import { BarModel } from './Bar/model';
import { ScoreSelectionModel } from './ScoreSelection/model';
import { SecondTimingModel } from './SecondTiming/model';
import SecondTiming from './SecondTiming/functions';
import Stave from './Stave/functions';

import renderScore from './Score/view';
import renderUI from './UI/view';
import * as ScoreEvent from './Event';

import {
  inputLength, setInputLength,
  zoomLevel, setZoomLevel,
  draggedNote, setDraggedNote, unDragNote,
  currentSvg,
  clipboard, setClipboard,
  selection, setSelection,
  draggedText, setDraggedText,
  selectedText, setSelectedText,
  score,
  deleteXY
} from './global';

export function dispatch(event: ScoreEvent.ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
  let recalculateNoteGroupings = false;
  const noteModels = currentNoteModels();
  const selectedNotes = selectionToNotes(selection, noteModels);
  if (ScoreEvent.isMouseMovedOver(event)) {
    if (draggedNote !== null) {
    changed = true;
      draggedNote.pitch = event.pitch;
      makeCorrectTie(draggedNote);
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
    if (draggedNote !== null) {
      unDragNote();
      changed = true;
    }
  } else if (ScoreEvent.isDeleteSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      const groupedNotes = Score.groupNotes(score);
      // quadratic!
      groupedNotes.forEach(g => {
        // Need to slice it so that deleting inside the loop works
        const newNotes = g.notes.slice();
        g.notes.forEach(note => {
          if (selectedNotes.includes(note)) {
            deleteNote(note, newNotes);
          }
        });
        g.notes = newNotes;
      });
      setSelection(null);
      changed = true;
      recalculateNoteGroupings = true;
    }
  } else if (ScoreEvent.isSetGracenoteOnSelected(event)) {
    selectedNotes.forEach(note => note.gracenote = { type: 'reactive', name: event.value });
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
  } else if (ScoreEvent.isNoteAdded(event)) {
    if (inputLength !== null) {
      const newNote = Note.initNote(event.pitch, inputLength);
      event.groupNote.notes.splice(event.index, 0, newNote);
      changed = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
      recalculateNoteGroupings = true
    }
  } else if (ScoreEvent.isToggleDotted(event)) {
    selectedNotes.forEach(note => note.length = Note.toggleDot(note.length));
    if (inputLength !== null) setInputLength(Note.toggleDot(inputLength));
    changed = true;
    recalculateNoteGroupings = true;
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
      addBarToStave(stave, bar);
      changed = true;
    }
  } else if (ScoreEvent.isDeleteBar(event)) {
    if (selection) {
      // todo delete all selected bars
      const { bar, stave } = currentBar(selection.start);
      const newNotes = flatten(bar.notes.slice().map(n => n.notes));
      bar.notes.forEach(groupNote => groupNote.notes.forEach(note => deleteNote(note, newNotes)));
      deleteXY(bar.id);
      deleteBarFromStave(stave, bar);
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
      const notes: NoteModel[] = flatten(stave.bars.map(bar => flatten(bar.notes.map(n => n.notes))));
      const newNotes = notes.slice();
      notes.forEach(note => deleteNote(note, newNotes));
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
      recalculateNoteGroupings = true;
      changed = true;
    } else {
      alert('Invalid time signature');
    }
  } else if (ScoreEvent.isEditTimeSignatureDenominator(event)) {
    const newDenominator = prompt('Enter new bottom number:', event.timeSignature[1].toString());
    if (! newDenominator) return;
    const denom = parseDenominator(newDenominator);

    if (denom === event.timeSignature[1]) return;

    if (denom === null) {
      alert('Invalid time signature - PipeScore only supports 4 and 8 time signatures right now, sorry.');
    } else {
      setTimeSignatureFrom(event.timeSignature, [event.timeSignature[0], denom]);
      recalculateNoteGroupings = true;
      changed = true;
    }
  } else if (ScoreEvent.isCopy(event)) {
    setClipboard(JSON.parse(JSON.stringify(selectedNotes)));
  } else if (ScoreEvent.isPaste(event)) {
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
    bar.notes.splice(bar.notes.length, 0, { notes: toPaste });
    changed = true;
    recalculateNoteGroupings = true;
  } else {
    return event;
  }

  if (recalculateNoteGroupings) {
    makeCorrectGroupings();
  }

  if (changed) {
    updateView(score);
  }
}



function makeCorrectTie(noteModel: NoteModel) {
  // corrects the pitches of any notes tied to noteModel
  const bars = Score.bars(score);
  const noteModels = flatten(bars.map(b => Note.unGroupNotes(b.notes)));
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
  const noteModels = flatten(bars.map(b => Note.unGroupNotes(b.notes)));

  notes.sort((a,b) => noteModels.indexOf(a) > noteModels.indexOf(b) ? 1 : -1);
  return notes;
}

function makeCorrectGroupings() {
  const bars = Score.bars(score);
  const noteModels = bars.map(b => Note.unGroupNotes(b.notes));
  for (let i=0; i < bars.length; i++) {
    // todo actually pass the correct time signature
    bars[i].notes = Note.groupNotes(noteModels[i], timeSignatureToBeatDivision(bars[i].timeSignature));
  }
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

function deleteNote(note: NoteModel, newNotes: NoteModel[]) {
  if (newNotes.indexOf(note) === -1) {
    console.error("tried to delete a note that wasn't there");
    return;
  }
  newNotes.splice(newNotes.indexOf(note), 1);
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
  const staves = Score.staves(score);
  for (const stave of staves) {
    const bars = Stave.bars(stave);
    for (const bar of bars) {
      const noteModels = Note.unGroupNotes(bar.notes);
      if (noteModels.includes(note)) {
        return { stave, bar };
      }
    }
  }

  return { stave: staves[0], bar: Stave.bars(staves[0])[0] }
}

function currentNoteModels(): NoteModel[] {
  const bars = Score.bars(score);
  return flatten(bars.map(b => Note.unGroupNotes(b.notes)));
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
  render(scoreRoot, renderScore(score, scoreProps));
  render(uiRoot, renderUI(dispatch));
}


export default function startController(): void {
  window.addEventListener('mousemove', dragText);
  // initially set the notes to be the right groupings
  makeCorrectGroupings();
  updateView(score);
}
