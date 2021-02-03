import { GroupNoteModel, NoteModel } from './model';
import { Pitch } from '../all';
import { draggedNote, setDraggedNote, inputLength } from '../global';
import Note from './functions';
import { update } from '../Update';

type NoteClicked = {
  name: 'note clicked',
  event: MouseEvent
}
const isNoteClicked = (e: NoteEvent): e is NoteClicked => e.name === 'note clicked';

// TODO this needs a group note, not a NoteModel...
type NoteAdded = {
  name: 'note added',
  pitch: Pitch,
  index: number,
  groupNote: GroupNoteModel
}
const isNoteAdded = (e: NoteEvent): e is NoteAdded => e.name === 'note added';

type MouseOverPitch = {
  name: 'mouse over pitch',
  pitch: Pitch
}
const isMouseOverPitch = (e: NoteEvent): e is MouseOverPitch => e.name === 'mouse over pitch';

type SetPitch = {
  name: 'set pitch',
  pitch: Pitch
}
const isSetPitch = (e: NoteEvent): e is SetPitch => e.name === 'set pitch';

type ToggleDot = {
  name: 'toggle dot'
}
const isToggleDot = (e: NoteEvent): e is ToggleDot => e.name === 'toggle dot';

type NoteEvent = NoteClicked | NoteAdded | MouseOverPitch | SetPitch | ToggleDot;

export function dispatch(note: NoteModel, event: NoteEvent): void {
  if (isSetPitch(event)) {
    note.pitch = event.pitch;
    update();
  } else if (isMouseOverPitch(event)) {
    if (draggedNote) dispatch(draggedNote, { name: 'set pitch', pitch: event.pitch });
  } else if (isNoteClicked(event)) {
    setDraggedNote(note);
    // TODO selection
  } else if (isToggleDot(event)) {
    note.length = Note.toggleDot(note.length)
    // recalculate note groupings
    update();
  } else if (isNoteAdded(event)) {
    if (inputLength) {
      const newNote = Note.initNote(event.pitch, inputLength);
      event.groupNote.notes.splice(event.index, 0, newNote);
      // recalculate note groupings, makeCorrectTie?
      update();
    }
  } else {
    return event;
  }
}
