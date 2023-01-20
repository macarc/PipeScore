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

//  A Stave is a single line of music.

import m from 'mithril';
import { Bar } from '../Bar';
import { Barline } from '../Bar/barline';
import { settings } from '../global/settings';
import { ID } from '../global/id';
import { first, foreach, last, nlast } from '../global/utils';
import { GracenoteState } from '../Gracenote/state';
import { NoteState } from '../Note/state';
import { TimeSignature } from '../TimeSignature';
import { SavedStave } from '../SavedModel';

interface StaveProps {
  x: number;
  y: number;
  width: number;
  justAddedNote: boolean;
  previousStaveY: number;
  previousStave: Stave | null;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

export const trebleClefWidth = 40;

export class Stave {
  private _bars: Bar[];
  constructor(timeSignature = new TimeSignature()) {
    this._bars = [
      new Bar(timeSignature),
      new Bar(timeSignature),
      new Bar(timeSignature),
      new Bar(timeSignature),
    ];
  }
  public static fromJSON(o: SavedStave) {
    const st = new Stave();
    st._bars = o.bars.map(Bar.fromJSON);
    return st;
  }
  public toJSON(): SavedStave {
    return {
      bars: this._bars.map((bar) => bar.toJSON()),
    };
  }
  public static minHeight() {
    // Almost exactly the height of the treble clef
    return settings.lineHeightOf(10);
  }
  public numberOfBars() {
    return this._bars.length;
  }
  public insertBar(bar: Bar) {
    this._bars.unshift(bar);
    bar.fixedWidth = 'auto';
  }
  public appendBar(bar: Bar) {
    this._bars.push(bar);
    bar.fixedWidth = 'auto';
  }
  public deleteBar(bar: Bar) {
    const index = this._bars.indexOf(bar);
    this._bars.splice(index, 1);
    if (index === this._bars.length && this._bars.length > 0)
      nlast(this._bars).fixedWidth = 'auto';
  }
  public firstBar() {
    return first(this._bars);
  }
  public lastBar() {
    return last(this._bars);
  }
  public bars() {
    return this._bars;
  }
  public previousNote(id: ID) {
    return Bar.previousNote(id, this.bars());
  }
  public previousBar(bar: Bar) {
    return this._bars[this._bars.indexOf(bar) - 1] || null;
  }

  public partFirst() {
    this.firstBar()?.setBarline('start', Barline.part);
  }
  public partLast() {
    this.lastBar()?.setBarline('end', Barline.part);
  }

  public repeatFirst() {
    this.firstBar()?.setBarline('start', Barline.repeat);
  }
  public repeatLast() {
    this.lastBar()?.setBarline('end', Barline.repeat);
  }

  public replaceBar(newBar: Bar, oldBar: Bar, before: boolean) {
    const barInd = this._bars.indexOf(oldBar);
    const ind = before ? barInd : barInd + 1;
    this._bars.splice(ind, 0, newBar);
  }
  public play(previous: Stave | null) {
    return this._bars.flatMap((b, i) =>
      b.play(i === 0 ? previous && previous.lastBar() : this._bars[i - 1])
    );
  }
  // The algorithm for computing bar widths is thusly:
  // - Ignoring anacruses, work out the average bar width
  // - Each anacruses should be its .anacrusisWidth()
  // - Each fixedWidth bar m (i.e. each bar where the barline has been dragged
  //   by the user) should have width m.fixedWidth, and the next non-fixedWidth
  //   bar should be longer by the difference between m.fixedWidth and the average
  //   bar width
  // The reason we can't ignore fixedWidth bars when computing average bar width
  // is that when dragging the barline of a bar, the other barlines shouldn't move

