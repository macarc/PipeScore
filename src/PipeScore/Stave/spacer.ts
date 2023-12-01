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

//  A StaveSpacer is an editable gap between staves,
//  enabling multiple tunes in a score.

import { Stave } from './index';
import { dispatch } from '../Controller';
import { clickStaveSpacer } from '../Events/Stave';
import { SavedStaveSpacer } from '../SavedModel';
import { settings } from '../global/settings';
import m from 'mithril';

export function isStave(
  staveOrBreak: Stave | StaveSpacer
): staveOrBreak is Stave {
  return (staveOrBreak as Stave).bars !== undefined;
}

interface StaveSpacerProps {
  x: number;
  y: number;
  width: number;
  isSelected: boolean;
}

export class StaveSpacer {
  _height: number;

  static minHeight = 1;
  static maxHeight = 400;

  constructor(height = 100) {
    this._height = height;
  }

  height() {
    return this._height;
  }

  setHeight(height: number) {
    this._height = height;
  }

  toJSON(): SavedStaveSpacer {
    return {
      type: 'spacer',
      height: this._height,
    };
  }

  static fromJSON(o: SavedStaveSpacer) {
    return new StaveSpacer(o.height);
  }

  render(props: StaveSpacerProps) {
    const visualUpwardsAdjustment =
      (settings.staveGap - settings.lineHeightOf(4)) / 2;
    return m('g.spacer', [
      m('rect', {
        x: props.x,
        y: props.y - visualUpwardsAdjustment,
        width: props.width,
        height: this.height(),
        stroke: 'orange',
        'stroke-width': 10,
        fill: '#fff',
        opacity: props.isSelected ? 0.5 : 0,
        onmousedown: () => dispatch(clickStaveSpacer(this)),
      }),
    ]);
  }
}
