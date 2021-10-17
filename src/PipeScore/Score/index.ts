/*
  Score format
  Copyright (C) 2021 Archie Maclean
*/
import { Stave } from '../Stave';
import { TextBox } from '../TextBox';
import { DraggedSecondTiming, SecondTiming } from '../SecondTiming';
import { TimeSignature } from '../TimeSignature';
import { settings } from '../global/settings';
import { h, svg, V } from '../../render/h';
import { clickBackground, mouseOffPitch, mouseUp } from '../Controllers/Mouse';
import { Demo } from '../DemoNote';
import { NoteState } from '../Note/state';
import { Dispatch } from '../Controllers/Controller';
import { ScoreSelection, Selection } from '../Selection';
import { GracenoteState } from '../Gracenote/state';
import { foreach, last, nlast, Obj } from '../global/utils';

import { Triplet } from '../Note';
import { ID, Item } from '../global/id';
import { Bar } from '../Bar';

interface ScoreProps {
  selection: Selection | null;
  dispatch: Dispatch;
  noteState: NoteState;
  demoNote: Demo | null;
  gracenoteState: GracenoteState;
}
export class Score {
  private name: string;
  private landscape: boolean;
  private _staves: Stave[];
  // an array rather than a set since it makes rendering easier (with map)
  private textBoxes: TextBox[][];
  private secondTimings: SecondTiming[];

  public numberOfPages = 1;
  public zoom: number;

