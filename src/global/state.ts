/*
  global.ts - Defines global mutable state variables for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { scoreWidth } from './constants';
import { SvgRef } from './svg';
import { ID } from './types';

import { V, h } from '../render/h';

import { ScoreModel } from '../Score/model';
import { NoteModel, NoteLength } from '../Note/model';
import { SingleGracenote } from '../Gracenote/model';
import { ScoreSelectionModel } from '../ScoreSelection/model';
import { TextBoxModel } from '../TextBox/model';

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

export const setDraggedNote = (note: NoteModel): void => {
  draggedNote = note;
}
export const unDragNote = (): void => {
  draggedNote = null;
}
export let draggedGracenote: SingleGracenote | null = null;
export const setDraggedGracenote = (g: SingleGracenote | null): void => {
  draggedGracenote = g;
}
export const isBeingDragged = (note: NoteModel): boolean => note === draggedNote;

export let inputLength: NoteLength | null = null;
export const setInputLength = (l: NoteLength | null): void => {
  inputLength = l;
}

export let zoomLevel = (0.75 * window.outerWidth) / scoreWidth * 100;
export const setZoomLevel = (z: number): void => {
  zoomLevel = z;
}

export const currentSvg: SvgRef = { current: null };
export let clipboard: NoteModel[] | null = null;
export const setClipboard = (c: NoteModel[] | null): void => {
  clipboard = c;
}
export let selection: ScoreSelectionModel | null = null;
export const setSelection = (s: ScoreSelectionModel | null): void => {
  selection = s;
}
export let draggedText: TextBoxModel | null = null;
export const setDraggedText = (t: TextBoxModel | null): void => {
  draggedText = t;
}
export let selectedText: TextBoxModel | null = null;
export const setSelectedText = (t: TextBoxModel | null): void => {
  selectedText = t;
}

export let score: ScoreModel;
export const setScore = (s: ScoreModel): void => {
  score = s;
}
export let view: V;
export const setView = (v: V): void => {
  // todo update view here
  view = v;
}

export let uiView: V;
export const setUIView = (v: V): void => {
  // todo update view here
  uiView = v;
}
