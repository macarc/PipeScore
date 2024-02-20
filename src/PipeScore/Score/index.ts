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

import m from 'mithril';
import { clickBackground, mouseUp } from '../Events/Mouse';
import { mouseOffPitch } from '../Events/PitchBoxes';
import { Update } from '../Events/common';
import { GracenoteState } from '../Gracenote/state';
import { NoteState } from '../Note/state';
import { Playback } from '../Playback';
import { Preview } from '../Preview';
import { ScoreSelection, Selection } from '../Selection';
import { Stave, trebleClefWidth } from '../Stave';
import { TextBox } from '../TextBox';
import { TimeSignature } from '../TimeSignature';
import { SecondTiming, Timing, TimingPart } from '../Timing';
import { settings } from '../global/settings';
import { first, foreach, last, nlast, oneBefore, sum } from '../global/utils';

import { Bar } from '../Bar';
import { dispatch } from '../Controller';
import { flattenTriplets } from '../Note';
import { playbackCursor } from '../Playback/cursor';
import { PlaybackState } from '../Playback/state';
import { SavedScore } from '../SavedModel';
import { ID, Item } from '../global/id';
import { Relative } from '../global/relativeLocation';
import { setXYPage } from '../global/xy';

interface ScoreProps {
  selection: Selection | null;
  justAddedNote: boolean;
  preview: Preview | null;
  noteState: NoteState;
  gracenoteState: GracenoteState;
  playbackState: PlaybackState;
}

export class Score {
  private name: string;
  public landscape: boolean;
  private _staves: Stave[];
  // an array rather than a set since it makes rendering easier (with map)
  private textBoxes: TextBox[][];
  private timings: Timing[];

  public showNumberOfPages: boolean;
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

    const initialTopOffset = 180;

    this._staves = foreach(2 * numberOfParts, () => new Stave(timeSignature));
    if (numberOfParts > 0) this._staves[0].setGap(initialTopOffset);

    for (let i = 0; i < this._staves.length; i++) {
      if (repeatParts) {
        i % 2 === 0
          ? this._staves[i].repeatFirst()
          : this._staves[i].repeatLast();
      } else {
        i % 2 === 0 ? this._staves[i].partFirst() : this._staves[i].partLast();
      }
    }

    this.textBoxes = [[]];
    this.addText(
      new TextBox(name, true, this.width() / 2, initialTopOffset / 2)
    );

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
    settings.fromJSON(o.settings);

    s.landscape = o.landscape;
    s._staves = o._staves.map(Stave.fromJSON);
    s.textBoxes = o.textBoxes.map((p) => p.texts.map(TextBox.fromJSON));
    s.timings = o.secondTimings.map(Timing.fromJSON);
    s.showNumberOfPages = o.showNumberOfPages;

