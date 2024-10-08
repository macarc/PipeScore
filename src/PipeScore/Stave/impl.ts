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
import type { IBar } from '../Bar';
import { Barline } from '../Barline';
import { type IMeasure, previousBar, previousNote } from '../Measure';
import { Measure } from '../Measure/impl';
import type { INote } from '../Note';
import type { SavedStave } from '../SavedModel';
import type { ITimeSignature } from '../TimeSignature';
import type { ID } from '../global/id';
import { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { first, last, nlast } from '../global/utils';

export class Stave extends IStave {
  private _measures: IMeasure[];
  // NOTE : this must be kept in sync with its child measures
  //        by calling propagateNumberOfPartsToMeasures()
  private _numberOfParts = 1;

  private constructor(measures: IMeasure[]) {
    super();
    this._measures = measures;
  }

  static empty() {
    return new Stave([]);
  }

  static create(timeSignature: ITimeSignature) {
    return new Stave([
      new Measure(timeSignature),
      new Measure(timeSignature),
      new Measure(timeSignature),
      new Measure(timeSignature),
    ]);
  }

  static fromJSON(o: SavedStave) {
    const st = Stave.empty();
    st._measures = o.bars.map(Measure.fromJSON);
    st._numberOfParts = o.numberOfParts || 1;
    st.propagateNumberOfPartsToMeasures();
    return st;
  }

  toJSON(): SavedStave {
    return {
      numberOfParts: this._numberOfParts,
      bars: this._measures.map((bar) => bar.toJSON()),
    };
  }

  height() {
    const firstStaveHeight = settings.lineHeightOf(4) + settings.staveGap;
    return (
      firstStaveHeight + (this._numberOfParts - 1) * settings.harmonyStaveHeight()
    );
  }

  numberOfHarmonyParts(): number {
    return this._numberOfParts;
  }

  addHarmony(): void {
    this._numberOfParts += 1;
    this.propagateNumberOfPartsToMeasures();
  }

  removeHarmony(): void {
    this._numberOfParts -= 1;
    this.propagateNumberOfPartsToMeasures();
  }

  propagateNumberOfPartsToMeasures() {
    for (const measure of this._measures) {
      measure.setNumberOfParts(this._numberOfParts);
    }
  }

  numberOfMeasures() {
    return this._measures.length;
  }

  prependMeasure(measure: IMeasure) {
    this._measures.unshift(measure);
    measure.fixedWidth = 'auto';
    this._numberOfParts += Math.max(0, measure.bars().length - this._numberOfParts);
    this.propagateNumberOfPartsToMeasures();
  }

  appendMeasure(measure: IMeasure) {
    this._measures.push(measure);
    measure.fixedWidth = 'auto';
    this._numberOfParts += Math.max(0, measure.bars().length - this._numberOfParts);
    this.propagateNumberOfPartsToMeasures();
  }

  deleteMeasure(measure: IMeasure) {
    const index = this._measures.indexOf(measure);
    this._measures.splice(index, 1);
    if (index === this._measures.length && this._measures.length > 0)
      nlast(this._measures).fixedWidth = 'auto';
  }

  containsID(id: ID) {
    for (const measure of this.measures()) {
      if (measure.containsID(id)) {
        return true;
      }
    }
    return false;
  }

  firstMeasure() {
    return first(this._measures);
  }

  lastMeasure() {
    return last(this._measures);
  }

  measures() {
    return this._measures;
  }

  previousNote(id: ID): INote | null {
    return previousNote(id, this.measures());
  }

  previousBar(bar: IBar): IBar | null {
    return previousBar(bar.id, this._measures);
  }

  partFirst() {
    this.firstMeasure()?.setBarline('start', Barline.part);
  }

  partLast() {
    this.lastMeasure()?.setBarline('end', Barline.part);
  }

  repeatFirst() {
    this.firstMeasure()?.setBarline('start', Barline.repeat);
  }

  repeatLast() {
    this.lastMeasure()?.setBarline('end', Barline.repeat);
  }

  insertMeasure(relativeTo: IMeasure, where: Relative, anacrusis: boolean) {
    const measureIndex = this._measures.indexOf(relativeTo);
    const ind = where === Relative.before ? measureIndex : measureIndex + 1;
    this._measures.splice(
      ind,
      0,
      new Measure(relativeTo.timeSignature(), anacrusis, this._numberOfParts)
    );
  }
}
