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

//  Helper to add hoverable documentation to any HTML element.
//  Actual documentation strings are stored in ../Documentation.

import type m from 'mithril';
import type { Dispatch } from '../Dispatch';
import { hoverDoc } from '../Events/Doc';
import type { Documentation } from '../Translations';

export function help(
  docName: keyof Documentation,
  element: m.Vnode,
  dispatch: Dispatch
): m.Vnode {
  const attrs = element.attrs as {
    onmouseover: (e: MouseEvent) => void;
    onmouseout: (e: MouseEvent) => void;
  };
  const initialMouseOver = attrs.onmouseover;
  const initialMouseOut = attrs.onmouseout;
  attrs.onmouseover = (e: MouseEvent) => {
    dispatch(hoverDoc(docName));
    if (initialMouseOver) initialMouseOver(e);
  };
  attrs.onmouseout = (e: MouseEvent) => {
    dispatch(hoverDoc(null));
    if (initialMouseOut) initialMouseOut(e);
  };
  return element;
}