    const firstStave = first(s._staves);
    if (o.settings.topOffset !== undefined && firstStave) {
      firstStave.setGap(o.settings.topOffset - 20);
    }
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
  public printWidth() {
    return this.landscape
      ? settings.pageLongSidePrintLength()
      : settings.pageShortSidePrintLength();
  }
  public printHeight() {
    return this.landscape
      ? settings.pageShortSidePrintLength()
      : settings.pageLongSidePrintLength();
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
    for (const page of this.textBoxes) {
      for (const text of page) {
        text.adjustAfterOrientation(this.width(), this.height());
      }
    }
    for (const bar of this.bars()) {
      bar.adjustWidth(this.width() / this.height());
    }
    this.zoom = (this.zoom * this.height()) / this.width();
  }
  public updateName() {
    if (this.textBoxes[0][0]) {
      this.name = this.textBoxes[0][0].text();
    }
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
  public staveY(stave: Stave) {
    const pages = this.stavesSplitByPage();
    const pageIndex = pages.findIndex((page) => page.includes(stave));
    const page = pages[pageIndex];

    if (!page) {
      console.error(
        "Tried to get a stave Y of a stave that isn't on any page!"
      );
      return 0;
    }

    return (
      settings.margin + this.calculateHeight(page.slice(0, page.indexOf(stave)))
    );
  }
  private calculateHeight(staves: Stave[]) {
    return sum(staves.map((s) => s.height()));
  }
  private numberOfPages() {
    return this.stavesSplitByPage().length;
  }
  private stavesSplitByPage() {
    // TODO : should gaps 'carry over' to the next page?
    const splitStaves: Stave[][] = [[]];
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

  public addStave(nearStave: Stave | null, where: Relative) {
    // If no stave is selected, place before the first stave
    // or after the last stave

    const adjacentStave =
      nearStave || where === Relative.before
        ? first(this.staves())
        : last(this.staves());

    const index = adjacentStave
      ? this._staves.indexOf(adjacentStave) +
        (where === Relative.before ? 0 : 1)
      : 0;

    if (index < 0) return;

    const adjacentBar =
      where === Relative.before
        ? adjacentStave?.firstBar()
        : adjacentStave?.lastBar();
    const ts = adjacentBar?.timeSignature() || new TimeSignature();

    const newStave = new Stave(ts);
    if (where === Relative.before) {
      newStave.setGap(adjacentStave?.gap() || 'auto');
      adjacentStave?.setGap('auto');
    }
    this._staves.splice(index, 0, newStave);
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
    const staves = this.staves();
    const stave_index = staves.indexOf(stave);
    const index = stave_index + 1;
    if (stave_index !== -1 && index < staves.length) {
      return staves[index];
    }
    return null;
  }
  public previousStave(stave: Stave) {
    const staves = this.staves();
    const index = staves.indexOf(stave) - 1;
    if (index < 0) {
      return null;
    }
    return staves[index];
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
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere
  public deleteStave(stave: Stave) {
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
  public notesAndTriplets() {
    return this.bars().flatMap((bar) => bar.notesAndTriplets());
  }
  public notes() {
    return flattenTriplets(this.notesAndTriplets());
  }
  public bars() {
    return this.staves().flatMap((stave) => stave.bars());
  }
  public staves(): Stave[] {
    return this._staves;
  }
  public lastStave() {
    return last(this.staves());
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
    if (page >= this.numberOfPages()) return;
    for (let pageIndex = 0; pageIndex < this.numberOfPages(); pageIndex++) {
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
    for (const timing of timingsToDelete) {
      this.deleteTiming(timing);
    }
  }

  public play() {
    return this.staves().flatMap((st, i) =>
      st.play(i === 0 ? null : this.staves()[i - 1])
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

    const staveWidth = width - 2 * settings.margin;

    const staveProps = (stave: Stave) => ({
      x: settings.margin,
      y: this.staveY(stave),
      justAddedNote: props.justAddedNote,
      width: staveWidth,
      previousStave: oneBefore(stave, this.staves()),
      previousStaveY: this.staveY(stave),
      noteState: props.noteState,
      gracenoteState: props.gracenoteState,
    });

    const timingProps = (page: number) => ({
      page,
      score: this,
      staveStartX: settings.margin + trebleClefWidth,
      staveEndX: width - settings.margin,
      selection: props.selection,
    });
    const selectionProps = (i: number) => ({
      page: i,
      score: this,
      staveStartX: settings.margin + trebleClefWidth,
      staveEndX: width - settings.margin,
    });

    const splitStaves = this.stavesSplitByPage();
    const texts = (i: number) => this.textBoxes[i] || [];

    return m(
      'div',
      foreach(this.numberOfPages(), (page) => {
        setXYPage(page);
        return m(
          'svg',
          {
            width: (width * this.zoom) / 100,
            height: (height * this.zoom) / 100,
            viewBox: `0 0 ${width} ${height}`,
            class: page.toString(),
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
            ...splitStaves[page].map((stave) =>
              stave.render(staveProps(stave))
            ),
            ...texts(page).map((textBox) =>
              textBox.render({
                scoreWidth: width,
                selection: props.selection,
              })
            ),
            ...this.timings.map((timing) => timing.render(timingProps(page))),
            props.selection instanceof ScoreSelection &&
              props.selection.render(selectionProps(page)),

            playbackCursor(props.playbackState, page),

            this.showNumberOfPages && this.numberOfPages() > 1
              ? m(
                  'text',
                  {
                    x: this.width() / 2,
                    y:
                      this.height() -
                      settings.margin +
                      settings.lineHeightOf(5),
                  },
                  (page + 1).toString()
                )
              : null,
          ]
        );
      })
    );
  }
}
