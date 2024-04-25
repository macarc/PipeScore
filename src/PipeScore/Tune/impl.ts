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
import { IBar } from '../Bar';
import { SavedTune } from '../SavedModel';
import { IStave } from '../Stave';
import { Stave } from '../Stave/impl';
import { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { Relative } from '../global/relativeLocation';
import { Settings } from '../global/settings';
import { foreach, nfirst, nlast } from '../global/utils';

export class Tune extends ITune {
  private _staves: IStave[];
  private _tuneGap: number;
  private _name: string;
  private _tuneType: string;
  private _composer: string;

  constructor(
    name: string,
    composer: string,
    tuneType: string,
    staves: IStave[],
    gap = Settings.defaultTuneGap
  ) {
    super();
    this._staves = staves;
    this._tuneGap = gap;
    this._name = name;
    this._composer = composer;
    this._tuneType = tuneType;
  }

  static create(
    timeSignature: ITimeSignature,
    numberOfParts: number,
    repeatParts: boolean,
    name = 'My Tune',
    composer = 'Composer',
    tuneType = 'March'
  ): ITune {
    const staves = foreach(2 * numberOfParts, () => Stave.create(timeSignature));
    for (let i = 0; i < staves.length; i++) {
      if (repeatParts) {
        i % 2 === 0 ? staves[i].repeatFirst() : staves[i].repeatLast();
      } else {
        i % 2 === 0 ? staves[i].partFirst() : staves[i].partLast();
      }
    }

    return new Tune(name, composer, tuneType, staves);
  }

  static fromJSON(tune: SavedTune) {
    return new Tune(
      tune.name,
      tune.composer,
      tune.tuneType,
      tune.staves.map(Stave.fromJSON),
      tune.tuneGap
    );
  }

  toJSON(): SavedTune {
    return {
      name: this._name,
      tuneType: this._tuneType,
      composer: this._composer,
      staves: this._staves.map((stave) => stave.toJSON()),
      tuneGap: this._tuneGap,
    };
  }

  name() {
    return this._name;
  }

  setName(name: string) {
    this._name = name;
  }

  tuneType() {
    return this._tuneType;
  }

  setTuneType(tuneType: string) {
    this._tuneType = tuneType;
  }

  composer() {
    return this._composer;
  }

  setComposer(composer: string) {
    this._composer = composer;
  }

  tuneGap() {
    return this._tuneGap;
  }

  setTuneGap(gap: number) {
    this._tuneGap = gap;
  }

  staves() {
    return this._staves;
  }

  timeSignature(): ITimeSignature {
    return this.staves()[0]?.bars()[0]?.timeSignature() || null;
  }

  addStave(nearStave: IStave | null, where: Relative) {
    let index: number;
    let nearestBar: IBar | null;

    if (nearStave) {
      index = this.staves().indexOf(nearStave) + (where === Relative.before ? 0 : 1);
      nearestBar =
        where === Relative.before ? nearStave.firstBar() : nearStave.lastBar();
    } else if (where === Relative.before) {
      index = 0;
      nearestBar = nfirst(this.staves())?.firstBar();
    } else {
      index = this.staves().length;
      nearestBar = nlast(this.staves())?.lastBar();
    }

    const ts = nearestBar?.timeSignature() || new TimeSignature();
    const newStave = Stave.create(ts);
    this._staves.splice(index, 0, newStave);
  }

  deleteStave(stave: IStave) {
    const ind = this._staves.indexOf(stave);
    if (ind !== -1) {
      this._staves.splice(ind, 1);
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
