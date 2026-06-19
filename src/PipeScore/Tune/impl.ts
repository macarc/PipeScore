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
import type { IMeasure } from '../Measure';
import type { SavedStaticTextBox, SavedTunev2 } from '../SavedModel';
import type { IStave } from '../Stave';
import { Stave } from '../Stave/impl';
import type { IStaticTextBox } from '../TextBox';
import { StaticTextBox } from '../TextBox/impl';
import type { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { Relative } from '../global/relativeLocation';
import { SUBTITLE_SIZE, Settings, TITLE_SIZE } from '../global/settings';
import { foreach, nfirst, nlast } from '../global/utils';

export class Tune extends ITune {
  private _staves: IStave[];
  private _tuneGap: number;
  private _name: IStaticTextBox;
  private _tuneType: IStaticTextBox;
  private _composer: IStaticTextBox;

  constructor(
    name: IStaticTextBox,
    composer: IStaticTextBox,
    tuneType: IStaticTextBox,
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
    return Tune.createFromStaves(name, composer, tuneType, staves);
  }

  static createFromStaves(
    name: string,
    composer: string,
    tuneType: string,
    staves: IStave[]
  ) {
    return new Tune(
      new StaticTextBox(name, TITLE_SIZE),
      new StaticTextBox(composer, SUBTITLE_SIZE),
      new StaticTextBox(tuneType, SUBTITLE_SIZE),
      staves
    );
  }

  static fromJSON(tune: SavedTunev2) {
    // Fix for a bug that I introduced in an earlier version - the 'text' field
    // of the tune name/composer/tune type could accidentally not be a string.
    if (typeof tune.name.text !== "string") {
      if (tune.name.text["text"]) {
        tune.name.text = (tune.name as SavedStaticTextBox).text;
      }
    }
    if (typeof tune.composer.text !== "string") {
      if (tune.composer.text["text"]) {
        tune.composer.text = (tune.composer.text as SavedStaticTextBox).text;
      }
    }
    if (typeof tune.tuneType.text !== "string") {
      if (tune.tuneType.text["text"]) {
        tune.tuneType.text = (tune.tuneType.text as SavedStaticTextBox).text;
      }
    }
    
    return new Tune(
      StaticTextBox.fromJSON(tune.name, TITLE_SIZE),
      StaticTextBox.fromJSON(tune.composer, SUBTITLE_SIZE),
      StaticTextBox.fromJSON(tune.tuneType, SUBTITLE_SIZE),
      tune.staves.map(Stave.fromJSON),
      tune.tuneGap
    );
  }

  toJSON(): SavedTunev2 {
    return {
      name: this._name.toJSON(),
      tuneType: this._tuneType.toJSON(),
      composer: this._composer.toJSON(),
      staves: this._staves.map((stave) => stave.toJSON()),
      tuneGap: this._tuneGap,
    };
  }

  name() {
    return this._name;
  }

  setName(name: string) {
    this._name.set(name, this._name.fontSize(), this._name.font());
  }

  tuneType() {
    return this._tuneType;
  }

  composer() {
    return this._composer;
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
    return this.staves()[0]?.measures()[0]?.timeSignature() || null;
  }

  addStave(nearStave: IStave | null, where: Relative) {
    let index: number;
    let nearestBar: IMeasure | null;

    if (nearStave) {
      index = this.staves().indexOf(nearStave) + (where === Relative.before ? 0 : 1);
      nearestBar =
        where === Relative.before
          ? nearStave.firstMeasure()
          : nearStave.lastMeasure();
    } else if (where === Relative.before) {
      index = 0;
      nearestBar = nfirst(this.staves())?.firstMeasure();
    } else {
      index = this.staves().length;
      nearestBar = nlast(this.staves())?.lastMeasure();
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
