import { ID } from './all';

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
