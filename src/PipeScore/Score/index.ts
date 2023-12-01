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
import { ScoreSelection, Selection, TuneBreakSelection } from '../Selection';
import { GracenoteState } from '../Gracenote/state';
import { first, foreach, last, nlast, oneBefore, sum } from '../global/utils';

import { Triplet } from '../Note';
import { ID, Item } from '../global/id';
import { Bar } from '../Bar';
import { setXYPage } from '../global/xy';
import { dispatch } from '../Controller';
import { SavedScore, SavedTuneBreak } from '../SavedModel';
import { clickTuneBreak } from '../Events/Stave';
import { Relative } from '../global/relativeLocation';

interface ScoreProps {
  selection: Selection | null;
  justAddedNote: boolean;
  preview: Preview | null;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

interface TuneBreakProps {
  x: number;
  y: number;
  width: number;
  isSelected: boolean;
}
export class TuneBreak {
  _height: number;

  static minHeight = 1;
  static maxHeight = 400;

  constructor(height = 100) {
    this._height = height;
  }

  height() {
    return this._height;
  }

  setHeight(height: number) {
    this._height = height;
  }

  toJSON(): SavedTuneBreak {
    return {
      type: 'tune-break',
      height: this._height,
    };
  }

  static fromJSON(o: SavedTuneBreak) {
    return new TuneBreak(o.height);
  }

  render(props: TuneBreakProps) {
    const visualUpwardsAdjustment =
      (settings.staveGap - settings.lineHeightOf(4)) / 2;
    return m('g.tune-break', [
      m('rect', {
        x: props.x,
        y: props.y - visualUpwardsAdjustment,
        width: props.width,
        height: this.height(),
        stroke: 'orange',
        'stroke-width': 10,
        fill: '#fff',
        opacity: props.isSelected ? 0.5 : 0,
        onmousedown: () => dispatch(clickTuneBreak(this)),
      }),
    ]);
  }
}

function isStave(staveOrBreak: Stave | TuneBreak): staveOrBreak is Stave {
  return (staveOrBreak as Stave).bars !== undefined;
}

export class Score {
  private name: string;
  public landscape: boolean;
  private _staves: (Stave | TuneBreak)[];
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

    const initialTopOffset = 180;

    this._staves = foreach(2 * numberOfParts, () => new Stave(timeSignature));
    this._staves.unshift(new TuneBreak(initialTopOffset));
    const first = repeatParts ? 'repeatFirst' : 'partFirst';
    const last = repeatParts ? 'repeatLast' : 'partLast';
    this.staves().forEach((stave, index) =>
      index % 2 === 0 ? stave[first]() : stave[last]()
    );
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
    s.landscape = o.landscape;
    s._staves = o._staves.map((s) =>
      s.type === 'tune-break' ? TuneBreak.fromJSON(s) : Stave.fromJSON(s)
    );
    s.textBoxes = o.textBoxes.map((p) => p.texts.map(TextBox.fromJSON));
    s.timings = o.secondTimings.map(Timing.fromJSON);
    s.numberOfPages = o.numberOfPages;
    s.showNumberOfPages = o.showNumberOfPages;
    settings.fromJSON(o.settings);

