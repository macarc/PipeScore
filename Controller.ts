/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { render } from 'uhtml';
import { Pitch, flatten, ID } from './all';
import { NoteLength, numberToNoteLength, noteLengthToNumber, toggleDot } from './NoteLength';
import { NoteModel, GroupNoteModel, unGroupNotes, groupNotes, initNoteModel } from './Note';
import { timeSignatureToBeatDivision } from './TimeSignature';
import { TextBoxModel, setCoords } from './TextBox';
import Score, { ScoreModel, addStaveToScore, deleteStaveFromScore, scoreWidth } from './Score';
import { StaveModel, addBarToStave, deleteBarFromStave } from './Stave';
import { BarModel } from './Bar';
import SecondTiming, { SecondTimingModel } from './SecondTiming';
import Stave from './Stave';
import UI from './UI';

// Events
type ScoreEvent
  = MouseMovedOver
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
  | TextClicked
  | TextMouseUp
  | TextDragged
  | AddSecondTiming
  | EditText
  | AddBar
  | AddStave
  | DeleteBar
  | DeleteStave;

type MouseMovedOver = {
  name: 'mouse over pitch',
  pitch: Pitch
}
function isMouseMovedOver(e: ScoreEvent): e is MouseMovedOver {
  return e.name === 'mouse over pitch';
}

type NoteClicked = {
  name: 'note clicked',
  note: NoteModel,
  event: MouseEvent
}
function isNoteClicked(e: ScoreEvent): e is NoteClicked {
  return e.name === 'note clicked';
}

type BackgroundClicked = {
  name: 'background clicked'
}
function isBackgroundClicked(e: ScoreEvent): e is BackgroundClicked {
  return e.name === 'background clicked';
}

type MouseUp = {
  name: 'mouse up'
}
function isMouseUp(e: ScoreEvent): e is MouseUp {
  return e.name === 'mouse up';
}

type DeleteSelectedNotes = {
  name: 'delete selected notes'
}
function isDeleteSelectedNotes(e: ScoreEvent): e is DeleteSelectedNotes {
  return e.name === 'delete selected notes';
}

type SetGracenoteOnSelected = {
  name: 'set gracenote',
  value: string
}
function isSetGracenoteOnSelected(e: ScoreEvent): e is SetGracenoteOnSelected {
  return e.name === 'set gracenote';
}

type SetInputLength = {
  name: 'set note input length',
  length: NoteLength
}
function isSetInputLength(e: ScoreEvent): e is SetInputLength {
  return e.name === 'set note input length';
}

type StopInputtingNotes = {
  name: 'stop inputting notes'
}
function isStopInputtingNotes(e: ScoreEvent): e is StopInputtingNotes {
  return e.name === 'stop inputting notes';
}

type NoteAdded = {
  name: 'note added',
  pitch: Pitch,
  index: number,
  note: GroupNoteModel
}
function isNoteAdded(e: ScoreEvent): e is NoteAdded {
  return e.name === 'note added';
}

type ToggleDotted = {
  name:  'toggle dotted'
}
function isToggleDotted(e: ScoreEvent): e is ToggleDotted {
  return e.name === 'toggle dotted';
}

type ChangeZoomLevel = {
  name: 'change zoom level',
  zoomLevel: number
}
function isChangeZoomLevel(e: ScoreEvent): e is ChangeZoomLevel {
  return e.name === 'change zoom level';
}

type TextClicked = {
  name: 'text clicked',
  text: TextBoxModel
}
function isTextClicked(e: ScoreEvent): e is TextClicked {
  return e.name === 'text clicked';
}

type EditText = {
  name: 'edit text',
  text: TextBoxModel
}
function isEditText(e: ScoreEvent): e is EditText {
  return e.name === 'edit text';
}

type AddBar = {
  name: 'add bar'
}
function isAddBar(e: ScoreEvent): e is AddBar {
  return e.name === 'add bar';
}

type DeleteBar = {
  name: 'delete bar'
}
function isDeleteBar(e: ScoreEvent): e is DeleteBar {
  return e.name === 'delete bar';
}

type AddStave = {
  name: 'add stave'
}
function isAddStave(e: ScoreEvent): e is AddStave {
  return e.name === 'add stave';
}

type DeleteStave = {
  name: 'delete stave'
}
function isDeleteStave(e: ScoreEvent): e is DeleteStave {
  return e.name === 'delete stave';
}

type TieSelectedNotes = {
  name: 'tie selected notes'
}
function isTieSelectedNotes(e: ScoreEvent): e is TieSelectedNotes {
  return e.name === 'tie selected notes';
}

type TextDragged = {
  name: 'text dragged',
  x: number,
  y: number
}
function isTextDragged(e: ScoreEvent): e is TextDragged {
  return e.name === 'text dragged';
}

type TextMouseUp = {
  name: 'text mouse up'
}
function isTextMouseUp(e: ScoreEvent): e is TextMouseUp {
  return e.name === 'text mouse up';
}

type AddSecondTiming = {
  name: 'add second timing',
}
function isAddSecondTiming(e: ScoreEvent): e is AddSecondTiming {
  return e.name === 'add second timing';
}


interface SvgRef {
  current: SVGSVGElement | null
}

interface XY {
  beforeX: number,
  afterX: number,
  y: number
}
export interface State {
  score: ScoreModel,
  draggedNote: NoteModel | null,
  selectedNotes: Set<NoteModel>,
  hoveredPitch: Pitch,
  focused: boolean,
  noteInputLength: NoteLength | null,
  zoomLevel: number,
  draggedText: TextBoxModel | null,
  itemCoords: Map<ID, XY>,
  currentSvg: SvgRef
}


