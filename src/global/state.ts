/*
  global.ts - Defines global mutable state variables for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { scoreWidth } from './constants';
import { SvgRef } from './svg';
import { ID } from './types';

import { V } from '../render/h';

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
