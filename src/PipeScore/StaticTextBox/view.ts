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

import m from 'mithril';

export function drawStaticTextBox(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  font: string,
  anchor: 'start' | 'middle' | 'end',
  onclick: () => void
): m.Children {
  return m(
    'text',
    {
      x,
      y,
      style: `font-size: ${fontSize}px; cursor: pointer; font-family: ${font};`,
      'text-anchor': anchor,
      ondblclick: onclick,
    },
    text || 'Double Click to Edit'
  );
}
