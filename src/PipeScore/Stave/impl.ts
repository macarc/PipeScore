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

import { IStave } from '.';
import { type IBar, previousNote } from '../Bar';
import { Bar } from '../Bar/impl';
import { Barline } from '../Barline';
import type { INote } from '../Note';
import type { SavedStave } from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import type { ID } from '../global/id';
import { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { first, last, nlast } from '../global/utils';

export class Stave extends IStave {
  private _bars: IBar[];
  // TODO : propagate this to bars
  private _numberOfParts = 2;

  private constructor(bars: IBar[]) {
    super();
    this._bars = bars;
  }

  static empty() {
    return new Stave([]);
  }

  static create(timeSignature: ITimeSignature) {
    return new Stave([
      new Bar(timeSignature),
      new Bar(timeSignature),
      new Bar(timeSignature),
      new Bar(timeSignature),
    ]);
  }

  static fromJSON(o: SavedStave) {
    const st = Stave.empty();
    st._bars = o.bars.map(Bar.fromJSON);
    return st;
  }

  toJSON(): SavedStave {
    return {
      bars: this._bars.map((bar) => bar.toJSON()),
    };
  }

  height() {
    const firstStaveHeight = settings.lineHeightOf(4) + settings.staveGap;
    return firstStaveHeight + (this._numberOfParts - 1) * settings.harmonyStaveHeight();
  }

  numberOfParts(): number {
    return this._numberOfParts;
  }

  numberOfBars() {
    return this._bars.length;
  }

  insertBar(bar: IBar) {
    this._bars.unshift(bar);
    bar.fixedWidth = 'auto';
  }

  appendBar(bar: IBar) {
    this._bars.push(bar);
    bar.fixedWidth = 'auto';
  }

  deleteBar(bar: IBar) {
    const index = this._bars.indexOf(bar);
    this._bars.splice(index, 1);
    if (index === this._bars.length && this._bars.length > 0)
      nlast(this._bars).fixedWidth = 'auto';
  }

  includesID(id: ID) {
    for (const bar of this.bars()) {
      if (bar.hasID(id) || bar.includesNote(id)) {
        return true;
      }
    }
    return false;
  }

  firstBar() {
    return first(this._bars);
  }

  lastBar() {
    return last(this._bars);
  }

  bars() {
    return this._bars;
  }

  previousNote(id: ID): INote | null {
    return previousNote(id, this.bars());
  }

  previousBar(bar: IBar): IBar | null {
    return this._bars[this._bars.indexOf(bar) - 1] || null;
  }

  partFirst() {
    this.firstBar()?.setBarline('start', Barline.part);
  }

  partLast() {
    this.lastBar()?.setBarline('end', Barline.part);
  }

  repeatFirst() {
    this.firstBar()?.setBarline('start', Barline.repeat);
  }

  repeatLast() {
    this.lastBar()?.setBarline('end', Barline.repeat);
  }

  replaceBar(newBar: IBar, oldBar: IBar, where: Relative) {
    const barInd = this._bars.indexOf(oldBar);
    const ind = where === Relative.before ? barInd : barInd + 1;
    this._bars.splice(ind, 0, newBar);
  }

  play(previous: Stave | null) {
    return this._bars.flatMap((b, i) =>
      b.play(i === 0 ? previous?.lastBar() || null : this._bars[i - 1])
    );
  }
}
