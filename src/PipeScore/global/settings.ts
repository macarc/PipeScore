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

import type { SavedSettings } from '../SavedModel';
import { Instrument, instrumentToString, parseInstrument } from './instrument';
import { clamp } from './utils';

const a4LongSide = 297; // in mm
const a4ShortSide = 210; // in mm

export class Settings {
  staveGap = Settings.defaultStaveGap;
  harmonyGap = Settings.defaultHarmonyGap;
  harmonyVolume = Settings.defaultHarmonyVolume;
  lineGap = 7;
  margin = 80;
  pageLongSideLength = a4LongSide * 5;
  pageShortSideLength = a4ShortSide * 5;
  gapAfterGracenote = 7;
  bpm = 80;
  instrument = Instrument.GHB;

  static defaultStaveGap = 65;
  static defaultHarmonyGap = 50;
  static defaultTuneGap = 100;
  static defaultHarmonyVolume = 0.5;

  fromJSON(o: SavedSettings) {
    this.staveGap = o.staveGap;
    this.lineGap = o.lineGap;
    this.margin = o.margin;
    this.harmonyGap = o.harmonyGap || Settings.defaultHarmonyGap;
    this.bpm = o.bpm || 80;
    this.gapAfterGracenote = o.gapAfterGracenote || 7;
    this.harmonyVolume = o.harmonyVolume || Settings.defaultHarmonyVolume;
    this.instrument = parseInstrument(o.instrument) || Instrument.GHB;
  }
  toJSON(): SavedSettings {
    return {
      staveGap: this.staveGap,
      lineGap: this.lineGap,
      harmonyGap: this.harmonyGap,
      margin: this.margin,
      bpm: this.bpm,
      gapAfterGracenote: this.gapAfterGracenote,
      harmonyVolume: this.harmonyVolume,
      instrument: instrumentToString(this.instrument),
    };
  }
  validate<T extends keyof Settings>(key: T, value: number) {
    switch (key) {
      case 'staveGap':
        return Math.max(value, this.lineHeightOf(5));
      case 'lineGap':
        return Math.max(value, 1);
      case 'harmonyGap':
        return Math.max(value, this.lineHeightOf(5));
      case 'margin':
        return clamp(value, 0, 300);
      default:
        return false;
    }
  }
  lineHeightOf(n: number) {
    return n * this.lineGap;
  }
  pageLongSidePrintLength() {
    return a4LongSide;
  }
  pageShortSidePrintLength() {
    return a4ShortSide;
  }
  harmonyStaveHeight() {
    return this.lineHeightOf(4) + this.harmonyGap;
  }
}

export const settings = new Settings();
