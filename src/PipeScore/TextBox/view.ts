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
import { ITextBox } from '.';
import { Dispatch } from '../Dispatch';
import { clickText, editText } from '../Events/Text';
import { ISelection } from '../Selection';
import { TextSelection } from '../Selection/text';
import { svgCoords } from '../global/utils';

interface TextBoxProps {
  scoreWidth: number;
  selection: ISelection | null;
  dispatch: Dispatch;
}

export function drawTextBox(tx: ITextBox, props: TextBoxProps): m.Children {
  if (tx.centred()) tx.setX(props.scoreWidth / 2);
  const selected =
    props.selection instanceof TextSelection && props.selection.text === tx;
  return m(
    'text',
    {
      x: tx.x(),
      y: tx.y(),
      style: `font-size: ${tx.fontSize()}px; cursor: pointer; font-family: ${tx.font()};`,
      'text-anchor': 'middle',
      fill: selected ? 'orange' : '',
      ondblclick: () => props.dispatch(editText(tx)),
      onmousedown: (e: Event) => {
        const pt = svgCoords(e as MouseEvent);
        if (pt) tx.setCursorDragOffset(pt.x, pt.y);
        return props.dispatch(clickText(tx));
      },
    },
    tx.text() || 'Double Click to Edit'
  );
}
