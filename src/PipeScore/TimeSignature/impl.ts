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

import { ITimeSignature, TimeSignatureType } from '.';
import { SavedTimeSignature } from '../SavedModel';
import { settings } from '../global/settings';

export class TimeSignature extends ITimeSignature {
  private ts: TimeSignatureType;
  private breaks: number[];

  constructor(ts?: TimeSignatureType, breaks: number[] = []) {
    super();
    this.ts = [2, 4];
    if (ts) this.ts = ts;
    this.breaks = breaks;
  }

  static fromJSON(o: SavedTimeSignature) {
    return new TimeSignature(o.ts, o.breaks);
  }

  toJSON(): SavedTimeSignature {
    return { ts: this.ts, breaks: this.breaks };
  }

  copy() {
    return new TimeSignature(this.ts, [...this.breaks]);
  }

  width() {
    return 20;
  }

  fontSize() {
    return settings.lineHeightOf(2.7);
  }

  breaksString() {
    return this.breaks.toString();
  }

  numberOfBeats(): number {
    // The number of beats per bar
    switch (this.bottom()) {
      case 2:
        return 2;
      case 4:
        return this.top();
      case 8:
        return Math.ceil(this.top() / 3);
    }
  }

  crotchetsPerBeat() {
    switch (this.bottom()) {
      case 2:
        return 2;
      case 4:
        return 1;
      case 8:
        return 1.5;
    }
  }

  // The number of beats in a group
  // Where n means the nth group in the bar

  beatDivision(): (n: number) => number {
    return (i: number) => {
      if (i < this.breaks.length) {
        return this.breaks[i] / 2.0;
      }
      switch (this.bottom()) {
        case 2:
          return 2;
        case 4:
          return 1;
        case 8:
          return 1.5;
      }
    };
  }

  equals(ts: TimeSignature) {
    // Check if two time signatures are equal

    return this.top() === ts.top() && this.bottom() === ts.bottom();
  }

  cutTime() {
    return this.ts === 'cut time';
  }

  commonTime() {
    return this.ts === 'common time';
  }

  top() {
    switch (this.ts) {
      case 'cut time':
        return 2;
      case 'common time':
        return 4;
      default:
        return this.ts[0];
    }
  }

  bottom() {
    switch (this.ts) {
      case 'cut time':
        return 2;
      case 'common time':
        return 4;
      default:
        return this.ts[1];
    }
  }
}
