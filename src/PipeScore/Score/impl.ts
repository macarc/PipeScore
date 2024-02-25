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
import { SavedScore } from '../SavedModel';
import { IStave } from '../Stave';
import { Stave } from '../Stave/impl';
import { ITextBox } from '../TextBox';
import { TextBox } from '../TextBox/impl';
import { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import { ITiming, TimingPart } from '../Timing';
import { Timing } from '../Timing/impl';
import { ID, Item } from '../global/id';
import { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { first, foreach, last, nlast, removeNulls, sum } from '../global/utils';

export class Score extends IScore {
  landscape: boolean;

  private _name: string;
  private _staves: IStave[];
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

    this._staves = foreach(2 * numberOfParts, () => Stave.create(timeSignature));
    if (numberOfParts > 0) this._staves[0].setGap(initialTopOffset);

    for (let i = 0; i < this._staves.length; i++) {
      if (repeatParts) {
        i % 2 === 0 ? this._staves[i].repeatFirst() : this._staves[i].repeatLast();
      } else {
        i % 2 === 0 ? this._staves[i].partFirst() : this._staves[i].partLast();
      }
    }

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
    s._staves = o._staves.map(Stave.fromJSON);
    s._textBoxes = o.textBoxes.map((p) => p.texts.map(TextBox.fromJSON));
    s._timings = o.secondTimings.map(Timing.fromJSON);
    s.showNumberOfPages = o.showNumberOfPages;

    const firstStave = first(s._staves);
    if (o.settings.topOffset !== undefined && firstStave) {
      firstStave.setGap(o.settings.topOffset - 20);
    }
    return s;
  }

  toJSON(): SavedScore {
    return {
      name: this._name,
      landscape: this.landscape,
      showNumberOfPages: this.showNumberOfPages,
      _staves: this._staves.map((stave) => stave.toJSON()),
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

  private calculateHeight(staves: IStave[]) {
    return sum(staves.map((s) => s.height()));
  }

  pages() {
    // TODO : should gaps 'carry over' to the next page?
    const splitStaves: IStave[][] = [[]];
    const usefulPageHeight = this.height() - 2 * settings.margin;
    for (const stave of this.staves()) {
      const pageHeight = this.calculateHeight(nlast(splitStaves));
      if (pageHeight + stave.height() > usefulPageHeight) {
        splitStaves.push([]);
      }
      nlast(splitStaves).push(stave);
    }
    return splitStaves;
  }

  addStave(nearStave: IStave | null, where: Relative) {
    // If no stave is selected, place before the first stave
    // or after the last stave

    const adjacentStave =
      nearStave || where === Relative.before
        ? first(this.staves())
        : last(this.staves());

    const index = adjacentStave
      ? this._staves.indexOf(adjacentStave) + (where === Relative.before ? 0 : 1)
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

  firstOnPage(page: number) {
    return first(this.pages()[page])?.firstBar() || null;
  }

  lastOnPage(page: number) {
    return last(this.pages()[page])?.lastBar() || null;
  }
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere

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
    return this._staves;
  }

  lastStave() {
    return last(this.staves());
  }

  // Finds the parent bar and stave of the bar/note passed

  location(id: ID) {
    const staves = this.staves();

    if (staves.length === 0)
      throw Error('Tried to get location of a note, but there are no staves!');

    for (const stave of staves) {
      for (const bar of stave.bars()) {
        if (bar.hasID(id) || bar.includesNote(id)) {
          return { stave, bar };
        }
      }
    }

    return null;
  }

  lastBarAndStave() {
    const lastStave = last(this.staves());
    const lastBar = lastStave && last(lastStave.bars());
    return (
      lastBar && {
        stave: lastStave,
        bar: lastBar,
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

  purgeTimings(items: Item[]) {
    const timingsToDelete: ITiming[] = [];
    for (const item of items) {
      for (const st of this._timings) {
        if (st.pointsTo(item.id)) timingsToDelete.push(st);
      }
    }
    for (const timing of timingsToDelete) {
      this.deleteTiming(timing);
    }
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
