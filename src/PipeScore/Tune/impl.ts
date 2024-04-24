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

import { ITune } from '.';
import { SavedTune } from '../SavedModel';
import { IStave } from '../Stave';
import { Stave } from '../Stave/impl';
import { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { Relative } from '../global/relativeLocation';
import { first, foreach, last } from '../global/utils';

export class Tune extends ITune {
  private _staves: IStave[];

  constructor(staves: IStave[]) {
    super();
    this._staves = staves;
  }

  static create(
    timeSignature: ITimeSignature,
    numberOfParts: number,
    repeatParts: boolean
  ): ITune {
    const staves = foreach(2 * numberOfParts, () => Stave.create(timeSignature));
    for (let i = 0; i < staves.length; i++) {
      if (repeatParts) {
        i % 2 === 0 ? staves[i].repeatFirst() : staves[i].repeatLast();
      } else {
        i % 2 === 0 ? staves[i].partFirst() : staves[i].partLast();
      }
    }

    return new Tune(staves);
  }

  static fromJSON(tune: SavedTune) {
    return new Tune(tune._staves.map(Stave.fromJSON));
  }

  toJSON(): SavedTune {
    return {
      _staves: this._staves.map((stave) => stave.toJSON()),
    };
  }

  tuneGap() {
    return 100;
  }

  staves() {
    return this._staves;
  }

  timeSignature(): ITimeSignature {
    return this.staves()[0].bars()[0].timeSignature();
  }

  addStave(nearStave: IStave | null, where: Relative) {
    // If no stave is selected, place before the first stave
    // or after the last stave
    const adjacentStave =
      nearStave ||
      (where === Relative.before ? first(this.staves()) : last(this.staves()));

    const index = adjacentStave
      ? this.staves().indexOf(adjacentStave) + (where === Relative.before ? 0 : 1)
      : 0;

    if (index < 0) return;

    const adjacentBar =
      where === Relative.before
        ? adjacentStave?.firstBar()
        : adjacentStave?.lastBar();
    const ts = adjacentBar?.timeSignature() || new TimeSignature();

    const newStave = Stave.create(ts);
    if (where === Relative.before) {
      newStave.setGap(adjacentStave?.gap() || 'auto');
      adjacentStave?.setGap('auto');
    }
    this._staves.splice(index, 0, newStave);
  }

  deleteStave(stave: IStave) {
    const ind = this._staves.indexOf(stave);
    if (ind !== -1) {
      this._staves.splice(ind, 1);
    }
    // If there used to be a gap before this stave, preserve it
    // (when the next stave doesn't have a custom gap)
    if (
      stave.gap() !== 'auto' &&
      this._staves[ind] &&
      this._staves[ind].gap() === 'auto'
    ) {
      this._staves[ind].setGap(stave.gap());
    }
  }

  nextStave(stave: IStave) {
    const staves = this.staves();
    const stave_index = staves.indexOf(stave);
    const index = stave_index + 1;
    if (stave_index !== -1 && index < staves.length) {
      return staves[index];
    }
    return null;
  }

  previousStave(stave: IStave) {
    const staves = this.staves();
    const index = staves.indexOf(stave) - 1;
    if (index < 0) {
      return null;
    }
    return staves[index];
  }
}
