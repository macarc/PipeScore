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

import type { SavedTimeSignature } from '../SavedModel';

export type Denominator = 2 | 4 | 8;

export type TimeSignatureType = [number, Denominator] | 'cut time' | 'common time';

export function parseDenominator(text: string) {
  // Turns a string into a Denominator

  switch (text) {
    case '2':
      return 2;
    case '4':
      return 4;
    case '8':
      return 8;
    default:
      return null;
  }
}

export abstract class ITimeSignature {
  abstract toJSON(): SavedTimeSignature;
  abstract copy(): ITimeSignature;
  abstract width(): number;
  abstract fontSize(): number;
  abstract breaksString(): string;
  abstract numberOfBeats(): number;
  abstract crotchetsPerBeat(): number;
  // The number of beats in a group
  // Where n means the nth group in the bar
  abstract beatDivision(): (n: number) => number;
  abstract equals(ts: ITimeSignature): boolean;
  abstract cutTime(): boolean;
  abstract commonTime(): boolean;
  abstract top(): number;
  abstract bottom(): Denominator;
}
