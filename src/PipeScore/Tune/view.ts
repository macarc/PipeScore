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
import type { ITune } from '.';
import type { Dispatch } from '../Dispatch';
import { drawStaticTextBox } from '../TextBox/view';
import { timingHeight } from '../Timing/view';
import { settings } from '../global/settings';

export type TuneProps = {
  y: number;
  pageWidth: number;
  dispatch: Dispatch;
};

export function drawTuneHeading(tune: ITune, props: TuneProps) {
  const heightToWorkWith = tune.tuneGap() + settings.staveGap - timingHeight;

  const titleY = props.y + Math.max(heightToWorkWith / 2, tune.name().fontSize());
  const composerY = props.y + heightToWorkWith - tune.composer().fontSize() / 2;
  const tuneTypeY = props.y + heightToWorkWith - tune.tuneType().fontSize() / 2;

  return m('g.tune', [
    drawStaticTextBox(tune.name(), {
      x: props.pageWidth / 2,
      y: titleY,
      anchor: 'middle',
      dispatch: props.dispatch,
    }),
    drawStaticTextBox(tune.tuneType(), {
      x: settings.margin,
      y: tuneTypeY,
      anchor: 'start',
      dispatch: props.dispatch,
    }),
    drawStaticTextBox(tune.composer(), {
      x: props.pageWidth - settings.margin,
      y: composerY,
      anchor: 'end',
      dispatch: props.dispatch,
    }),
  ]);
}
