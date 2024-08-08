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

import { type Font, IMovableTextBox, IStaticTextBox } from '.';
import { Update } from '../Events/types';
import type { SavedMovableTextBox, SavedStaticTextBox } from '../SavedModel';

export class StaticTextBox extends IStaticTextBox {
  private _text: string;
  private _size: number;
  private _font: Font;

  constructor(text = '', size = 20, font: Font = 'sans-serif') {
    super();
    this._text = text;
    this._size = size;
    this._font = font;
  }

  static fromJSON(o: string | SavedStaticTextBox, defaultFontSize: number) {
    if (typeof o === 'string') {
      return new StaticTextBox(o, defaultFontSize);
    }
    return new StaticTextBox(o.text, o.size, o.font);
  }

  toJSON(): SavedStaticTextBox {
    return {
      text: this._text,
      font: this._font,
      size: this._size,
    };
  }

  text() {
    return this._text;
  }

  font() {
    return this._font;
  }

  fontSize() {
    return this._size;
  }

  set(text: string, size: number, font: Font): Update {
    if (text !== this._text || size !== this._size || font !== this._font) {
      this._text = text;
      this._size = size;
      this._font = font;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  }
}

export class MovableTextBox extends IMovableTextBox {
  private _centred: boolean;
  private _x: number;
  private _y: number;
  private _size: number;
  private _text: string;
  private _font: Font;
  private mouseXOffset = 0;
  private mouseYOffset = 0;

  constructor(text = '', centred = true, x = 0, y = 0, size = 20) {
    super();
    this._centred = centred;
    this._x = x ? x : Math.random() * 100;
    this._y = y ? y : Math.random() * 150;
    this._size = size;
    this._text = text;
    this._font = 'sans-serif';
  }

  static fromJSON(o: SavedMovableTextBox) {
    const tx = new MovableTextBox(o._text, o.centred, o.x, o.y, o.size);
    tx._font = o.font || 'sans-serif';
    return tx;
  }

  toJSON(): SavedMovableTextBox {
    return {
      x: this._x,
      y: this._y,
      size: this._size,
      _text: this._text,
      font: this._font,
      centred: this._centred,
    };
  }

  text() {
    return this._text;
  }

  font() {
    return this._font;
  }

  fontSize() {
    return this._size;
  }

  setCursorDragOffset(mouseX: number, mouseY: number) {
    this.mouseXOffset = this._x - mouseX;
    this.mouseYOffset = this._y - mouseY;
  }

  set(text: string, size: number, font: Font) {
    if (text !== this._text || size !== this._size || font !== this._font) {
      this._text = text;
      this._size = size;
      this._font = font;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  }

  toggleCentre() {
    this._centred = !this._centred;
  }

  centred() {
    return this._centred;
  }

  adjustAfterOrientation(newWidth: number, newHeight: number) {
    this._x = (this._x / newHeight) * newWidth;
    this._y = (this._y / newHeight) * newWidth;
  }

  setCoords(x: number, y: number) {
    this._x = x + this.mouseXOffset;
    this._y = y + this.mouseYOffset;
    this._centred = false;
  }

  x() {
    return this._x;
  }

  setX(x: number) {
    this._centred = false;
    this._x = x;
  }

  y() {
    return this._y;
  }

  setY(y: number) {
    this._y = y;
  }
}
