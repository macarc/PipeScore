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

//  Barlines may be:
//  - normal (a single vertical line)
//  - repeat (a thick line with dots)
//  - end (a thick line only)

import type { SavedBarline } from '../SavedModel';

type BarlineType = 'normal' | 'repeat' | 'end';

/**
 * Bar lines.
 *
 * There are three Barline objects:
 * - Barline.normal
 * - Barline.repeat
 * - Barline.part
 *
 * To check what type of Barline you have, just check if the barline === one of those three
 */
export class Barline {
  private type: BarlineType;

  static normal = new Barline('normal');
  static repeat = new Barline('repeat');
  static part = new Barline('end'); // It's called end for "legacy reasons"

  private constructor(type: BarlineType) {
    this.type = type;
  }

  static fromJSON(o: SavedBarline): Barline {
    switch (o.type) {
      case 'normal':
        return Barline.normal;
      case 'repeat':
        return Barline.repeat;
      case 'end':
        return Barline.part;
      default:
        throw new Error(`Unrecognised barline type ${o.type}`);
    }
  }

  toJSON(): SavedBarline {
    return { type: this.type };
  }

  // Repeat and end barlines must be drawn. Normal barlines may
  // be skipped, e.g. if the previous bar ended in a normal barline,
  // there's no need to draw another normal barline at the start of this bar
  mustDraw() {
    return this.type === 'repeat' || this.type === 'end';
  }

  isRepeat() {
    return this.type === 'repeat';
  }
}
