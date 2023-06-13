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

import { Stave, trebleClefWidth } from '../Stave';
import { TextBox } from '../TextBox';
import { Timing, TimingPart, SecondTiming } from '../Timing';
import { TimeSignature } from '../TimeSignature';
import { settings } from '../global/settings';
import m from 'mithril';
import { clickBackground, mouseUp } from '../Events/Mouse';
import { mouseOffPitch } from '../Events/PitchBoxes';
import { Preview } from '../Preview';
import { NoteState } from '../Note/state';
import { Update } from '../Events/common';
import { Playback } from '../Playback';
import { ScoreSelection, Selection } from '../Selection';
import { GracenoteState } from '../Gracenote/state';
import { first, foreach, last, nlast } from '../global/utils';

import { Triplet } from '../Note';
import { ID, Item } from '../global/id';
import { Bar } from '../Bar';
import { setXYPage } from '../global/xy';
import { dispatch } from '../Controller';
import { SavedScore } from '../SavedModel';

interface ScoreProps {
  selection: Selection | null;
  justAddedNote: boolean;
  noteState: NoteState;
  preview: Preview | null;
  gracenoteState: GracenoteState;
}
export class Score {
  private name: string;
  public landscape: boolean;
  private _staves: Stave[];
  // an array rather than a set since it makes rendering easier (with map)
  private textBoxes: TextBox[][];
  private timings: Timing[];

  public showNumberOfPages: boolean;
  public numberOfPages = 1;
  public zoom: number;

  constructor(
    name = 'My Tune',
    composer = '',
    tuneType = '',
    numberOfParts = 2,
    repeatParts = true,
    timeSignature: TimeSignature | undefined = undefined
  ) {
    this.name = name;
    this.landscape = true;
    this.showNumberOfPages = true;
    this._staves = foreach(2 * numberOfParts, () => new Stave(timeSignature));
    const first = repeatParts ? 'repeatFirst' : 'partFirst';
    const last = repeatParts ? 'repeatLast' : 'partLast';
    this._staves.forEach((stave, index) =>
      index % 2 === 0 ? stave[first]() : stave[last]()
    );
    this.textBoxes = [[]];
    this.addText(
      new TextBox(name, true, this.width() / 2, settings.topOffset / 2)
    );

    // Detailed text - composer / tuneType
    const detailTextSize = 15;
    const detailY = Math.max(settings.topOffset - 45, 10);
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
        new TextBox(
          tuneType,
          false,
          this.width() / detailX,
          detailY,
          detailTextSize
        )
      );

