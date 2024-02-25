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
import { ITimeSignature } from '.';
import { Dispatch } from '../Dispatch';
import { editTimeSignature } from '../Events/Bar';
import { settings } from '../global/settings';
import { timeSignatureEditDialog } from './edit';

interface TimeSignatureProps {
  x: number;
  y: number;
  dispatch: Dispatch;
}

function drawCommonTime(x: number, y: number, onclick: () => void) {
  // https://upload.wikimedia.org/wikipedia/commons/a/ab/Music-commontime.svg
  const scale = 0.0083 * settings.lineHeightOf(5);
  const baseline = 100 * scale;
  return m(
    'g',
    {
      transform: `translate(${x - 29} ${
        y - baseline + settings.lineHeightOf(2)
      }) scale(${scale})`,
    },
    m('path', {
      fill: '#000',
      'stroke-width': 0,
      onclick,
      d: 'm 118.5,90.4 c 0,-5.5 -5.2,-14.3 -19.1,-14.3 -10.3,0 -20.5,12.4 -20.5,23.2 0,13.816478 7.8,25.8 21,25.8 14.9,0 18.7,-12.4 18.7,-18.5 -0.5,0 -1.2,0 -1.7,0 -0.8,5.2 -5.8,15.5 -14.4,15.5 -9.3,0 -11.7,-8.3 -11.7,-21.7 0,-16.9 5.5,-21.3 12.2,-21.3 5.3,0 8.1,2.8 8.6,3.5 0.2,0.4 0.3,0.9 -0.1,1.3 -4,0 -8.7,2.8 -8.7,8.4 0,3.4 2.4,7.2 7.5,7.2 3.9,0 8.1,-3 8.1,-9 z',
    })
  );
}

export function drawTimeSignature(
  ts: ITimeSignature,
  props: TimeSignatureProps
): m.Children {
  const edit = () => props.dispatch(editTimeSignature(ts));

  if (ts.cutTime() || ts.commonTime()) {
    const cutLineX = props.x;
    return m('g[class=time-signature]', [
      drawCommonTime(props.x, props.y, edit),
      ts.cutTime()
        ? m('line', {
            x1: cutLineX,
            x2: cutLineX,
            y1: props.y + settings.lineHeightOf(0.7),
            y2: props.y + settings.lineHeightOf(3.3),
            stroke: 'black',
            'stroke-width': 1,
            'shape-rendering': 'crispEdges',
          })
        : null,
    ]);
  }

  const y = props.y + settings.lineHeightOf(2);
  return m('g[class=time-signature]', [
    m(
      'text',
      {
        'text-anchor': 'middle',
        x: props.x,
        y,
        style: 'font-family: serif; font-weight: bold; cursor: pointer;',
        'font-size': ts.fontSize(),
        onclick: edit,
      },
      ts.top().toString()
    ),
    m(
      'text',
      {
        'text-anchor': 'middle',
        x: props.x,
        y: y + settings.lineHeightOf(2),
        style: 'font-family: serif; font-weight: bold; cursor: pointer;',
        'font-size': ts.fontSize(),
        onclick: edit,
      },
      ts.bottom().toString()
    ),
  ]);
}
