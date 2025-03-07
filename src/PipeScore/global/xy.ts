//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
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

import type { IScore } from '../Score';
import type { ID } from './id';

export interface XY {
  id: ID;
  beforeX: number;
  afterX: number;
  y: number;
  page: number;
  harmonyIndex: number;
}

// itemCoords holds the coordinates of all items on the score
// Useful for components such as selection boxes that need access to multiple items' coordinates
const itemCoords: Map<ID, XY> = new Map();

// I couldn't face adding 'page' to everything's props, so we just use a global value...bad practice
// I know
let currentPage = 0;

// This MUST be called before every render
// so that dragging second timings doesn't snap to previous things :)
export function clearXY() {
  itemCoords.clear();
}

export function setXYPage(page: number) {
  currentPage = page;
}

// The y value will be the stave's y rather than the actual y value of the note
// The y value of the note can always be calculated from this, but it's harder to do it in reverse
// Also it makes things like checking order easier
export function setXY(
  item: ID,
  beforeX: number,
  afterX: number,
  y: number,
  harmonyIndex: number
) {
  itemCoords.set(item, {
    id: item,
    beforeX,
    afterX,
    y,
    page: currentPage,
    harmonyIndex,
  });
}

export const getXY = (item: ID): XY | null => itemCoords.get(item) || null;
export function deleteXY(item: ID) {
  itemCoords.delete(item);
}

export function isBefore(a: XY, b: XY, aProp: keyof XY, bProp: keyof XY) {
  if (a.page < b.page) return true;
  if (b.page < a.page) return false;
  if (a.y < b.y) return true;
  if (b.y < a.y) return false;
  return a[aProp] < b[bProp];
}

export function isItemBefore(a: ID, b: ID, aProp: keyof XY, bProp: keyof XY) {
  const f = getXY(a);
  const g = getXY(b);

  return (f && g && isBefore(f, g, aProp, bProp)) || false;
}

// This finds the item the closest to the point (x,y)
// rightMost should be set to true if it should (in the case of a draw) favour the right-most element
export function closestItem(
  x: number,
  y: number,
  page: number,
  prop: keyof XY
): ID | null {
  let closestDistance = Number.POSITIVE_INFINITY;
  return [...itemCoords]
    .filter(([_, coord]) => coord.page === page)
    .reduce((closestID: ID | null, [id, xy]) => {
      const xDistance = Math.abs(xy[prop] - x);
      const yDistance = xy.y - y;
      const dist = xDistance ** 2 + yDistance ** 2;

      if (dist < closestDistance) {
        closestDistance = dist;
        return id;
      }
      return closestID;
    }, null);
}

// If xy is on the same page, return it
// If xy is on an earlier page, return the first item on this page (if there is one)
// Otherwise return null
function itemOrFirstOnPage(xy: XY, page: number, score: IScore) {
  if (xy.page === page) {
    return xy;
  }
  if (xy.page < page) {
    const startID = score.firstOnPage(page, xy.harmonyIndex)?.id;
    return (startID && getXY(startID)) || null;
  }
  return null;
}

// If xy is on the same page, return it
// If xy is on a later page, return the last item on this page (if there is one)
// Otherwise return null
function itemOrLastOnPage(xy: XY, page: number, score: IScore) {
  if (xy.page === page) {
    return xy;
  }
  if (xy.page > page) {
    const endID = score.lastOnPage(page, xy.harmonyIndex)?.id || null;
    return endID && getXY(endID);
  }
  return null;
}

// Considering a range (e.g. selection) from start to end, this returns
// start and end, but clamped to the page
// (so if start is before the start of the page, it returns the first item on the page)
// (and if end is after the end of the page, it returns the last item on the page)
export function getXYRangeForPage(
  start: ID,
  end: ID,
  page: number,
  score: IScore,
  useAfterEnd: boolean
) {
  const a = getXY(start);
  const b = getXY(end);

  if (!a && !b) {
    // Objects are on later pages
    return { start: null, end: null };
  }

  if (a && b && a.harmonyIndex !== b.harmonyIndex) {
    console.error(
      'Tried to get an xy range for items on different harmony staves',
      a,
      b
    );
    return { start: null, end: null };
  }

  if (a && b) {
    const aIsBeforeB = isBefore(a, b, 'beforeX', useAfterEnd ? 'afterX' : 'beforeX');
    const start = itemOrFirstOnPage(aIsBeforeB ? a : b, page, score);
    const end = itemOrLastOnPage(aIsBeforeB ? b : a, page, score);
    if (start && end) return { start, end };
  }

  const harmonyIndex = (a === null ? b?.harmonyIndex : a.harmonyIndex) || 0;
  const lastID = score.lastOnPage(page, harmonyIndex)?.id || null;
  const lastOnPage = lastID && getXY(lastID);

  if (a && !b && a.page <= page) {
    const start = itemOrFirstOnPage(a, page, score);
    const end = lastOnPage;
    if (start && end) return { start, end };
  }

  if (!a && b && b.page <= page) {
    const start = itemOrFirstOnPage(b, page, score);
    const end = lastOnPage;
    if (start && end) return { start, end };
  }

  return { start: null, end: null };
}
