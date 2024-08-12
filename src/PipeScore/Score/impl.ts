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
import { type IBar, nextBar, nextNote, previousBar, previousNote } from '../Bar';
import { Update } from '../Events/types';
import type { NoteOrTriplet } from '../Note';
import type { Playback } from '../Playback';
import { type SavedScore, scoreHasStavesNotTunes } from '../SavedModel';
import type { IStave } from '../Stave';
import { Stave } from '../Stave/impl';
import type { IMovableTextBox } from '../TextBox';
import { MovableTextBox } from '../TextBox/impl';
import type { ITimeSignature } from '../TimeSignature';
import { TimeSignature } from '../TimeSignature/impl';
import type { ITiming, TimingPart } from '../Timing';
import { Timing } from '../Timing/impl';
import { ITune } from '../Tune';
import { Tune } from '../Tune/impl';
import type { ID } from '../global/id';
import { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { first, last, nlast, removeNulls, sum } from '../global/utils';

export function isStave(s: IStave | ITune): s is IStave {
  return (s as ITune).staves === undefined;
}

export class Score extends IScore {
  landscape: boolean;

  private _tunes: ITune[];
  // an array rather than a set since it makes rendering easier (with map)
  private _textBoxes: IMovableTextBox[][];
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
    this.landscape = true;
    this.showNumberOfPages = true;
    this._tunes = [
      Tune.create(
        timeSignature,
        numberOfParts,
        repeatParts,
        name,
        composer,
        tuneType
      ),
    ];
    this._textBoxes = [[]];

    this._timings = [];
    this.zoom = (100 * 0.9 * Math.max(window.innerWidth, 800)) / this.width();
  }

  static blank() {
    return new Score('My Score', '', '', 2, true, new TimeSignature());
  }

  static fromJSON(o: SavedScore) {
    const s = Score.blank();
    settings.fromJSON(o.settings);

    s.landscape = o.landscape;
    s._textBoxes = o.textBoxes.map((p) => p.texts.map(MovableTextBox.fromJSON));
    s._timings = o.secondTimings.map(Timing.fromJSON);
    s.showNumberOfPages = o.showNumberOfPages;

    if (scoreHasStavesNotTunes(o)) {
      const name = s._textBoxes[0]?.[0]?.text() || 'My Tune';
      const composer = s._textBoxes[0]?.[1]?.text() || 'Composer';
      const tuneType = s._textBoxes[0]?.[2]?.text() || 'Tune Type';
      s._textBoxes[0].splice(0, 3);
      s._tunes = [
        Tune.createFromStaves(
          name,
          composer,
          tuneType,
          o._staves.map(Stave.fromJSON)
        ),
      ];
    } else {
      s._tunes = o.tunes.map(Tune.fromJSON);
    }

    return s;
  }

  toJSON(): SavedScore {
    return {
      landscape: this.landscape,
      showNumberOfPages: this.showNumberOfPages,
      tunes: this._tunes.map((tune) => tune.toJSON()),
      textBoxes: this._textBoxes.map((p) => ({
        texts: p.map((txt) => txt.toJSON()),
      })),
      secondTimings: this._timings.map((st) => st.toJSON()),
      settings: settings.toJSON(),
    };
  }

  name() {
    return this._tunes[0]?.name().text() || 'Empty Score';
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
    for (const bar of this.measures()) {
      bar.adjustWidth(this.width() / this.height());
    }
    this.zoom = (this.zoom * this.height()) / this.width();
  }

  addText(text: IMovableTextBox): void {
    this._textBoxes[0].push(text);
  }

  textBoxes(): IMovableTextBox[][] {
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

  staveY(stave: IStave | ITune) {
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
    return nextBar(id, this.measures());
  }

  previousBar(id: ID) {
    return previousBar(id, this.measures());
  }

  nextNote(id: ID) {
    return nextNote(id, this.measures());
  }

  previousNote(id: ID) {
    return previousNote(id, this.measures());
  }

  previousStaveSameTune(stave: IStave): IStave | null {
    for (const tune of this.tunes()) {
      const previous = tune.previousStave(stave);
      if (previous) {
        return previous;
      }
    }
    return null;
  }

  firstOnPage(page: number) {
    return first(this.stavesByPage()[page])?.firstMeasure()?.bars()[0] || null;
  }

  lastOnPage(page: number) {
    return (
      last(last(this.stavesByPage()[page])?.lastMeasure()?.bars() || []) || null
    );
  }

  bars() {
    const bars: IBar[][] = [];
    for (const measure of this.measures()) {
      for (let i = 0; i < measure.bars().length; i++) {
        if (i >= bars.length) {
          bars.push([]);
        }

        bars[i].push(measure.bars()[i]);
      }
    }
    return bars;
  }

  notes() {
    return this.bars().map((part) => part.flatMap((bar) => bar.notes()));
  }

  flatNotes() {
    return this.measures().flatMap((measure) =>
      measure.bars().flatMap((bar) => bar.notes())
    );
  }

  flatNotesAndTriplets(): NoteOrTriplet[] {
    return this.measures().flatMap((measure) =>
      measure.bars().flatMap((bar) => bar.notesAndTriplets())
    );
  }

  measures() {
    return this.staves().flatMap((stave) => stave.measures());
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
        for (const measure of stave.measures()) {
          for (const bar of measure.bars()) {
            if (bar.hasID(id) || bar.containsNoteWithID(id)) {
              return { tune, stave, measure, bar };
            }
          }
        }
      }
    }

    return null;
  }

  lastBarAndStave() {
    const tune = last(this.tunes());
    const stave = tune && last(tune.staves());
    const measure = stave && last(stave.measures());
    const bar = measure && first(measure.bars());
    return (
      bar && {
        tune,
        stave,
        measure,
        bar,
      }
    );
  }

  deleteTiming(timing: ITiming) {
    this._timings.splice(this._timings.indexOf(timing), 1);
  }

  deleteTextBox(text: IMovableTextBox) {
    for (const p of this._textBoxes) {
      const i = p.indexOf(text);
      if (i > -1) p.splice(i, 1);
    }
  }

  dragTextBox(text: IMovableTextBox, x: number, y: number, page: number) {
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
