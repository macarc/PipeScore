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

//  Code for drawing triplets

import m from 'mithril';
import { ITriplet } from '.';
import { clickTripletLine } from '../Events/Note';
import { pitchY } from '../global/pitch';
import { getXY } from '../global/xy';
import { NoteProps, drawNoteGroup } from './view';

// Draws a triplet marking from x1,y1 to x2,y2
function tripletLine(
  triplet: ITriplet,
  staveY: number,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  selected: boolean,
  onmousedown: () => void
): m.Children {
  const midx = x1 + (x2 - x1) / 2;
  const height = 40;
  const midy = staveY - height;
  const gap = 15;
  const path = `M ${x1},${y1 - gap} Q ${midx},${midy}, ${x2},${y2 - gap}`;
  const colour = selected ? 'orange' : 'black';
  return m('g[class=triplet]', [
    m(
      'text',
      {
        x: midx - 2.5,
        y: midy + 10,
        'text-anchor': 'center',
        fill: colour,
        style: 'font-size: 10px;',
        onmousedown,
      },
      '3'
    ),
    m('path', {
      d: path,
      stroke: colour,
      fill: 'none',
      onmousedown,
    }),
  ]);
}

export function drawTriplet(triplet: ITriplet, props: NoteProps) {
  triplet.ensureNotesAreCorrectLength();

  return m('g', [
    drawNoteGroup(triplet.tripletSingleNotes(), props),
    tripletLine(
      triplet,
      props.y,
      getXY(triplet.firstSingle().id)?.afterX || 0,
      getXY(triplet.lastSingle().id)?.beforeX || 0,
      pitchY(props.y, triplet.firstSingle().pitch()),
      pitchY(props.y, triplet.lastSingle().pitch()),
      props.state.selectedTripletLine === triplet,
      () => props.dispatch(clickTripletLine(triplet))
    ),
  ]);
}
