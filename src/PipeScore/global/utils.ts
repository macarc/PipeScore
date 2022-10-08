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

//  General helper functions.

// eslint-disable-next-line
export type Obj = Record<string, any>;

export function foreach<A>(times: number, action: (i: number) => A): A[] {
  return [...new Array(times).keys()].map((i: number) => action(i));
}
export function capitalise(st: string) {
  return st[0].toUpperCase() + st.slice(1);
}

export const car = <U, V>(pair: [U, V]): U => pair[0];
export const first = <T>(array: T[]): T | null => array[0] || null;
// Find the last value of an array in fewer characters
export const last = <T>(array: T[]): T | null =>
  array[array.length - 1] || null;
// ONLY use these if you have checked before hand that the array length is > 0
export const nfirst = <T>(array: T[]): T => array[0];
export const nlast = <T>(array: T[]): T => array[array.length - 1];

// Monad :)
export const nmap = <T, U>(a: T | null, fn: (b: T) => U): U | null => {
  if (a) return fn(a);
  return null;
};

type SvgPt = { x: number; y: number; page: number };

export function svgCoords(event: MouseEvent): SvgPt | null {
  let svg: SVGSVGElement | null = null;
  if (event.target instanceof SVGElement) {
    svg = event.target.ownerSVGElement;
  } else {
    svg = document.getElementsByTagName('svg')[0];
  }
  if (svg instanceof SVGSVGElement) {
    const page = parseInt(svg.classList[0]);
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
