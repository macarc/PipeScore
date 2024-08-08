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
import { ITune } from '.';
import { Dispatch } from '../Dispatch';
import { editComposer, editTuneName, editTuneType } from '../Events/Tune';
import { drawStaticTextBox } from '../StaticTextBox/view';
import { timingHeight } from '../Timing/view';
import { settings } from '../global/settings';

export type TuneProps = {
  y: number;
  pageWidth: number;
  dispatch: Dispatch;
};

export function drawTuneHeading(tune: ITune, props: TuneProps) {
  const titleSize = 20;
  const otherSize = 15;

  const heightToWorkWith = tune.tuneGap() + settings.staveGap - timingHeight;

  const titleY = props.y + Math.max(heightToWorkWith / 2, titleSize);
  const otherY = props.y + heightToWorkWith - otherSize / 2;

  return m('g.tune', [
    drawStaticTextBox(
      tune.name(),
      props.pageWidth / 2,
      titleY,
      titleSize,
      'sans-serif',
      'middle',
      () => props.dispatch(editTuneName(tune))
    ),
    drawStaticTextBox(
      tune.tuneType(),
      settings.margin,
      otherY,
      otherSize,
      'sans-serif',
      'start',
      () => props.dispatch(editTuneType(tune))
    ),
    drawStaticTextBox(
      tune.composer(),
      props.pageWidth - settings.margin,
      otherY,
      otherSize,
      'sans-serif',
      'end',
      () => props.dispatch(editComposer(tune))
    ),
  ]);
}
