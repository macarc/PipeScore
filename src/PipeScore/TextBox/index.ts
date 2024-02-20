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
import { dispatch } from '../Controller';
import { clickText, editText } from '../Events/Text';
import { Update } from '../Events/common';
import { SavedTextBox } from '../SavedModel';
import { Selection, TextSelection } from '../Selection';
import dialogueBox from '../global/dialogueBox';
import { svgCoords } from '../global/utils';

interface TextBoxProps {
  scoreWidth: number;
  selection: Selection | null;
}

type Font = 'serif' | 'sans-serif';

export class TextBox {
  private centred: boolean;
  private _x: number;
  private _y: number;
  private mouseXOffset = 0;
  private mouseYOffset = 0;
  private size: number;
  private _text: string;
  private font: Font;

  constructor(text = '', centred = true, x = 0, y = 0, size = 20) {
    this.centred = centred;
    this._x = x ? x : Math.random() * 100;
    this._y = y ? y : Math.random() * 150;
    this.size = size;
    this._text = text;
    this.font = 'sans-serif';
  }
  static fromJSON(o: SavedTextBox) {
    const tx = new TextBox(o._text, o.centred, o.x, o.y, o.size);
    tx.font = o.font || 'sans-serif';
    return tx;
  }
  toJSON(): SavedTextBox {
    return {
      x: this._x,
      y: this._y,
      size: this.size,
      _text: this._text,
      font: this.font,
      centred: this.centred,
    };
  }
  text() {
    return this._text;
  }
  setCursorDragOffset(mouseX: number, mouseY: number) {
    this.mouseXOffset = this._x - mouseX;
    this.mouseYOffset = this._y - mouseY;
  }
  set(text: string, size: number, font: Font) {
    if (text !== this._text || size !== this.size || font !== this.font) {
      this._text = text;
      this.size = size;
      this.font = font;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  }
  toggleCentre() {
    this.centred = !this.centred;
  }
  adjustAfterOrientation(newWidth: number, newHeight: number) {
    this._x = (this._x / newHeight) * newWidth;
    this._y = (this._y / newHeight) * newWidth;
  }
  setCoords(x: number, y: number) {
    this._x = x + this.mouseXOffset;
    this._y = y + this.mouseYOffset;
    this.centred = false;
  }
  x() {
    return this._x;
  }
  setX(x: number) {
    this.centred = false;
    this._x = x;
  }
  y() {
    return this._y;
  }
  setY(y: number) {
    this._y = y;
  }

  public async edit() {
    const form = await dialogueBox('Edit Text Box', [
      m('section', [
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
        m('label', [
          'Font:',
          m('select', [
            m(
              'option',
              {
                value: 'serif',
                style: 'font-family: serif;',
                selected: this.font === 'serif',
              },
              'Serif'
            ),
            m(
              'option',
              {
                value: 'sans-serif',
                style: 'font-family: sans-serif;',
                selected: this.font === 'sans-serif',
              },
              'Sans Serif'
            ),
          ]),
        ]),
      ]),
    ]);
    if (form) {
      const size = parseInt(
        (form.querySelector('input[type="number"]') as HTMLInputElement).value
      );
      const text = (
        form.querySelector('input[type="text"]') as HTMLInputElement
      ).value;

      const font = (form.querySelector('select') as HTMLSelectElement)
        .value as Font;
      return this.set(text, size, font);
    }
    return Update.NoChange;
  }

  render(props: TextBoxProps): m.Children {
    if (this.centred) this._x = props.scoreWidth / 2;
    const selected =
      props.selection instanceof TextSelection && props.selection.text === this;
    return m(
      'text',
      {
        x: this._x,
        y: this._y,
        style: `font-size: ${this.size}px; cursor: pointer; font-family: ${this.font};`,
        'text-anchor': 'middle',
        fill: selected ? 'orange' : '',
        ondblclick: () => dispatch(editText(this)),
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