    this.timings = [];
    this.zoom = (100 * 0.9 * Math.max(window.innerWidth, 800)) / this.width();
  }
  public static fromJSON(o: SavedScore) {
    const s = new Score(o.name);
    s.landscape = o.landscape;
    s._staves = o._staves.map(Stave.fromJSON);
    s.textBoxes = o.textBoxes.map((p) => p.texts.map(TextBox.fromJSON));
    s.timings = o.secondTimings.map(Timing.fromJSON);
    s.numberOfPages = o.numberOfPages;
    s.showNumberOfPages = o.showNumberOfPages;
    settings.fromJSON(o.settings);
    s.addMorePagesIfNecessary();
    return s;
  }
  public toJSON(): SavedScore {
    return {
      name: this.name,
      landscape: this.landscape,
      showNumberOfPages: this.showNumberOfPages,
      _staves: this._staves.map((stave) => stave.toJSON()),
      textBoxes: this.textBoxes.map((p) => ({
        texts: p.map((txt) => txt.toJSON()),
      })),
      secondTimings: this.timings.map((st) => st.toJSON()),
      numberOfPages: this.numberOfPages,
      settings: settings.toJSON(),
    };
  }
  public width() {
    return this.landscape
      ? settings.pageLongSideLength
      : settings.pageShortSideLength;
  }
  public height() {
    return this.landscape
      ? settings.pageShortSideLength
      : settings.pageLongSideLength;
  }
  public orientation() {
    return this.landscape ? 'landscape' : 'portrait';
  }
  public makeLandscape() {
    if (this.landscape) return Update.NoChange;
    this.landscape = true;
    this.adjustAfterOrientationChange();
    return Update.ShouldSave;
  }
  public makePortrait() {
    if (!this.landscape) return Update.NoChange;
    this.landscape = false;
    this.adjustAfterOrientationChange();
    return Update.ShouldSave;
  }
  private adjustAfterOrientationChange() {
    this.addMorePagesIfNecessary();
    this.textBoxes.forEach((p) =>
      p.forEach((text) =>
        text.adjustAfterOrientation(this.width(), this.height())
      )
    );
    this.bars().forEach((b) => b.adjustWidth(this.width() / this.height()));
    this.zoom = (this.zoom * this.height()) / this.width();
  }
  private addMorePagesIfNecessary() {
    while (this.notEnoughSpace()) {
      this.numberOfPages += 1;
    }
    while (this.textBoxes.length < this.numberOfPages) {
      this.textBoxes.push([]);
    }
  }
  public updateName() {
    this.textBoxes[0][0] && (this.name = this.textBoxes[0][0].text());
  }
  public addText(text: TextBox) {
    this.textBoxes[0].push(text);
  }
  public addTiming(timing: Timing) {
    if (timing.noOverlap(this.timings)) {
      this.timings.push(timing);
      return true;
    }
    return false;
  }
  private staveY(stave: Stave, pageIndex: number) {
    return (
      this.topGap(pageIndex) + settings.staveGap * this._staves.indexOf(stave)
    );
  }
  private topGap(pageIndex: number) {
    return pageIndex === 0 ? settings.topOffset : settings.margin;
  }
  private stavesSplitByPage() {
    const splitStaves: Stave[][] = foreach(this.numberOfPages, () => []);
    let page = 0;
    for (const stave of this._staves) {
      const pageHeight =
        this.topGap(page) +
        settings.staveGap * splitStaves[page].length +
        settings.margin;

      if (pageHeight > this.height() && page < this.numberOfPages - 1) {
        page += 1;
      }
      splitStaves[page].push(stave);
    }
    return splitStaves;
  }
  private notEnoughSpace() {
    const pageHeight =
      this.topGap(this.numberOfPages - 1) +
      settings.staveGap *
        (this.stavesSplitByPage()[this.numberOfPages - 1].length - 1) +
      settings.margin;
    return pageHeight > this.height();
  }
  public addStave(nearStave: Stave | null, before: boolean) {
    const usefulHeightPerPage = this.height() - 2 * settings.margin;
    // First page is different since it has a gap at the top (of size topOffset)
    const usefulHeightOnFirstPage =
      this.height() - settings.margin - settings.topOffset;
    const gapNeededBetweenStaves =
      (usefulHeightOnFirstPage +
        usefulHeightPerPage * (this.numberOfPages - 1)) /
      (this._staves.length + 0.5);

    if (gapNeededBetweenStaves < Stave.minHeight()) {
      alert(
        'Cannot add stave - not enough space. Add another page, or reduce the margin at the top of the page.'
      );
      return;
    } else if (gapNeededBetweenStaves < settings.staveGap) {
      settings.staveGap = gapNeededBetweenStaves;
    }

    if (nearStave) {
      const adjacentBar = before ? nearStave.firstBar() : nearStave.lastBar();
      const ts = adjacentBar && adjacentBar.timeSignature();
      const ind = this._staves.indexOf(nearStave);
      const newStave = new Stave(ts || new TimeSignature());
      if (ind !== -1) this._staves.splice(before ? ind : ind + 1, 0, newStave);
    } else {
      this._staves.push(new Stave(new TimeSignature()));
    }
  }

  public nextBar(id: ID) {
    return Bar.nextBar(id, this.bars());
  }
  public previousBar(id: ID) {
    return Bar.previousBar(id, this.bars());
  }
  public nextNote(id: ID) {
    return Bar.nextNote(id, this.bars());
  }
  public previousNote(id: ID) {
    return Bar.previousNote(id, this.bars());
  }
  public nextStave(stave: Stave) {
    const stave_index = this._staves.indexOf(stave);
    const index = stave_index + 1;
    if (stave_index != -1 && index < this._staves.length) {
      return this._staves[index];
    }
    return null;
  }
  public previousStave(stave: Stave) {
    const index = this._staves.indexOf(stave) - 1;
    if (index < 0) {
      return null;
    }
    return this._staves[index];
  }
  public hasStuffOnLastPage() {
    return nlast(this.stavesSplitByPage()).length > 0;
  }
  public firstOnPage(page: number) {
    return first(this.stavesSplitByPage()[page])?.firstBar() || null;
  }
  public lastOnPage(page: number) {
    return last(this.stavesSplitByPage()[page])?.lastBar() || null;
  }
  public deletePage() {
    const stavesToDelete = this.stavesSplitByPage()[this.numberOfPages - 1];
    if (stavesToDelete) {
      const first = stavesToDelete[0]?.firstBar() || null;
      const last = nlast(stavesToDelete)?.lastBar() || null;
      if (first && last) {
        const selection = new ScoreSelection(first.id, last.id, false);
        selection.delete(this);
      }
    }

    this.textBoxes[this.numberOfPages - 1] = [];
    this.numberOfPages--;
  }
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere
  public deleteStave(stave: Stave) {
    const ind = this._staves.indexOf(stave);
    if (ind !== -1) this._staves.splice(ind, 1);
  }
  public notesAndTriplets() {
    return this.bars().flatMap((bar) => bar.notesAndTriplets());
  }
  public notes() {
    return Triplet.flatten(this.notesAndTriplets());
  }
  public bars() {
    return this._staves.flatMap((stave) => stave.bars());
  }
  public staves() {
    return this._staves;
  }
  public lastStave() {
    return last(this._staves);
  }

  // Finds the parent bar and stave of the bar/note passed
  public location(id: ID) {
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

    const lastStave = nlast(staves);
    const lastBar = nlast(lastStave.bars());
    return {
      stave: lastStave,
      bar: lastBar,
    };
  }

  // Converts the y coordinate to the index of stave that the y coordinate lies within
  // If it is below 0, it returns 0; if it doesn't lie on any stave it returns null
  public coordinateToStaveIndex(y: number): number | null {
    const offset = y + 4 * settings.lineGap - settings.topOffset;
    if (offset > 0 && offset % settings.staveGap <= 12 * settings.lineGap) {
      return Math.max(Math.floor(offset / settings.staveGap), 0);
    } else {
      return null;
    }
  }
  public deleteTiming(timing: Timing) {
    this.timings.splice(this.timings.indexOf(timing), 1);
  }
  public deleteTextBox(text: TextBox) {
    for (const p of this.textBoxes) {
      const i = p.indexOf(text);
      if (i > -1) p.splice(i, 1);
    }
  }
  public dragTextBox(text: TextBox, x: number, y: number, page: number) {
    if (page >= this.numberOfPages) return;
    for (let pageIndex = 0; pageIndex < this.numberOfPages; pageIndex++) {
      for (let i = 0; i < this.textBoxes[pageIndex].length; i++) {
        if (this.textBoxes[pageIndex][i].text() === text.text()) {
          if (pageIndex !== page) {
            this.textBoxes[pageIndex].splice(i, 1);
            this.textBoxes[page].push(text);
          }
        }
      }
    }
    if (x < this.width() && x > 0 && y < this.height() && y > 0) {
      text.setCoords(x, y);
    }
  }
  public dragTiming(
    timing: Timing,
    part: TimingPart,
    x: number,
    y: number,
    page: number
  ) {
    timing.drag(part, x, y, page, this.timings);
  }

  public purgeTimings(items: Item[]) {
    const timingsToDelete: Timing[] = [];
    for (const item of items) {
      for (const st of this.timings) {
        if (st.pointsTo(item.id)) timingsToDelete.push(st);
      }
    }
    timingsToDelete.forEach((t) => this.deleteTiming(t));
  }
  public play() {
    return this._staves.flatMap((st, i) =>
      st.play(i === 0 ? null : this._staves[i - 1])
    );
  }
  public playbackTimings(elements: Playback[]) {
    // TODO : support single timings ... ?
    return this.timings
      .filter((st) => st instanceof SecondTiming)
      .map((st) => (st as SecondTiming).playbackTiming(elements));
  }
  public render(props: ScoreProps): m.Children {
    const width = this.width();
    const height = this.height();

    const staveProps = (stave: Stave, index: number, pageIndex: number) => ({
      x: settings.margin,
      y: index * settings.staveGap + this.topGap(pageIndex),
      justAddedNote: props.justAddedNote,
      width: width - 2 * settings.margin,
      previousStave: this._staves[index - 1] || null,
      previousStaveY: this.staveY(stave, pageIndex),
      noteState: props.noteState,
      gracenoteState: props.gracenoteState,
    });

    const timingProps = (page: number) => ({
      page,
      score: this,
      staveStartX: settings.margin + trebleClefWidth,
      staveEndX: width - settings.margin,
      selection: props.selection,
      staveGap: settings.staveGap,
    });
    const selectionProps = (i: number) => ({
      page: i,
      score: this,
      staveStartX: settings.margin,
      staveEndX: width - settings.margin,
      staveGap: settings.staveGap,
    });

    const splitStaves = this.stavesSplitByPage();
    const texts = (i: number) => this.textBoxes[i] || [];

    return m(
      'div',
      foreach(this.numberOfPages, (i) => {
        setXYPage(i);
        return m(
          'svg',
          {
            width: (width * this.zoom) / 100,
            height: (height * this.zoom) / 100,
            viewBox: `0 0 ${width} ${height}`,
            class: i.toString(),
            onmouseup: () => dispatch(mouseUp()),
          },
          [
            m('rect', {
              x: '0',
              y: '0',
              width: '100%',
              height: '100%',
              fill: 'white',
              onmousedown: () => dispatch(clickBackground()),
              onmouseover: () => dispatch(mouseOffPitch()),
            }),
            ...splitStaves[i].map((stave, idx) =>
              stave.render(staveProps(stave, idx, i))
            ),
            ...texts(i).map((textBox) =>
              textBox.render({
                scoreWidth: width,
                selection: props.selection,
              })
            ),
            ...this.timings.map((timing) => timing.render(timingProps(i))),
            props.selection instanceof ScoreSelection &&
              props.selection.render(selectionProps(i)),
            this.showNumberOfPages && this.numberOfPages > 1
              ? m(
                  'text',
                  {
                    x: this.width() / 2,
                    y:
                      this.height() -
                      settings.margin +
                      settings.lineHeightOf(5),
                  },
                  (i + 1).toString()
                )
              : null,
          ]
        );
      })
    );
  }
}
