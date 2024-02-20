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

//  Invisible rectangles that are used to detect what pitch the mouse is over.
//  TODO: Maybe name this better?

import m from 'mithril';
import { Pitch, pitchToHeight } from '../global/pitch';
import { settings } from '../global/settings';

export function pitchBoxes(
  x: number,
  y: number,
  width: number,
  mouseOver: (pitch: Pitch, event: MouseEvent) => void = () => null,
  mouseDown: (pitch: Pitch, event: MouseEvent) => void = () => null,
  mouseMoveIsMouseOver: boolean
): m.Children {
  // Need to add 0.1 for Firefox since if it is exact then the boxes don't overlap
  // and there are 0 pixel gaps between that can nevertheless be hovered over
  const height = settings.lineGap / 2 + 0.2;

  const pitches = [
    Pitch.G,
    Pitch.A,
    Pitch.B,
    Pitch.C,
    Pitch.D,
    Pitch.E,
    Pitch.F,
    Pitch.HG,
    Pitch.HA,
  ];

  const gap = settings.lineHeightOf(4);

  const heightOfBetweenBoxes =
    (settings.staveGap - settings.lineHeightOf(4) - gap) / 2;

  const over = mouseMoveIsMouseOver ? 'onmousemove' : 'onmouseover';

  return m('g[class=drag-boxes]', [
    m('rect[class=notebox]', {
      x,
      y: y - settings.lineGap - heightOfBetweenBoxes,
      width,
      height: heightOfBetweenBoxes,
      opacity: 0,
      [over]: (e: MouseEvent) => mouseOver(Pitch.HA, e),
      onmousedown: (e: MouseEvent) => mouseDown(Pitch.HA, e),
    }),
    m('rect', {
      x,
      y: y + settings.lineHeightOf(3),
      width,
      height: heightOfBetweenBoxes,
      opacity: 0,
      [over]: (e: MouseEvent) => mouseOver(Pitch.G, e),
      onmousedown: (e: MouseEvent) => mouseDown(Pitch.G, e),
    }),
    ...pitches
      .map((n) => [n, pitchToHeight(n)] as [Pitch, number])
      .map(([note, boxY]) =>
        m('rect', {
          x,
          y: y + settings.lineGap * boxY - settings.lineGap / 2,
          width,
          height,
          opacity: 0,
          [over]: (e: MouseEvent) => mouseOver(note, e),
          onmousedown: (e: MouseEvent) => mouseDown(note, e),
        })
      ),
  ]);
}
