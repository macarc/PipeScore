import { ID, Pitch, SvgRef } from './all';
import { NoteModel, NoteLength } from './Note/model';
import { ScoreSelectionModel } from './ScoreSelection/model';
import { TextBoxModel } from './TextBox/model';
import { ScoreModel } from './Score/model';

// This module contains all of the mutable global variables that are used to define the state of PipeScore

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
export const deleteXY = (item: ID): void => {
  itemCoords.delete(item);
}




export let draggedNote: NoteModel | null = null;

export const setDraggedNote = (note: NoteModel) => draggedNote = note;
export const unDragNote = () => draggedNote = null;
export const isBeingDragged = (note: NoteModel) => note === draggedNote;

export let inputLength: NoteLength | null = null;
export const setInputLength = (l: NoteLength | null) => inputLength = l;

export let zoomLevel = 100;
export const setZoomLevel = (z: number) => zoomLevel = z;

export let currentSvg: SvgRef = { ref: null };
export let clipboard: NoteModel[] | null = null;
export const setClipboard = (c: NoteModel[] | null) => clipboard = c;
export let selection: ScoreSelectionModel | null = null;
export const setSelection = (s: ScoreSelectionModel | null) => selection = s;
export let draggedText: TextBoxModel | null = null;
export const setDraggedText = (t: TextBoxModel | null) => draggedText = t;

export let score: ScoreModel;
export const setScore = (s: ScoreModel) => score = s;