let currentState: State = {
  score: Score.init(),

  draggedNote: null,
  selectedNotes: new Set(),
  hoveredPitch: Pitch.A,
  focused: true,
  noteInputLength: null,
  zoomLevel: calculateZoomLevel(),
  draggedText: null,
  itemCoords: new Map(),
  currentSvg: { current: null }
};

export function dispatch(event: ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false,
  recalculateNoteGroupings = false;
  if (isMouseMovedOver(event)) {
    if (event.pitch !== currentState.hoveredPitch) {
      currentState.hoveredPitch = event.pitch;
      changed = true;
      if (currentState.draggedNote !== null) {
        currentState.draggedNote.pitch = event.pitch;
        makeCorrectTie(currentState.draggedNote);
        changed = true;
      }
    }
  } else if (isNoteClicked(event)) {
    currentState.draggedNote = event.note;
    if (! event.event.shiftKey) {
      currentState.selectedNotes = new Set();
    }
    changed = true;
  } else if (isBackgroundClicked(event)) {
    if (currentState.selectedNotes.size > 0) {
      currentState.selectedNotes = new Set();
      changed = true;
    }
  } else if (isMouseUp(event)) {
    if (currentState.draggedNote !== null) {
      currentState.selectedNotes.add(currentState.draggedNote);
      currentState.draggedNote = null;
      changed = true;
    }
  } else if (isDeleteSelectedNotes(event)) {
    if (currentState.selectedNotes.size > 0) {
      const groupedNotes = Score.groupNotes(currentState.score);
      const notes = flatten(groupedNotes.map(g => g.notes));
      // quadratic!
      groupedNotes.forEach(g => {
        // Need to slice it so that deleting inside the loop works
        const newNotes = g.notes.slice();
        g.notes.forEach(note => {
          if (currentState.selectedNotes.has(note)) {
            deleteNote(note, newNotes);
          }
        });
        g.notes = newNotes;
      });
      currentState.selectedNotes = new Set();
      changed = true;
      recalculateNoteGroupings = true;
    }
  } else if (isSetGracenoteOnSelected(event)) {
    currentState.selectedNotes.forEach(note => note.gracenote = { type: 'reactive', name: event.value });
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
    currentState.selectedNotes.forEach(note => note.length = toggleDot(note.length));
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
    const { bar, stave } = currentBar([...currentState.selectedNotes.values()][0]);
    addBarToStave(stave, bar);
    changed = true;
  } else if (isDeleteBar(event)) {
    const { bar, stave } = currentBar([...currentState.selectedNotes.values()][0]);
    currentState.itemCoords.delete(bar.id);
    deleteBarFromStave(stave, bar);
    changed = true;
  } else if (isAddStave(event)) {
    const { stave } = currentBar([...currentState.selectedNotes.values()][0]);
    addStaveToScore(currentState.score, stave);
    changed = true;
  } else if (isDeleteStave(event)) {
    const { stave } = currentBar([...currentState.selectedNotes.values()][0]);
    deleteStaveFromScore(currentState.score, stave);
    changed = true;
  } else if (isTieSelectedNotes(event)) {
    if (currentState.selectedNotes.size > 0) {
      currentState.selectedNotes.forEach(note => {
        note.tied = !note.tied
        makeCorrectTie(note);
      });
      changed = true;
    }
  } else if (isAddSecondTiming(event)) {
    if (currentState.selectedNotes.size >= 3) {
      const notes = sortByPosition([...currentState.selectedNotes.values()]);
      currentState.score.secondTimings.push(SecondTiming.init(notes[0].id, notes[1].id, notes[2].id));
      changed = true;
    }
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


export const isBeingDragged = (note: NoteModel) => note === currentState.draggedNote;
export const isSelected = (note: NoteModel) => currentState.selectedNotes.has(note) || isBeingDragged(note);

// the y value will be the stave's y rather than the actual y value of the note
export const setXY = (item: ID, beforeX: number, afterX: number, y: number) => currentState.itemCoords.set(item, { beforeX, afterX, y });
export const getXY = (item: ID): XY | null => currentState.itemCoords.get(item) || null;

const updateView = (newState: State) => {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;
  render(scoreRoot, Score.render(newState.score, { svgRef: currentState.currentSvg, zoomLevel: currentState.zoomLevel }));
  render(uiRoot, UI.render(newState));
}



function keyHandler(e: KeyboardEvent) {
  switch (e.key) {
    case "Escape":
      dispatch({ name: 'stop inputting notes' });
      break;
  }
}


function makeCorrectTie(noteModel: NoteModel) {
  const bars = Score.bars(currentState.score);
  const noteModels = flatten(bars.map(b => unGroupNotes(b.notes)));
  for (let i=0; i < noteModels.length; i++) {
    if (i === 0 && noteModels[i] === noteModel) {
      break;
    } else if (noteModels[i] === noteModel) {
      if (noteModel.tied) noteModels[i - 1].pitch = noteModel.pitch;
      if ((i < noteModels.length - 1) && noteModels[i + 1].tied) noteModels[i + 1].pitch = noteModel.pitch;
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
  const widthWithoutSidebar = window.innerWidth * 0.9;
  const width = widthWithoutSidebar * 0.9;
  return width / scoreWidth * 100;

}


export default function startController() {
  window.addEventListener('keydown', keyHandler);
  window.addEventListener('mousemove', dragText);
  currentState.score = Score.init();
  // initially set the notes to be the right groupings
  makeCorrectGroupings();
  updateView(currentState);
}
