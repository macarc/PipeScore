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

//  Document settings singleton.

import { SavedSettings } from '../SavedModel';

export class Settings {
  staveGap = 100;
  lineGap = 7;
  margin = 80;
  topOffset = 200;
  pageLongSideLength = 297 * 5;
  pageShortSideLength = 210 * 5;
  bpm = 80;

  fromJSON(o: SavedSettings) {
    this.staveGap = o.staveGap;
    this.lineGap = o.lineGap;
    this.margin = o.margin;
    this.topOffset = o.topOffset;
    this.bpm = o.bpm || 80;
  }
  toJSON(): SavedSettings {
    return {
      staveGap: this.staveGap,
      lineGap: this.lineGap,
      margin: this.margin,
      topOffset: this.topOffset,
      bpm: this.bpm
    };
  }
  validate<T extends keyof Settings>(key: T, value: number) {
    switch (key) {
      case 'staveGap':
        return Math.max(value, this.lineHeightOf(5));
      case 'lineGap':
        return Math.max(value, 1);
      case 'margin':
        return Math.max(Math.min(value, 300), 0);
      case 'topOffset':
        return Math.max(Math.min(value, 500), 0);
      default:
        return false;
    }
  }
  lineHeightOf(n: number) {
    return n * this.lineGap;
  }
}

export const settings = new Settings();
