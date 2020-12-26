import { render } from 'uhtml';
import { Pitch } from './all';
import { NoteModel } from './Note';
import Score, { ScoreModel } from './Score';

// Events
// Each EventType has an isEventType function that checks if a ScoreEvent is that event type
// EventTypes should be named after what the user is doing rather than what is happening internally
// (e.g. NoteClicked rather than NoteSelected)
type ScoreEvent = MouseMovedOver | NoteClicked | BackgroundClicked | MouseUp;

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




interface State {
  score: ScoreModel,
  draggedNote: NoteModel | null,
  selectedNotes: Set<NoteModel>
}


let currentState: State = {
  score: { staves: [] },

  draggedNote: null,
  selectedNotes: new Set()
};

export function dispatch(event: ScoreEvent): void {
  /*
     The global event handler.
     Takes an event, processes it to create a new state, then rerenders the view if necessary.
   */
  let changed = false;
  if (isMouseMovedOver(event)) {
    if (currentState.draggedNote !== null && event.pitch !== currentState.draggedNote.pitch) {
      currentState.draggedNote.pitch = event.pitch;
      changed = true;
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
  } else {
    return event;
  }

  if (changed) {
    updateView(currentState.score);
  }
}


export const isBeingDragged = (note: NoteModel) => note === currentState.draggedNote;
export const isSelected = (note: NoteModel) => currentState.selectedNotes.has(note) || isBeingDragged(note);

const updateView = (newScore: ScoreModel) => render(document.body, Score.render(newScore));




// this is needed because of circular dependency
document.addEventListener('DOMContentLoaded', () => {
  currentState.score = Score.init();
  updateView(currentState.score);
});
