/*
   Copyright (C) 2021 Archie Maclean
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

export const itemBefore = (a: ID, b: ID): boolean => {
  const f = getXY(a);
  const g = getXY(b);

  if (f && g) {
    if (g.y > f.y) return true;
    else if (f.y > g.y) return false;
    else return (g.beforeX > f.beforeX)
  } else {
    return false;
  }
}

export const closestItem = (x: number, y: number, rightMost: boolean): ID => {
  // This finds the item the closest to the point (x,y)
  // rightMost should be set to true if it should (in the case of a tie) favour the right-most element

  let closestDistance = Infinity;
  let closestID = 0;
  const itemCoordinates = [...itemCoords].sort((a, b) => (b[1].beforeX < a[1].beforeX) ? 1 : -1);
  for (const [id, xy] of itemCoordinates) {
    const xDistance = Math.min(Math.abs(xy.beforeX - x), Math.abs(xy.afterX - x));
    const yDistance = xy.y - y;
    const dist = xDistance**2 + yDistance**2;
    const cmp = (a: number,b: number) => rightMost ? a <= b : a < b;

    if (cmp(dist, closestDistance)) {
      closestDistance = dist;
      closestID = id;
    }
  }
  return closestID;
}
