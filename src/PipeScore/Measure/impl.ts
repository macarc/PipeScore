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

import { IMeasure } from '.';
import type { IBar } from '../Bar';
import { Bar } from '../Bar/impl';
import { Barline } from '../Barline';
import { noteFromJSON } from '../Note/impl';
import {
  type DeprecatedSavedMeasure,
  type SavedMeasure,
  isDeprecatedSavedMeasure,
} from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import type { ID } from '../global/id';

export class Measure extends IMeasure {
  fixedWidth: number | 'auto' = 'auto';

  private ts: ITimeSignature;
  private _bars: IBar[];
  private frontBarline: Barline;
  private backBarline: Barline;
  private _isAnacrusis: boolean;

  constructor(
    timeSignature: ITimeSignature | undefined,
    isAnacrusis = false,
    numberOfParts = 1
  ) {
    super();
    this.ts = (timeSignature || new TimeSignature()).copy();
    this._bars = [];
    this._isAnacrusis = isAnacrusis;
    this.frontBarline = Barline.normal;
    this.backBarline = Barline.normal;

    for (let i = 0; i < numberOfParts; i++) {
      this._bars.push(new Bar(this));
    }
  }

  static fromJSON(o: SavedMeasure | DeprecatedSavedMeasure) {
    const m = new Measure(TimeSignature.fromJSON(o.timeSignature), o.isAnacrusis);
    m.fixedWidth = o.width === undefined ? 'auto' : o.width;
    m.backBarline = Barline.fromJSON(o.backBarline);
    m.frontBarline = Barline.fromJSON(o.frontBarline);

    if (isDeprecatedSavedMeasure(o)) {
      m._bars = [Bar.withNotes(m, o.notes.map(noteFromJSON))];
      m._bars[0].id = o.id;
    } else {
      m._bars = o.bars.map((bar) => Bar.fromJSON(bar, m));
    }

    return m;
  }

  toJSON(): SavedMeasure {
    return {
      isAnacrusis: this._isAnacrusis,
      bars: this._bars.map((bar) => bar.toJSON()),
      backBarline: this.backBarline.toJSON(),
      frontBarline: this.frontBarline.toJSON(),
      timeSignature: this.ts.toJSON(),
      width: this.fixedWidth,
    };
  }

  containsID(id: ID): boolean {
    return this.bars().some((bar) => bar.hasID(id) || bar.containsNoteWithID(id));
  }

  isAnacrusis(): boolean {
    return this._isAnacrusis;
  }

  startBarline(): Barline {
    return this.frontBarline;
  }

  endBarline(): Barline {
    return this.backBarline;
  }

  setNumberOfParts(n: number): void {
    // Add more parts n > parts.length
    while (this._bars.length < n) {
      this._bars.push(new Bar(this));
    }
    // Remove parts if n < parts.length
    this._bars.splice(n);
  }

  bars(): IBar[] {
    return this._bars;
  }

  timeSignature() {
    return this.ts;
  }

  setTimeSignature(ts: ITimeSignature): void {
    this.ts = ts.copy();
  }

  adjustWidth(ratio: number) {
    this.fixedWidth = this.fixedWidth === 'auto' ? 'auto' : this.fixedWidth * ratio;
  }

  setBarline(position: 'start' | 'end', barline: Barline) {
    if (position === 'start') {
      this.frontBarline = barline;
    } else {
      this.backBarline = barline;
    }
  }
}
