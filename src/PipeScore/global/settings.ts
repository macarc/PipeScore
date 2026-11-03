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

// Page dimensions, in mm
const paperSizes = {
  A4: { longSide: 297, shortSide: 210 },
  Letter: { longSide: 279.4, shortSide: 215.9 },
};

export type PaperSize = keyof typeof paperSizes;

const defaultPaperSize: PaperSize = 'A4';

function parsePaperSize(paperSize: string | undefined): PaperSize | null {
  return paperSize && Object.prototype.hasOwnProperty.call(paperSizes, paperSize)
    ? (paperSize as PaperSize)
    : null;
}

// Number of score units per mm
const unitsPerMm = 5;

export const TITLE_SIZE = 20;
export const SUBTITLE_SIZE = 15;
export const TITLE_FONT = 'sans-serif';

export class Settings {
  staveGap = Settings.defaultStaveGap;
  harmonyGap = Settings.defaultHarmonyGap;
  harmonyVolume = Settings.defaultHarmonyVolume;
  lineGap = 7;
  margin = 80;
  paperSize: PaperSize = defaultPaperSize;
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
    this.paperSize = parsePaperSize(o.paperSize) || defaultPaperSize;
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
      paperSize: this.paperSize,
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
  get pageLongSideLength() {
    return this.pageLongSidePrintLength() * unitsPerMm;
  }
  get pageShortSideLength() {
    return this.pageShortSidePrintLength() * unitsPerMm;
  }
  pageLongSidePrintLength() {
    return paperSizes[this.paperSize].longSide;
  }
  pageShortSidePrintLength() {
    return paperSizes[this.paperSize].shortSide;
  }
  harmonyStaveHeight() {
    return this.lineHeightOf(4) + this.harmonyGap;
  }
}

export const settings = new Settings();
