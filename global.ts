import { ID, Pitch } from './all';
import { NoteModel } from './Note/model';

interface XY {
  beforeX: number,
  afterX: number,
  y: number
}
const itemCoords: Map<ID, XY> = new Map();
// the y value will be the stave's y rather than the actual y value of the note
export const setXY = (item: ID, beforeX: number, afterX: number, y: number): void => {
  itemCoords.set(item, { beforeX, afterX, y });
}
export const getXY = (item: ID): XY | null => itemCoords.get(item) || null;




let currentDraggedNote: NoteModel | null = null;

export const setDraggedNotePitch = (pitch: Pitch) => {
  if (currentDraggedNote) {
    currentDraggedNote.pitch = pitch;
  }
}
export const unDragNote = () => currentDraggedNote = null;
export const isBeingDragged = (note: NoteModel) => note === currentDraggedNote;