  constructor(
    name = 'My Tune',
    numberOfStaves = 2,
    timeSignature: TimeSignature | undefined = undefined
  ) {
    this.name = name;
    this.landscape = false;
    this._staves = foreach(numberOfStaves, () => new Stave(timeSignature));
    this.textBoxes = [[new TextBox(name, true)]];
    this.secondTimings = [];
    this.zoom =
      (100 * 0.9 * (Math.max(window.innerWidth, 800) - 300)) / this.width();
  }
  public static fromJSON(o: Obj) {
    const s = new Score(o.name, 0);
    s.landscape = o.landscape;
    s._staves = o._staves.map(Stave.fromJSON);
    s.textBoxes = o.textBoxes.map((p: Obj[]) => p.map(TextBox.fromJSON));
    s.secondTimings = o.secondTimings.map(SecondTiming.fromJSON);
    s.numberOfPages = o.numberOfPages;
    return s;
  }
  public toJSON() {
    return {
      name: this.name,
      landscape: this.landscape,
      _staves: this._staves.map((stave) => stave.toJSON()),
      textBoxes: this.textBoxes.map((p) => p.map((txt) => txt.toJSON())),
      secondTimings: this.secondTimings.map((st) => st.toJSON()),
      numberOfPages: this.numberOfPages,
    };
  }
  private width() {
    return this.landscape ? 297 * 5 : 210 * 5;
  }
  private height() {
    return this.landscape ? 210 * 5 : 297 * 5;
  }
  public orientation() {
    return this.landscape ? 'landscape' : 'portrait';
  }
  public toggleLandscape() {
    this.landscape = !this.landscape;

    this.textBoxes.forEach((p) =>
      p.forEach((text) =>
        text.adjustAfterOrientation(this.width(), this.height())
      )
    );
    this.zoom = (this.zoom * this.height()) / this.width();
  }
  public updateName() {
    this.textBoxes[0][0] && (this.name = this.textBoxes[0][0].text());
  }
  public addText(text: TextBox) {
    this.textBoxes[0].push(text);
  }
  public addSecondTiming(secondTiming: SecondTiming) {
    if (secondTiming.isValid(this.secondTimings)) {
      this.secondTimings.push(secondTiming);
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
  private brokenStaves() {
    const brokenStaves: Stave[][] = foreach(this.numberOfPages, () => []);
    let i = 0;
    for (const stave of this._staves) {
      i = Math.floor(
        (settings.topOffset + settings.staveGap * this._staves.indexOf(stave)) /
          (this.height() - settings.margin)
      );
      brokenStaves[Math.min(i, this.numberOfPages - 1)].push(stave);
    }
    return brokenStaves;
  }
  public addStave(afterStave: Stave | null, before: boolean) {
    // Appends a stave after afterStave

    const brokenStaves = this.brokenStaves();
    let pageIndex = brokenStaves.length - 1;
    if (afterStave) {
      for (let page = 0; page < brokenStaves.length; page++) {
        if (brokenStaves[page].includes(afterStave)) {
          pageIndex = page;
          break;
        }
      }
    }
    const notEnoughSpace = (i: number) => {
      return (
        this.topGap(i) + settings.staveGap * brokenStaves[i].length >
        this.height() - settings.margin
      );
    };
    const spaceForAnotherStave = (i: number) => {
      const page = brokenStaves[i];
      if (notEnoughSpace(i)) {
        const newStaveGap =
          (this.height() - settings.topOffset - settings.margin) /
          (page.length + 0.5);
        if (newStaveGap < Stave.minWidth()) {
          return null;
        }
        return newStaveGap;
      } else {
        return settings.staveGap;
      }
    };
    let originalPageIndex = pageIndex;
    let page = brokenStaves[pageIndex];
    while (notEnoughSpace(pageIndex)) {
      page = brokenStaves[++pageIndex];
      if (!page) {
        while (spaceForAnotherStave(originalPageIndex) === null) {
          page = brokenStaves[++originalPageIndex];
          if (!page)
            alert(
              'Cannot add stave - not enough space. Consider adding a second page, or reducing the margin at the top of the page.'
            );
          return;
        }
        const newStaveGap = spaceForAnotherStave(originalPageIndex);
        if (newStaveGap) settings.staveGap = newStaveGap;
        else return;
        break;
      }
    }

    if (afterStave) {
      const adjacentBar = before ? afterStave.firstBar() : afterStave.lastBar();
      const ts = adjacentBar && adjacentBar.timeSignature();
      const ind = this._staves.indexOf(afterStave);
      const newStave = new Stave(ts || new TimeSignature());
      if (ind !== -1) this._staves.splice(before ? ind : ind + 1, 0, newStave);
    } else {
      this._staves.push(new Stave(new TimeSignature()));
    }
  }

  public nextNote(id: ID) {
    return Bar.nextNote(id, this.bars());
  }
  public previousNote(id: ID) {
    return Bar.previousNote(id, this.bars());
  }
  public deletePage() {
    const stavesToDelete = this.brokenStaves()[this.numberOfPages - 1];
    if (stavesToDelete) {
      const first = stavesToDelete[0]?.firstBar() || null;
      const last = nlast(stavesToDelete)?.lastBar() || null;
      if (first && last) {
        const selection = new ScoreSelection(first.id, last.id);
        selection.delete(this);
      }
    }

    this.textBoxes[this.numberOfPages - 1] = [];
    this.numberOfPages--;
  }
  public deleteStave(stave: Stave) {
    // Deletes the stave from the score
    // Does not worry about purging notes/bars; that should be handled elsewhere

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
    return this._staves.flatMap((stave) => stave.allBars());
  }
  public staves() {
    return this._staves;
  }
  public lastStave() {
    return last(this._staves);
  }

  public location(id: ID) {
    // Finds the parent bar and stave of the note passed

    const staves = this.staves();

    if (staves.length === 0)
      throw Error('Tried to get location of a note, but there are no staves!');

    for (const stave of staves) {
      const bars = stave.allBars();
      for (const bar of bars) {
        if (bar.hasID(id)) {
          return { stave, bar };
        }
        const loc = bar.location(id);
        if (loc) return { stave, bar };
      }
    }

    const lastStaveBars = nlast(staves).allBars();
    return {
      stave: staves[staves.length - 1],
      bar: lastStaveBars[lastStaveBars.length - 1],
    };
  }

  public coordinateToStaveIndex(y: number): number | null {
    // Converts the y coordinate to the index of stave that the y coordinate lies in
    // If it is below 0, it returns 0; if it doesn't lie on any stave it returns null

    const offset = y + 4 * settings.lineGap - settings.topOffset;
    if (offset > 0 && offset % settings.staveGap <= 12 * settings.lineGap) {
      return Math.max(Math.floor(offset / settings.staveGap), 0);
    } else {
      return null;
    }
  }
  public deleteSecondTiming(secondTiming: SecondTiming) {
    this.secondTimings.splice(this.secondTimings.indexOf(secondTiming), 1);
  }
  public deleteTextBox(text: TextBox) {
    for (const p of this.textBoxes) {
      const i = p.indexOf(text);
      if (i > -1) p.splice(i, 1);
    }
  }
  public dragTextBox(text: TextBox, x: number, y: number, page: number) {
    if (page >= this.numberOfPages) return;
    if (this.textBoxes[page] || !this.textBoxes[page].includes(text)) {
      for (const page of this.textBoxes) {
        if (page.includes(text)) {
          page.splice(page.indexOf(text), 1);
        }
      }
      if (!this.textBoxes[page]) this.textBoxes[page] = [];
      this.textBoxes[page].push(text);
    }
    if (x < this.width() && x > 0 && y < this.height() && y > 0) {
      text.setCoords(x, y);
    }
  }
  public dragSecondTiming(
    secondTiming: DraggedSecondTiming,
    x: number,
    y: number
  ) {
    secondTiming.secondTiming.drag(
      secondTiming.dragged,
      x,
      y,
      this.secondTimings
    );
  }

  public purgeSecondTimings(items: Item[]) {
    const secondTimingsToDelete: SecondTiming[] = [];
    for (const item of items) {
      for (const st of this.secondTimings) {
        if (st.pointsTo(item.id)) secondTimingsToDelete.push(st);
      }
    }
    secondTimingsToDelete.forEach((t) => this.deleteSecondTiming(t));
  }
  public play() {
    return this._staves.flatMap((st, i) =>
      st.play(i === 0 ? null : this._staves[i - 1])
    );
  }
  public render(props: ScoreProps): V {
    const width = this.width();
    const height = this.height();

    const staveProps = (stave: Stave, index: number, pageIndex: number) => ({
      x: settings.margin,
      y: index * settings.staveGap + this.topGap(pageIndex),
      width: width - 2 * settings.margin,
      previousStave: this._staves[index - 1] || null,
      previousStaveY: this.staveY(stave, pageIndex),
      dispatch: props.dispatch,
      noteState: props.noteState,
      gracenoteState: props.gracenoteState,
    });

    const secondTimingProps = {
      staveStartX: settings.margin,
      staveEndX: width - settings.margin,
      selection: props.selection,
      staveGap: settings.staveGap,
      dispatch: props.dispatch,
    };
    const scoreSelectionProps = {
      staveStartX: settings.margin,
      staveEndX: width - settings.margin,
      staveGap: settings.staveGap,
    };

    const brokenStaves = this.brokenStaves();
    const texts = (i: number) => this.textBoxes[i] || [];

    return h(
      'div',
      foreach(this.numberOfPages, (i) =>
        svg(
          'svg',
          {
            width: (width * this.zoom) / 100,
            height: (height * this.zoom) / 100,
            viewBox: `0 0 ${width} ${height}`,
            class: i.toString(),
          },
          { mouseup: () => props.dispatch(mouseUp()) },
          [
            svg(
              'rect',
              { x: '0', y: '0', width: '100%', height: '100%', fill: 'white' },
              {
                mousedown: () => props.dispatch(clickBackground()),
                mouseover: () => props.dispatch(mouseOffPitch()),
              }
            ),
            ...brokenStaves[i].map((stave, idx) =>
              stave.render(staveProps(stave, idx, i))
            ),
            ...texts(i).map((textBox) =>
              textBox.render({
                dispatch: props.dispatch,
                scoreWidth: width,
                selection: props.selection,
              })
            ),
            ...this.secondTimings.map((secondTiming) =>
              secondTiming.render(secondTimingProps)
            ),
            props.selection && props.selection.render(scoreSelectionProps),
          ]
        )
      )
    );
  }
}
