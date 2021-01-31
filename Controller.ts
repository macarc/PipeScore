/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2020 Archie Maclean
*/

/*
import { render } from 'uhtml';
import { Pitch, flatten, ID, deepcopy } from './all';
import { NoteLength, toggleDot } from './Note/NoteLength';
import { NoteModel, GroupNoteModel, unGroupNotes, groupNotes, initNoteModel } from './Note';
import { TimeSignatureModel, timeSignatureToBeatDivision, parseDenominator } from './TimeSignature';
import { TextBoxModel, setCoords } from './TextBox';
import Score, { ScoreModel, addStaveToScore, deleteStaveFromScore, scoreWidth } from './Score';
import { StaveModel, addBarToStave, deleteBarFromStave } from './Stave';
import { BarModel } from './Bar';
import { ScoreSelectionModel } from './ScoreSelection';
import SecondTiming, { SecondTimingModel } from './SecondTiming';
import Stave from './Stave';
import UI from './UI';

// Events
type ScoreEvent
  = MouseMovedOver
  | Copy
  | Paste
  | NoteClicked
  | BackgroundClicked
  | MouseUp
  | DeleteSelectedNotes
  | SetGracenoteOnSelected
  | SetInputLength
  | StopInputtingNotes
  | NoteAdded
  | TieSelectedNotes
  | ToggleDotted
  | ChangeZoomLevel
  | AddSecondTiming
  | EditTimeSignatureNumerator
  | EditTimeSignatureDenominator
  | AddBar
  | AddStave
  | DeleteBar
  | DeleteStave;









interface XY {
  beforeX: number,
  afterX: number,
  y: number
}

export interface State {
  score: ScoreModel,
  draggedNote: NoteModel | null,
  selection: ScoreSelectionModel | null,
  noteInputLength: NoteLength | null,
  zoomLevel: number,
  draggedText: TextBoxModel | null,
  itemCoords: Map<ID, XY>,
  clipboard: NoteModel[] | null,
  currentSvg: SvgRef
}


const currentState: State = {
  score: Score.init(),
  draggedNote: null,
  noteInputLength: null,
  zoomLevel: calculateZoomLevel(),
  draggedText: null,
  itemCoords: new Map(),
  currentSvg: { current: null },
  selection: null,
  clipboard: null
};

export function dispatch(event: ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   /
  let changed = false;
  let recalculateNoteGroupings = false;
  const noteModels = currentNoteModels();
  const selectedNotes = selectionToNotes(currentState.selection, noteModels);
  if (isMouseMovedOver(event)) {
    if (currentState.draggedNote !== null) {
    changed = true;
      currentState.draggedNote.pitch = event.pitch;
      makeCorrectTie(currentState.draggedNote);
    }
  } else if (isNoteClicked(event)) {
    currentState.draggedNote = event.note;
    changed = true;
    if (! event.event.shiftKey) {
      currentState.selection = { start: event.note, end: event.note };
    } else {
      if (currentState.selection === null) {
        currentState.selection = { start: event.note, end: event.note };
      } else {
        const ind = noteModels.indexOf(event.note);
        if (ind < noteModels.indexOf(currentState.selection.start)) {
          currentState.selection.start = event.note;
        } else if (ind > noteModels.indexOf(currentState.selection.end)) {
          currentState.selection.end = event.note;
        }
      }
    }
  } else if (isBackgroundClicked(event)) {
    if (selectedNotes.length > 0) {
      currentState.selection = null;
      changed = true;
    }
    if (currentState.noteInputLength !== null) {
      currentState.noteInputLength = null;
      changed = true;
    }
  } else if (isMouseUp(event)) {
    if (currentState.draggedNote !== null) {
      currentState.draggedNote = null;
      changed = true;
    }
  } else if (isDeleteSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      const groupedNotes = Score.groupNotes(currentState.score);
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
      currentState.selection = null;
      changed = true;
      recalculateNoteGroupings = true;
    }
  } else if (isSetGracenoteOnSelected(event)) {
    selectedNotes.forEach(note => note.gracenote = { type: 'reactive', name: event.value });
    changed = true;
  } else if (isSetInputLength(event)) {
    if (event.length !== currentState.noteInputLength) {
      currentState.noteInputLength = event.length;
      changed = true;
    }
  } else if (isStopInputtingNotes(event)) {
     if (currentState.noteInputLength !== null) {
       currentState.noteInputLength = null;
     }
  } else if (isNoteAdded(event)) {
    if (currentState.noteInputLength !== null) {
      const newNote = initNoteModel(event.pitch, currentState.noteInputLength);
      event.note.notes.splice(event.index, 0, newNote);
      changed = true;
      // todo - should this need to be done?
      makeCorrectTie(newNote);
      recalculateNoteGroupings = true
    }
  } else if (isToggleDotted(event)) {
    selectedNotes.forEach(note => note.length = toggleDot(note.length));
    changed = true;
    recalculateNoteGroupings = true;
  } else if (isChangeZoomLevel(event)) {
    if (event.zoomLevel !== currentState.zoomLevel) {
      currentState.zoomLevel = event.zoomLevel;
      changed = true;
    }
  } else if (isTextClicked(event)) {
    currentState.draggedText = event.text;
  } else if (isTextMouseUp(event)) {
    currentState.draggedText = null;
  } else if (isTextDragged(event)) {
    if (currentState.draggedText !== null) {
      setCoords(currentState.draggedText, event.x, event.y);
      changed = true
    }
  } else if (isEditText(event)) {
    const newText = prompt("Enter new text:", event.text.text);
    if (newText && newText !== event.text.text) {
      event.text.text = newText;
      changed = true;
    }
  } else if (isAddBar(event)) {
    if (currentState.selection) {
      const { bar, stave } = currentBar(currentState.selection.start);
      addBarToStave(stave, bar);
      changed = true;
    }
  } else if (isDeleteBar(event)) {
    if (currentState.selection) {
      // todo delete all selected bars
      const { bar, stave } = currentBar(currentState.selection.start);
      const newNotes = flatten(bar.notes.slice().map(n => n.notes));
      bar.notes.forEach(groupNote => groupNote.notes.forEach(note => deleteNote(note, newNotes)));
      currentState.itemCoords.delete(bar.id);
      deleteBarFromStave(stave, bar);
      changed = true;
    }
  } else if (isAddStave(event)) {
    if (currentState.selection) {
      const { stave } = currentBar(currentState.selection.start);
      addStaveToScore(currentState.score, stave);
      changed = true;
    }
  } else if (isDeleteStave(event)) {
    if (currentState.selection) {
      // todo delete all selected staves
      const { stave } = currentBar(currentState.selection.start);
      const notes: NoteModel[] = flatten(stave.bars.map(bar => flatten(bar.notes.map(n => n.notes))));
      const newNotes = notes.slice();
      notes.forEach(note => deleteNote(note, newNotes));
      deleteStaveFromScore(currentState.score, stave);
      changed = true;
    }
  } else if (isTieSelectedNotes(event)) {
    if (selectedNotes.length > 0) {
      selectedNotes.forEach(note => {
        note.tied = !note.tied
        makeCorrectTie(note);
      });
      changed = true;
    }
  } else if (isAddSecondTiming(event)) {
    if (selectedNotes.length >= 3) {
      const notes = sortByPosition(selectedNotes);
      currentState.score.secondTimings.push(SecondTiming.init(notes[0].id, notes[1].id, notes[2].id));
      changed = true;
    }
  } else if (isEditTimeSignatureNumerator(event)) {
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
  } else if (isEditTimeSignatureDenominator(event)) {
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
  } else if (isCopy(event)) {
    currentState.clipboard = JSON.parse(JSON.stringify(selectedNotes));
  } else if (isPaste(event)) {
    if (! currentState.selection || ! currentState.clipboard) {
      return;
    }
    const toPaste = currentState.clipboard.map(note => {
      const n = initNoteModel(note.pitch, note.length, note.tied);
      n.gracenote = deepcopy(note.gracenote);
      return n;
    });
    const pasteAfter = currentState.selection.end;
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
    updateView(currentState);
  }
}


export const isBeingDragged = (note: NoteModel): boolean => note === currentState.draggedNote;
export const isSelected = (note: NoteModel): boolean => false


const updateView = (newState: State) => {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;

  const scoreProps = {
    svgRef: currentState.currentSvg,
    zoomLevel: currentState.zoomLevel,
    selection: currentState.selection
  }
  render(scoreRoot, Score.render(newState.score, scoreProps));
  render(uiRoot, UI.render(newState));
}



function keyHandler(e: KeyboardEvent) {
  switch (e.key) {
    case "Escape":
      dispatch({ name: 'stop inputting notes' });
      break;
    case "c":
      if (e.ctrlKey)
        dispatch({ name: 'copy' });
      break;
    case "v":
      if (e.ctrlKey)
        dispatch({ name: 'paste' });
      break;
  }
}


function makeCorrectTie(noteModel: NoteModel) {
  const bars = Score.bars(currentState.score);
  const noteModels = flatten(bars.map(b => unGroupNotes(b.notes)));
  for (let i=0; i < noteModels.length; i++) {
    if (noteModels[i].id === noteModel.id) {
      if ((i > 0) && noteModel.tied) noteModels[i - 1].pitch = noteModel.pitch;
      if ((i < noteModels.length - 1) && noteModels[i + 1].tied) noteModels[i + 1].pitch = noteModel.pitch;
      break;
    }
  }
}

function sortByPosition(notes: NoteModel[]) {
  const bars = Score.bars(currentState.score);
  const noteModels = flatten(bars.map(b => unGroupNotes(b.notes)));

  notes.sort((a,b) => noteModels.indexOf(a) > noteModels.indexOf(b) ? 1 : -1);
  return notes;
}

function makeCorrectGroupings() {
  const bars = Score.bars(currentState.score);
  const noteModels = bars.map(b => unGroupNotes(b.notes));
  for (let i=0; i < bars.length; i++) {
    // todo actually pass the correct time signature
    bars[i].notes = groupNotes(noteModels[i], timeSignatureToBeatDivision(bars[i].timeSignature));
  }
}

function dragText(event: MouseEvent) {
  if (currentState.draggedText !== null) {
    const svg = currentState.currentSvg.current;
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
  currentState.itemCoords.delete(note.id);
  const secondTimingsToDelete: SecondTimingModel[] = [];
  currentState.score.secondTimings.forEach(t => {
    if (t.start === note.id || t.middle === note.id || t.end === note.id) {
      secondTimingsToDelete.push(t);
    }
  });
  secondTimingsToDelete.forEach(t =>
    currentState.score.secondTimings.splice(currentState.score.secondTimings.indexOf(t), 1));
  if (currentState.selection && (note === currentState.selection.start || note === currentState.selection.end)) {
    currentState.selection = null;
  }
}

function currentBar(note: NoteModel): { stave: StaveModel, bar: BarModel } {
  const staves = Score.staves(currentState.score);
  for (const stave of staves) {
    const bars = Stave.bars(stave);
    for (const bar of bars) {
      const noteModels = unGroupNotes(bar.notes);
      if (noteModels.includes(note)) {
        return { stave, bar };
      }
    }
  }

  return { stave: staves[0], bar: Stave.bars(staves[0])[0] }
}

function calculateZoomLevel(): number {
  const widthWithoutSidebar = window.innerWidth * 0.85;
  const width = widthWithoutSidebar * 0.9;
  return width / scoreWidth * 100;

}

function currentNoteModels(): NoteModel[] {
  const bars = Score.bars(currentState.score);
  return flatten(bars.map(b => unGroupNotes(b.notes)));
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
  const bars = Score.bars(currentState.score);
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

export default function startController(): void {
  window.addEventListener('keydown', keyHandler);
  window.addEventListener('mousemove', dragText);
  currentState.score = Score.init();
  // initially set the notes to be the right groupings
  makeCorrectGroupings();
  updateView(currentState);
}
currentState.noteInputLength = null;
*/
