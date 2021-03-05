/*
   Copyright (C) 2020 Archie Maclean
 */
import { ID } from './types';

interface XY {
  beforeX: number,
  afterX: number,
  y: number
}

// itemCoords holds the coordinates of all items on the score
// Useful for components such as selection boxes that need access to multiple items' coordinates
const itemCoords: Map<ID, XY> = new Map();
// the y value will be the stave's y rather than the actual y value of the note
export const setXY = (item: ID, beforeX: number, afterX: number, y: number): void => {
  itemCoords.set(item, { beforeX, afterX, y });
}
export const getXY = (item: ID): XY | null => itemCoords.get(item) || null;
export const deleteXY = (item: ID): void => {
  itemCoords.delete(item);
}

export const closestItem = (x: number, y: number): ID => {
  let closestDistance = Infinity;
  let closestID = 0;
  for (const [id, xy] of itemCoords) {
    const xDistance = Math.min(Math.abs(xy.beforeX - x), Math.abs(xy.afterX - x));
    const yDistance = xy.y - y;
    const dist = xDistance**2 + yDistance**2;
    if (dist < closestDistance) {
      closestDistance = dist;
      closestID = id;
    }
  }
  return closestID;
}
