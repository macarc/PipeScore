import { render } from 'uhtml';
import { Pitch } from './all';
import { NoteModel, NonRestNoteModel, RestNoteModel } from './Note';
import Score, { ScoreModel } from './Score';
import UI from './UI';

// Events
// Each EventType has an isEventType function that checks if a ScoreEvent is that event type
// EventTypes should be named after what the user is doing rather than what is happening internally
// (e.g. NoteClicked rather than NoteSelected)
// though ones that are accessed throught the UI will be named after what is happening
type ScoreEvent = MouseMovedOver | NoteClicked | BackgroundClicked | MouseUp | DeleteSelectedNotes | RestClicked | SetGracenoteOnSelected;

type MouseMovedOver = {
  name: 'mouse over pitch',
  pitch: Pitch
}
function isMouseMovedOver(e: ScoreEvent): e is MouseMovedOver {
  return e.name === 'mouse over pitch';
}

type NoteClicked = {
  name: 'note clicked',
  note: NonRestNoteModel,
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

type RestClicked = {
  name: 'rest clicked',
  rest: RestNoteModel,
  pitch: Pitch
}
function isRestClicked(e: ScoreEvent): e is RestClicked {
  return e.name === 'rest clicked';
}

type SetGracenoteOnSelected = {
  name: 'set gracenote',
  value: string
}
function isSetGracenoteOnSelected(e: ScoreEvent): e is SetGracenoteOnSelected {
  return e.name === 'set gracenote';
}




export interface State {
  score: ScoreModel,
  draggedNote: NoteModel | null,
  selectedNotes: Set<NoteModel>,
  hoveredPitch: Pitch
}


let currentState: State = {
  score: { staves: [] },

  draggedNote: null,
  selectedNotes: new Set(),
  hoveredPitch: Pitch.A
};

export function dispatch(event: ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
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
      currentState.selectedNotes.forEach(n => n.pitch = 'rest');
      currentState.selectedNotes = new Set();
      changed = true;
    }
  } else if (isRestClicked(event)) {
    (event.rest as NoteModel).pitch = event.pitch;
    changed = true;
  } else if (isSetGracenoteOnSelected(event)) {
    currentState.selectedNotes.forEach(note => note.gracenote = { type: 'reactive', name: event.value });
    changed = true;
  } else {
    return event;
  }

  if (changed) {
    updateView(currentState);
  }
}


export const isBeingDragged = (note: NoteModel) => note === currentState.draggedNote;
export const isSelected = (note: NoteModel) => currentState.selectedNotes.has(note) || isBeingDragged(note);

export let hoveringPitch = () => currentState.hoveredPitch;

const updateView = (newState: State) => {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;
  render(scoreRoot, Score.render(newState.score));
  render(uiRoot, UI.render(newState));
}




// this is needed because of circular dependency
document.addEventListener('DOMContentLoaded', () => {
  currentState.score = Score.init();
  updateView(currentState);
});
