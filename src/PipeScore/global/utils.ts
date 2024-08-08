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

//  General helper functions.

export function foreach<A>(times: number, action: (i: number) => A): A[] {
  return [...new Array(times).keys()].map((i: number) => action(i));
}
export function capitalise(st: string) {
  return st[0].toUpperCase() + st.slice(1);
}

export function isRoughlyZero(i: number) {
  // Beautiful code to deal with floating point errors
  return i < 0.000001;
}

export function log<A>(value: A): A {
  console.log(value);
  return value;
}

export const car = <U, V>(pair: [U, V]): U => pair[0];
export const car3 = <U, V, W>(pair: [U, V, W]): U => pair[0];
export const first = <T>(array: T[]): T | null => array[0] || null;
// Find the last value of an array in fewer characters
export const last = <T>(array: T[]): T | null => array[array.length - 1] || null;
// ONLY use these if you have checked before hand that the array length is > 0
export const nfirst = <T>(array: T[]): T => array[0];
export const nlast = <T>(array: T[]): T => array[array.length - 1];

export function oneBefore<A>(item: A, array: A[]) {
  return array[array.indexOf(item) - 1] || null;
}

export function after<A>(item: A, array: A[]) {
  return array[array.indexOf(item) + 1] || null;
}

export function removeNulls<A>(array: (A | null)[]): A[] {
  return array.filter((a) => a !== null) as A[];
}

export function splitOn<A>(item: A, array: A[]): A[][] {
  const result: A[][] = [[]];
  for (let i = 0; i < array.length; i++) {
    if (array[i] === item) {
      result.push([]);
    } else {
      nlast(result).push(array[i]);
    }
  }
  return result;
}

export function reversed<A>(array: A[]): A[] {
  const copy = [...array];
  copy.reverse();
  return copy;
}

export function sum(array: number[]) {
  return array.reduce((acc, n) => acc + n, 0);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type SvgPt = { x: number; y: number; page: number };

export function svgCoords(event: MouseEvent): SvgPt | null {
  let svg: SVGSVGElement | null = null;
  if (event.target instanceof SVGElement) {
    svg = event.target.ownerSVGElement;
  } else {
    svg = document.getElementsByTagName('svg')[0];
  }
  if (svg instanceof SVGSVGElement) {
    const page = Number.parseInt(svg.classList[0]);
    const CTM = svg.getScreenCTM();
    if (CTM == null) return null;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;

    const svgPt = pt.matrixTransform(CTM.inverse());

    return { x: svgPt.x, y: svgPt.y, page };
  }
  return null;
}
