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
import { Barline } from '.';
import { Dispatch } from '../Dispatch';
import { clickBarline } from '../Events/Bar';
import { stavelineThickness } from '../Stave/view';
import { settings } from '../global/settings';

interface BarlineProps {
  x: number;
  y: number;
  // atStart : is the barline at the start of the bar or not?
  atStart: boolean;
  drag: (x: number) => void;
  dispatch: Dispatch;
}

const lineOffset = 6;
const thickLineWidth = 3;
const dragWidth = 2;

function height() {
  return settings.lineHeightOf(4);
}

function drawNormal({ x, y, drag, dispatch }: BarlineProps) {
  return m('g', [
    m('line', {
      x1: x,
      x2: x,
      y1: y - stavelineThickness / 2,
      y2: y + height() + stavelineThickness / 2,
      stroke: 'black',
    }),
    m('rect', {
      x: x - dragWidth,
      y: y - stavelineThickness / 2,
      width: 2 * dragWidth,
      height: height() + stavelineThickness,
      opacity: 0,
      style: 'cursor: ew-resize',
      onmousedown: () => dispatch(clickBarline(drag)),
    }),
  ]);
}

function drawRepeat(props: BarlineProps) {
  const { x, y, atStart } = props;
  const circleXOffset = 10;
  const topCircleY = y + settings.lineHeightOf(1.5);
  const bottomCircleY = y + settings.lineHeightOf(2.5);
  const circleRadius = 2;
  const cx = atStart ? x + circleXOffset : x - circleXOffset;
  return m('g[class=barline-repeat]', [
    drawPart(props),
    m('circle', {
      cx,
      cy: topCircleY,
      r: circleRadius,
      fill: 'black',
    }),
    m('circle', {
      cx,
      cy: bottomCircleY,
      r: circleRadius,
      fill: 'black',
    }),
  ]);
}

function drawPart({ x, y, atStart, drag, dispatch }: BarlineProps) {
  const thickX = atStart ? x : x - thickLineWidth / 2;
  const thinX = atStart ? x + lineOffset : x - lineOffset;
  return m('g[class=barline-end]', [
    m('rect', {
      x: thickX,
      y: y - stavelineThickness / 2,
      width: thickLineWidth,
      height: height() + stavelineThickness,
      fill: 'black',
      style: 'cursor: ew-resize',
      onmousedown: () => dispatch(clickBarline(drag)),
    }),
    m('line', {
      x1: thinX,
      x2: thinX,
      y1: y - stavelineThickness / 2,
      y2: y + height() + stavelineThickness / 2,
      stroke: 'black',
    }),
  ]);
}

export function drawBarline(barline: Barline, props: BarlineProps) {
  switch (barline) {
    case Barline.normal:
      return drawNormal(props);
    case Barline.repeat:
      return drawRepeat(props);
    case Barline.part:
      return drawPart(props);
    default:
      console.log(barline);
      throw new Error('Unrecognised barline');
  }
}

export function barlineWidth(barline: Barline) {
  switch (barline) {
    case Barline.normal:
      return 1;
    case Barline.repeat:
    case Barline.part:
      return 10;
    default:
      console.log(barline);
      throw new Error('Unrecognised barline');
  }
}
