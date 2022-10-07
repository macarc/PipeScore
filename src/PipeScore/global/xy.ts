/*
  Functions for dealing with coordinates
  - useful for things like dragging, ties, and snap to not
  - anything where you need to know the coordinates of something else.
  Copyright (C) 2021 macarc
*/
import { ID } from './id';

export interface XY {
  beforeX: number;
  afterX: number;
  y: number;
  page: number;
}

// itemCoords holds the coordinates of all items on the score
// Useful for components such as selection boxes that need access to multiple items' coordinates
const itemCoords: Map<ID, XY> = new Map();

// I couldn't face adding 'page' to everything's props, so we just use a global value...bad practice
// I know
let currentPage = 0;

export const setXYPage = (page: number) => {
  currentPage = page;
};
// The y value will be the stave's y rather than the actual y value of the note
// The y value of the note can always be calculated from this, but it's harder to do it in reverse
// Also it makes things like checking order easier
export const setXY = (
  item: ID,
  beforeX: number,
  afterX: number,
  y: number,
  page?: number
): void => {
  if (page === undefined) page = currentPage;
  itemCoords.set(item, { beforeX, afterX, y, page });
};
export const getXY = (item: ID): XY | null => itemCoords.get(item) || null;
export const deleteXY = (item: ID): void => {
  itemCoords.delete(item);
};

export const before = (a: XY, b: XY, useAfterX = false): boolean => {
  if (b.page > a.page) return true;
  if (b.y > a.y) return true;
  if (a.y > b.y) return false;
  return useAfterX ? b.afterX > a.beforeX : b.beforeX > a.beforeX;
};

export const itemBefore = (a: ID, b: ID, useAfterX = false): boolean => {
  const f = getXY(a);
  const g = getXY(b);

  if (f && g) {
    return before(f, g, useAfterX);
  } else {
    return false;
  }
};

// This finds the item the closest to the point (x,y)
// rightMost should be set to true if it should (in the case of a draw) favour the right-most element
export const closestItem = (
  x: number,
  y: number,
  page: number,
  rightMost: boolean
): ID | null => {
  let closestDistance = Infinity;
  let closestID = null;
  const closer = (distance: number, previousBest: number) =>
    rightMost ? distance <= previousBest : distance < previousBest;
  [...itemCoords]
    .filter(([_, coord]) => coord.page === page)
    .sort((a, b) => (b[1].beforeX < a[1].beforeX ? 1 : -1))
    .forEach(([id, xy]) => {
      const xDistance = Math.min(
        Math.abs(xy.beforeX - x),
        Math.abs(xy.afterX - x)
      );
      const yDistance = xy.y - y;
      const dist = xDistance ** 2 + yDistance ** 2;

      if (closer(dist, closestDistance)) {
        closestDistance = dist;
        closestID = id;
      }
    });

  return closestID;
};
