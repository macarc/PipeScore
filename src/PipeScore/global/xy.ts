//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  Functions for dealing with coordinates.
//  Useful for timings, ties, e.t.c. - anything where you need to know the
//  coordinates of something else.

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

// This MUST be called before every render
// so that dragging second timings doesn't snap to previous things :)
export const clearXY = () => {
  itemCoords.clear()
}

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

export const inOrder = (first: XY, second: XY, third: XY) =>
  before(first, second) && before(second, third);

export const before = (a: XY, b: XY, canBeTheSame = false) => {
  if (b.page > a.page) return true;
  if (b.y > a.y) return true;
  if (a.y > b.y) return false;
  return canBeTheSame ? a.beforeX <= b.beforeX : a.afterX <= b.beforeX;
};

export const itemBefore = (a: ID, b: ID, canBeTheSame = false) => {
  const f = getXY(a);
  const g = getXY(b);

  if (f && g) {
    return before(f, g, canBeTheSame);
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