  // Returns a list where the pixel width at the nth index is that of the nth bar
  public computeBarWidths(
    staveWidth: number,
    previousBar: (i: number) => Bar | null
  ): number[] {
    const anacruses = this._bars.filter((bar) => bar.isAnacrusis);
    const totalAnacrusisWidth = anacruses.reduce(
      (width, bar, i) => width + bar.anacrusisWidth(previousBar(i)),
      0
    );
    const averageBarWidth =
      (staveWidth - trebleClefWidth - totalAnacrusisWidth) /
      (this._bars.length - anacruses.length);

    const widths: number[] = [];
    let extraWidth = 0;

    this._bars.forEach((bar, i) => {
      if (bar.isAnacrusis) {
        widths.push(bar.anacrusisWidth(previousBar(i)));
      } else if (bar.fixedWidth !== 'auto') {
        widths.push(bar.fixedWidth);
        extraWidth += bar.fixedWidth - averageBarWidth;
      } else {
        widths.push(averageBarWidth - extraWidth);
        extraWidth = 0;
      }
    });

    return widths;
  }
  public renderTrebleClef(x: number, y: number) {
    const scale = (0.08 / 35) * settings.lineHeightOf(5);
    return m(
      'g',
      {
        transform: `translate(${x + 5} ${
          y - 25 - (scale - 0.08) * 300
        }) scale(${scale})`,
      },
      m(
        'g',
        { transform: 'matrix(.21599 0 0 .21546 -250.44 -1202.6)' },
        m('path', {
          d: 'm2002 7851c-61 17-116 55-167 113-51 59-76 124-76 194 0 44 15 94 44 147 29 54 73 93 130 118 19 4 28 14 28 28 0 5-7 10-24 14-91-23-166-72-224-145-58-74-88-158-90-254 3-103 34-199 93-287 60-89 137-152 231-189l-69-355c-154 128-279 261-376 401-97 139-147 290-151 453 2 73 17 144 45 212 28 69 70 131 126 188 113 113 260 172 439 178 61-4 126-15 196-33l-155-783zm72-10l156 769c154-62 231-197 231-403-9-69-29-131-63-186-33-56-77-100-133-132s-119-48-191-48zm-205-1040c33-20 71-55 112-104 41-48 81-105 119-169 39-65 70-131 93-198 23-66 34-129 34-187 0-25-2-50-7-72-4-36-15-64-34-83-19-18-43-28-73-28-60 0-114 37-162 111-37 64-68 140-90 226-23 87-36 173-38 260 5 99 21 180 46 244zm-63 58c-45-162-70-327-75-495 1-108 12-209 33-303 20-94 49-175 87-245 37-70 80-123 128-159 43-32 74-49 91-49 13 0 24 5 34 14s23 24 39 44c119 169 179 373 179 611 0 113-15 223-45 333-29 109-72 213-129 310-58 98-126 183-205 256l81 394c44-5 74-9 91-9 76 0 144 16 207 48s117 75 161 130c44 54 78 116 102 186 23 70 36 143 36 219 0 118-31 226-93 323s-155 168-280 214c8 49 22 120 43 211 20 92 35 165 45 219s14 106 14 157c0 79-19 149-57 211-39 62-91 110-157 144-65 34-137 51-215 51-110 0-206-31-288-92-82-62-126-145-130-251 3-47 14-91 34-133s47-76 82-102c34-27 75-41 122-44 39 0 76 11 111 32 34 22 62 51 83 88 20 37 31 78 31 122 0 59-20 109-60 150s-91 62-152 62h-23c39 60 103 91 192 91 45 0 91-10 137-28 47-19 86-44 119-76s55-66 64-102c17-41 25-98 25-169 0-48-5-96-14-144-9-47-23-110-42-188-19-77-33-137-41-178-60 15-122 23-187 23-109 0-212-22-309-67s-182-107-256-187c-73-80-130-170-171-272-40-101-61-207-62-317 4-102 23-200 59-292 36-93 82-181 139-263s116-157 177-224c62-66 143-151 245-254z',
          stroke: 'black',
          'stroke-width': '53.022',
          fill: 'black',
        })
      )
    );
  }
  public render(props: StaveProps): m.Children {
    const staveY = props.y;

    const staveLines = foreach(5, (idx) => settings.lineHeightOf(idx) + staveY);

    const previousBar = (barIdx: number) =>
      barIdx === 0
        ? props.previousStave && props.previousStave.lastBar()
        : this._bars[barIdx - 1] || null;

    const widths = this.computeBarWidths(props.width, previousBar);
    const width = (index: number) => widths[index];
    const getX = (barIdx: number) =>
      this._bars
        .slice(0, barIdx)
        .reduce((soFar, _, i) => soFar + width(i), props.x + trebleClefWidth);

    const barProps = (bar: Bar, index: number) => ({
      x: getX(index),
      y: staveY,
      width: width(index),
      previousBar: previousBar(index),
      justAddedNote: props.justAddedNote,
      shouldRenderLastBarline: this._bars[index + 1]
        ? this._bars[index + 1].timeSignature().equals(bar.timeSignature())
        : true,
      mustNotRenderFirstBarline: index === 0 && bar.isAnacrusis,
      endOfLastStave: props.x + props.width, // width should always be the same
      noteState: props.noteState,
      gracenoteState: props.gracenoteState,
      resize: (widthChange: number) => {
        const next = this._bars[index + 1];
        if (next) {
          if (next.fixedWidth !== 'auto') next.fixedWidth -= widthChange;
          return true;
        }
        return false;
      },
    });

    return m('g[class=stave]', [
      this.renderTrebleClef(props.x, props.y),
      m(
        'g[class=bars]',
        this._bars.map((bar, idx) => bar.render(barProps(bar, idx)))
      ),
      m(
        'g[class=stave-lines]',
        staveLines.map((y) =>
          m('line', {
            x1: props.x,
            x2: props.x + props.width,
            y1: y,
            y2: y,
            stroke: 'black',
            'pointer-events': 'none',
          })
        )
      ),
    ]);
  }
}
