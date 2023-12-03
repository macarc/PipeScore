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
import { clamp } from './utils';

export class Settings {
  staveGap = Settings.defaultStaveGap;
  lineGap = 7;
  margin = 80;
  pageLongSideLength = 297 * 5;
  pageShortSideLength = 210 * 5;
  gapAfterGracenote = 7;
  bpm = 80;

  static defaultStaveGap = 65;

  fromJSON(o: SavedSettings) {
    this.staveGap = o.staveGap;
    this.lineGap = o.lineGap;
    this.margin = o.margin;
    this.bpm = o.bpm || 80;
    this.gapAfterGracenote = o.gapAfterGracenote || 7;
  }
  toJSON(): SavedSettings {
    return {
      staveGap: this.staveGap,
      lineGap: this.lineGap,
      margin: this.margin,
      bpm: this.bpm,
      gapAfterGracenote: this.gapAfterGracenote,
    };
  }
  validate<T extends keyof Settings>(key: T, value: number) {
    switch (key) {
      case 'staveGap':
        return Math.max(value, this.lineHeightOf(5));
      case 'lineGap':
        return Math.max(value, 1);
      case 'margin':
        return clamp(value, 0, 300);
      default:
        return false;
    }
  }
  lineHeightOf(n: number) {
    return n * this.lineGap;
  }
}

export const settings = new Settings();