    const deprecatedTopOffset = (o.settings as any).topOffset;
    if (typeof deprecatedTopOffset === 'number') {
      s._staves.unshift(new TuneBreak(deprecatedTopOffset - 20));
    }
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
  private staveY(stave: Stave | TuneBreak) {
    const pages = this.stavesAndTuneBreaksSplitByPage();
    const pageIndex = pages.findIndex((page) => page.includes(stave));
    const page = pages[pageIndex];
    if (page) {
      return (
        settings.margin +
        this.calculateHeight(page.slice(0, page.indexOf(stave)))
      );
    } else {
      console.error(
        "Tried to get a stave Y of a stave that isn't on any page!"
      );
      return 0;
    }
  }
  private calculateHeight(staves: (Stave | TuneBreak)[]) {
    return staves.reduce((acc, s) => acc + s.height(), 0);
  }
  private stavesAndTuneBreaksSplitByPage() {
    // FIXME: tune breaks should be able to go across page
    const splitStaves: (Stave | TuneBreak)[][] = foreach(
      this.numberOfPages,
      () => []
    );
    let page = 0;
    for (const stave of this._staves) {
      const pageHeight =
        this.calculateHeight(splitStaves[page]) + 2 * settings.margin;

      if (pageHeight > this.height() && page < this.numberOfPages - 1) {
        page += 1;
      }
      splitStaves[page].push(stave);
    }
    return splitStaves;
  }
  private stavesSplitByPage() {
    return this.stavesAndTuneBreaksSplitByPage().map(
      (page) => page.filter((s) => isStave(s)) as Stave[]
    );
  }
  private notEnoughSpace() {
    const pageHeight =
      this.calculateHeight(
        this.stavesAndTuneBreaksSplitByPage()[this.numberOfPages - 1]
      ) +
      2 * settings.margin;
    return pageHeight > this.height();
  }
  private fitAnotherStaveWithHeight(minHeight: number, name: string) {
    const availableHeight = this.height() - 2 * settings.margin;

    const totalUsefulHeight = sum(
      this.stavesAndTuneBreaksSplitByPage().map(
        (page) =>
          availableHeight -
          sum(page.filter((page) => !isStave(page)).map((t) => t.height()))
      )
    );
    // Why +0.5, not +1?
    const gapNeededBetweenStaves =
      totalUsefulHeight / (this.staves().length + 0.5);

    if (gapNeededBetweenStaves < minHeight) {
      alert(
        `Cannot add ${name} - not enough space. Add another page, or reduce the margin at the top of the page.`
      );
      return false;
    }

    if (gapNeededBetweenStaves < settings.staveGap) {
      settings.staveGap = gapNeededBetweenStaves;
    }
    return true;
  }
  private insert(
    item: Stave | TuneBreak,
    nearStave: Stave | null,
    where: Relative
  ) {
    if (nearStave) {
      const ind = this._staves.indexOf(nearStave);
      if (ind !== -1)
        this._staves.splice(where === Relative.before ? ind : ind + 1, 0, item);
    } else {
      this._staves.push(item);
    }
  }
  public addTuneBreak(nearStave: Stave | null, where: Relative) {
    const tbreak = new TuneBreak();
    if (!this.fitAnotherStaveWithHeight(tbreak.height(), 'tune break')) {
      return;
    }

    this.insert(tbreak, nearStave, where);
  }
  public addStave(nearStave: Stave | null, where: Relative) {
    if (!this.fitAnotherStaveWithHeight(Stave.minHeight(), 'stave')) {
      return;
    }
    const adjacentBar = nearStave
      ? where === Relative.before
        ? nearStave.firstBar()
        : nearStave.lastBar()
      : null;
    const ts = adjacentBar && adjacentBar.timeSignature();
    const newStave = new Stave(ts || new TimeSignature());
    this.insert(newStave, nearStave, where);
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
    if (stave_index != -1 && index < staves.length) {
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
    return nlast(this.stavesAndTuneBreaksSplitByPage()).length > 0;
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
  public deleteStaveOrTuneBreak(stave: Stave | TuneBreak) {
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
    return this.staves().flatMap((stave) => stave.bars());
  }
  public staves(): Stave[] {
    return this._staves.filter((stave) => isStave(stave)) as Stave[];
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

    const tuneBreakProps = (tuneBreak: TuneBreak) => ({
      x: settings.margin,
      y: this.staveY(tuneBreak),
      width: staveWidth,
      isSelected:
        props.selection instanceof TuneBreakSelection &&
        props.selection.tuneBreak === tuneBreak,
    });

    const timingProps = (page: number) => ({
      page,
      score: this,
      staveStartX: settings.margin + trebleClefWidth,
      staveEndX: width - settings.margin,
      selection: props.selection,
      // TODO
      staveGap: settings.staveGap,
    });
    const selectionProps = (i: number) => ({
      page: i,
      score: this,
      staveStartX: settings.margin,
      staveEndX: width - settings.margin,
      // TODO
      staveGap: settings.staveGap,
    });

    const splitStaves = this.stavesAndTuneBreaksSplitByPage();
    console.log(splitStaves);
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
            ...splitStaves[i].map((stave) =>
              isStave(stave)
                ? stave.render(staveProps(stave))
                : stave.render(tuneBreakProps(stave))
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
