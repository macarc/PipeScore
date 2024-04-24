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

//  The Score contains the entire score (what a surprise). Since it delegates,
//  this file mostly deals with delegations and pages.

import { IScore } from '.';
import { nextBar, nextNote, previousBar, previousNote } from '../Bar';
import { Update } from '../Events/types';
import { flattenTriplets } from '../Note';
import { Playback } from '../Playback';
import { SavedScore, scoreHasStavesNotTunes } from '../SavedModel';
import { IStave } from '../Stave';
import { Stave } from '../Stave/impl';
import { ITextBox } from '../TextBox';
import { TextBox } from '../TextBox/impl';
import { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { ITiming, TimingPart } from '../Timing';
import { Timing } from '../Timing/impl';
import { ITune } from '../Tune';
import { Tune } from '../Tune/impl';
import { ID } from '../global/id';
import { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { first, last, nlast, removeNulls, sum } from '../global/utils';

export function isStave(s: IStave | ITune): s is IStave {
  return (s as ITune).staves === undefined;
}

export class Score extends IScore {
  landscape: boolean;

  private _name: string;
  private _tunes: ITune[];
  // an array rather than a set since it makes rendering easier (with map)
  private _textBoxes: ITextBox[][];
  private _timings: ITiming[];

  showNumberOfPages: boolean;

  zoom: number;

  constructor(
    name: string,
    composer: string,
    tuneType: string,
    numberOfParts: number,
    repeatParts: boolean,
    timeSignature: ITimeSignature
  ) {
    super();
    this._name = name;
    this.landscape = true;
    this.showNumberOfPages = true;

    const initialTopOffset = 180;

    this._tunes = [Tune.create(timeSignature, numberOfParts, repeatParts)];

    this._textBoxes = [[]];
    this.addText(new TextBox(name, true, this.width() / 2, initialTopOffset / 2));

    // Detailed text - composer / tuneType
    const detailTextSize = 15;
    const detailY = Math.max(initialTopOffset - 45, 10);
    const detailX = 8;
    if (composer.length > 0)
      this.addText(
        new TextBox(
          composer,
          false,
          ((detailX - 1) * this.width()) / detailX,
          detailY,
          detailTextSize
        )
      );
    if (tuneType.length > 0)
      this.addText(
        new TextBox(tuneType, false, this.width() / detailX, detailY, detailTextSize)
      );

    this._timings = [];
    this.zoom = (100 * 0.9 * Math.max(window.innerWidth, 800)) / this.width();
  }

  static withName(name: string) {
    return new Score(name, '', '', 2, true, new TimeSignature());
  }

  static blank() {
    return new Score('My Score', '', '', 2, true, new TimeSignature());
  }

  static fromJSON(o: SavedScore) {
    const s = Score.withName(o.name);
    settings.fromJSON(o.settings);

    s.landscape = o.landscape;
    if (scoreHasStavesNotTunes(o)) {
      s._tunes = [new Tune(o._staves.map(Stave.fromJSON))];
    } else {
      s._tunes = o._tunes.map(Tune.fromJSON);
    }
    s._textBoxes = o.textBoxes.map((p) => p.texts.map(TextBox.fromJSON));
    s._timings = o.secondTimings.map(Timing.fromJSON);
    s.showNumberOfPages = o.showNumberOfPages;

    const firstTune = first(s.tunes());
    if (o.settings.topOffset !== undefined && firstTune) {
      // TODO : implement setTuneGap
      // firstTune.setTuneGap(o.settings.topOffset - 20);
    }
    return s;
  }

  toJSON(): SavedScore {
    return {
      name: this._name,
      landscape: this.landscape,
      showNumberOfPages: this.showNumberOfPages,
      _tunes: this._tunes.map((tune) => tune.toJSON()),
      textBoxes: this._textBoxes.map((p) => ({
        texts: p.map((txt) => txt.toJSON()),
      })),
      secondTimings: this._timings.map((st) => st.toJSON()),
      settings: settings.toJSON(),
    };
  }

  name() {
    return this._name;
  }

  width() {
    return this.landscape
      ? settings.pageLongSideLength
      : settings.pageShortSideLength;
  }

  height() {
    return this.landscape
      ? settings.pageShortSideLength
      : settings.pageLongSideLength;
  }

  printWidth() {
    return this.landscape
      ? settings.pageLongSidePrintLength()
      : settings.pageShortSidePrintLength();
  }

  printHeight() {
    return this.landscape
      ? settings.pageShortSidePrintLength()
      : settings.pageLongSidePrintLength();
  }

  orientation() {
    return this.landscape ? 'landscape' : 'portrait';
  }

  makeLandscape() {
    if (this.landscape) return Update.NoChange;
    this.landscape = true;
    this.adjustAfterOrientationChange();
    return Update.ShouldSave;
  }

  makePortrait() {
    if (!this.landscape) return Update.NoChange;
    this.landscape = false;
    this.adjustAfterOrientationChange();
    return Update.ShouldSave;
  }

  private adjustAfterOrientationChange() {
    for (const page of this._textBoxes) {
      for (const text of page) {
        text.adjustAfterOrientation(this.width(), this.height());
      }
    }
    for (const bar of this.bars()) {
      bar.adjustWidth(this.width() / this.height());
    }
    this.zoom = (this.zoom * this.height()) / this.width();
  }

  updateName() {
    if (this._textBoxes[0][0]) {
      this._name = this._textBoxes[0][0].text();
    }
  }

  addText(text: ITextBox): void {
    this._textBoxes[0].push(text);
  }

  textBoxes(): ITextBox[][] {
    return this._textBoxes;
  }

  addTiming(timing: ITiming) {
    if (timing.noOverlap(this._timings)) {
      this._timings.push(timing);
      return true;
    }
    return false;
  }

  timings(): ITiming[] {
    return this._timings;
  }

  addTune(nearTune: ITune | null, where: Relative) {
    if (nearTune) {
      const newTune = Tune.create(
        nearTune.timeSignature() || new TimeSignature(),
        2,
        true
      );
      const indexOffset = where === Relative.before ? 0 : 1;
      this._tunes.splice(this._tunes.indexOf(nearTune) + indexOffset, 0, newTune);
    } else if (where === Relative.before) {
      const newTune = Tune.create(new TimeSignature(), 2, true);
      this._tunes.unshift(newTune);
    } else {
      const newTune = Tune.create(new TimeSignature(), 2, true);
      this._tunes.push(newTune);
    }
  }

  deleteTune(tune: ITune) {
    const index = this._tunes.indexOf(tune);
    if (index !== -1) {
      this._tunes.splice(index, 1);
    }
  }

  staveY(stave: IStave) {
    const pages = this.pages();
    const pageIndex = pages.findIndex((page) => page.includes(stave));
    const page = pages[pageIndex];

    if (!page) {
      console.error("Tried to get a stave Y of a stave that isn't on any page!");
      return 0;
    }

    return (
      settings.margin + this.calculateHeight(page.slice(0, page.indexOf(stave)))
    );
  }

  private calculateHeight(staves: (IStave | ITune)[]) {
    return sum(staves.map((s) => (s instanceof ITune ? s.tuneGap() : s.height())));
  }

  stavesByPage(): IStave[][] {
    return this.pages().map((p) => p.filter(isStave));
  }

  pages() {
    const splitStaves: (IStave | ITune)[][] = [[]];
    const usefulPageHeight = this.height() - 2 * settings.margin;
    for (const tune of this.tunes()) {
      nlast(splitStaves).push(tune);
      for (const stave of tune.staves()) {
        const pageHeight = this.calculateHeight(nlast(splitStaves));
        if (pageHeight + stave.height() > usefulPageHeight) {
          splitStaves.push([]);
        }
        nlast(splitStaves).push(stave);
      }
    }
    return splitStaves;
  }

  nextBar(id: ID) {
    return nextBar(id, this.bars());
  }

  previousBar(id: ID) {
    return previousBar(id, this.bars());
  }

  nextNote(id: ID) {
    return nextNote(id, this.bars());
  }

  previousNote(id: ID) {
    return previousNote(id, this.bars());
  }

  firstOnPage(page: number) {
    return first(this.stavesByPage()[page])?.firstBar() || null;
  }

  lastOnPage(page: number) {
    return last(this.stavesByPage()[page])?.lastBar() || null;
  }

  notesAndTriplets() {
    return this.bars().flatMap((bar) => bar.notesAndTriplets());
  }

  notes() {
    return flattenTriplets(this.notesAndTriplets());
  }

  bars() {
    return this.staves().flatMap((stave) => stave.bars());
  }

  staves(): IStave[] {
    return this._tunes.flatMap((tune) => tune.staves());
  }

  tunes(): ITune[] {
    return this._tunes;
  }

  lastStave() {
    return last(this.staves());
  }

  // Finds the parent bar stave, and tune of the bar/note passed
  location(id: ID) {
    for (const tune of this.tunes()) {
      for (const stave of tune.staves()) {
        for (const bar of stave.bars()) {
          if (bar.hasID(id) || bar.includesNote(id)) {
            return { tune, stave, bar };
          }
        }
      }
    }

    return null;
  }

  lastBarAndStave() {
    const tune = last(this.tunes());
    const stave = tune && last(tune.staves());
    const bar = stave && last(stave.bars());
    return (
      bar && {
        tune,
        stave,
        bar,
      }
    );
  }

  deleteTiming(timing: ITiming) {
    this._timings.splice(this._timings.indexOf(timing), 1);
  }

  deleteTextBox(text: ITextBox) {
    for (const p of this._textBoxes) {
      const i = p.indexOf(text);
      if (i > -1) p.splice(i, 1);
    }
  }

  dragTextBox(text: ITextBox, x: number, y: number, page: number) {
    const pages = this.pages();

    if (page >= pages.length) return;
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      for (let i = 0; i < this._textBoxes[pageIndex].length; i++) {
        if (this._textBoxes[pageIndex][i].text() === text.text()) {
          if (pageIndex !== page) {
            this._textBoxes[pageIndex].splice(i, 1);
            this._textBoxes[page].push(text);
          }
        }
      }
    }
    if (x < this.width() && x > 0 && y < this.height() && y > 0) {
      text.setCoords(x, y);
    }
  }

  dragTiming(timing: ITiming, part: TimingPart, x: number, y: number, page: number) {
    timing.drag(part, x, y, page, this._timings);
  }

  removeUselessTimings() {
    const usefulTimings = this._timings.filter((timing) => !timing.isDangling());
    if (usefulTimings.length !== this.timings().length) {
      this._timings = usefulTimings;
      return true;
    }
    return false;
  }

  play() {
    return this.staves().flatMap((st, i) =>
      st.play(i === 0 ? null : this.staves()[i - 1])
    );
  }

  playbackTimings(elements: Playback[]) {
    return removeNulls(this._timings.map((st) => st.play(elements)));
  }
}
