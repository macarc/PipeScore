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

//  Widths are dealt with slightly oddly - they are split into two parts:
//  - min : the minimum width (in pixels) - so for example, the physical
//     width of the note head is the min
//  - extend : a relative fraction, a bit like `fr` in display: flex,
//     that determines how the remaining width is split up

//  So when it is reified (when the actual width is found) it will fill up
//  the space with the mins, then grow the rest according to extend.

export interface Width {
  // min - the minimum possible width for an element
  min: number;
  // extend - the relative fraction that the element takes up when expanded (like fr in display: flex)
  extend: number;
}

function init(min: number, extend: number): Width {
  return { min, extend };
}

function addAll(...widths: Width[]): Width {
  return widths.reduce(add, zero());
}

function add(a: Width, b: Width): Width {
  return {
    min: a.min + b.min,
    extend: a.extend + b.extend,
  };
}

function mul(width: Width, val: number): Width {
  return {
    ...width,
    extend: val * width.extend,
  };
}

function reify(width: Width, beatWidth: number): number {
  return width.min + beatWidth * width.extend;
}

function zero(): Width {
  return {
    min: 0,
    extend: 0,
  };
}

export default {
  init,
  add,
  addAll,
  mul,
  reify,
  zero,
};
