import { render } from 'uhtml';
import { Pitch, flatten } from './all';
import { NoteLength, numberToNoteLength, noteLengthToNumber, toggleDot } from './NoteLength';
import { NoteModel, GroupNoteModel, unGroupNotes, groupNotes } from './Note';
import { timeSignatureToBeatDivision } from './TimeSignature';
import Score, { ScoreModel } from './Score';
import UI from './UI';

// Events
// Each EventType has an isEventType function that checks if a ScoreEvent is that event type
// EventTypes should be named after what the user is doing rather than what is happening internally
// (e.g. NoteClicked rather than NoteSelected)
// though ones that are accessed throught the UI will be named after what is happening
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
  | ToggleDotted;

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



export interface State {
  score: ScoreModel,
  draggedNote: NoteModel | null,
  selectedNotes: Set<NoteModel>,
  hoveredPitch: Pitch,
  focused: boolean,
  noteInputLength: NoteLength | null
}


let currentState: State = {
  score: { staves: [] },

  draggedNote: null,
  selectedNotes: new Set(),
  hoveredPitch: Pitch.A,
  focused: true,
  noteInputLength: null
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
        g.notes.forEach(note => {
          if (currentState.selectedNotes.has(note)) {
            g.notes.splice(g.notes.indexOf(note), 1);
          }
        });
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
      event.note.notes.splice(event.index, 0, { pitch: event.pitch, length: currentState.noteInputLength, gracenote: null });
      changed = true;
      recalculateNoteGroupings = true
    }
  } else if (isToggleDotted(event)) {
    currentState.selectedNotes.forEach(note => note.length = toggleDot(note.length));
    changed = true;
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

const updateView = (newState: State) => {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;
  render(scoreRoot, Score.render(newState.score));
  render(uiRoot, UI.render(newState));
}



function keyHandler(e: KeyboardEvent) {
  switch (e.key) {
    case "Escape":
      dispatch({ name: 'stop inputting notes' });
      break;
  }
}


function makeCorrectGroupings() {
  const bars = Score.bars(currentState.score);
  const noteModels = bars.map(b => unGroupNotes(b.notes));
  for (let i=0; i < bars.length; i++) {
    // todo actually pass the correct time signature
    bars[i].notes = groupNotes(noteModels[i], timeSignatureToBeatDivision(bars[i].timeSignature));
  }
}



document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', keyHandler);
  currentState.score = Score.init();
  // initially set the notes to be the right groupings
  makeCorrectGroupings();
  updateView(currentState);
});
