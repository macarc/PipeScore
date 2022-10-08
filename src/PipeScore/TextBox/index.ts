//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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
import { dispatch } from '../Controller';
import { Update } from '../Events/common';
import { changeText, clickText } from '../Events/Text';
import dialogueBox from '../global/dialogueBox';
import { Obj, svgCoords } from '../global/utils';
import { Selection, TextSelection } from '../Selection';

interface TextBoxProps {
  scoreWidth: number;
  selection: Selection | null;
}
export class TextBox {
  private centred: boolean;
  private x: number;
  private y: number;
  private mouseXOffset = 0;
  private mouseYOffset = 0;
  private size: number;
  private _text: string;

  constructor(text = '', centred = true, x = 0, y = 0, size = 20) {
    this.centred = centred;
    this.x = x ? x : Math.random() * 100;
    this.y = y ? y : Math.random() * 150;
    this.size = size;
    this._text = text;
  }
  static fromJSON(o: Obj) {
    const tx = new TextBox(o.name);
    tx.x = o.x;
    tx.y = o.y;
    tx.size = o.size;
    tx._text = o._text;
    tx.centred = o.centred;
    return tx;
  }
  toJSON() {
    return {
      x: this.x,
      y: this.y,
      size: this.size,
      _text: this._text,
      centred: this.centred,
    };
  }
  text() {
    return this._text;
  }
  setCursorDragOffset(mouseX: number, mouseY: number) {
    this.mouseXOffset = this.x - mouseX;
    this.mouseYOffset = this.y - mouseY;
  }
  set(text: string, size: number) {
    if (text !== this._text || size !== this.size) {
      this._text = text;
      this.size = size;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  }
  toggleCentre() {
    this.centred = !this.centred;
  }
  adjustAfterOrientation(newWidth: number, newHeight: number) {
    this.x = (this.x / newHeight) * newWidth;
    this.y = (this.y / newHeight) * newWidth;
  }
  setCoords(x: number, y: number) {
    this.x = x + this.mouseXOffset;
    this.y = y + this.mouseYOffset;
    this.centred = false;
  }

  private async edit() {
    const form = await dialogueBox([
      m('label', ['Text:', m('input', { type: 'text', value: this._text })]),
      m('label', [
        'Font size:',
        m('input', {
          type: 'number',
          min: 5,
          max: 50,
          value: this.size,
        }),
      ]),
    ]);
    if (form) {
      const size = parseInt(
        (form.querySelector('input[type="number"]') as HTMLInputElement).value
      );
      const text = (
        form.querySelector('input[type="text"]') as HTMLInputElement
      ).value;
      dispatch(changeText(text, size, this));
    }
  }

  render(props: TextBoxProps): m.Children {
    if (this.centred) this.x = props.scoreWidth / 2;
    const selected =
      props.selection instanceof TextSelection && props.selection.text === this;
    return m(
      'text',
      {
        x: this.x,
        y: this.y,
        style: `font-size: ${this.size}px; cursor: pointer;`,
        'text-anchor': 'middle',
        fill: selected ? 'orange' : '',
        ondblclick: () => this.edit(),
        onmousedown: (e: Event) => {
          const pt = svgCoords(e as MouseEvent);
          if (pt) this.setCursorDragOffset(pt.x, pt.y);
          return dispatch(clickText(this));
        },
      },
      this._text || 'Double Click to Edit'
    );
  }
}
