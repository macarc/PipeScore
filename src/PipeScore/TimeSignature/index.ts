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

import m from 'mithril';
import { dispatch } from '../Controller';
import { editTimeSignature } from '../Events/Bar';
import { settings } from '../global/settings';
import { edit } from './edit';
import { SavedTimeSignature } from '../SavedModel';

export type Denominator = 2 | 4 | 8;

interface TimeSignatureProps {
  x: number;
  y: number;
}

export type TimeSignatureType =
  | [number, Denominator]
  | 'cut time'
  | 'common time';

export class TimeSignature {
  private ts: TimeSignatureType;
  private breaks: number[];

  constructor(ts?: TimeSignatureType, breaks: number[] = []) {
    this.ts = [2, 4];
    if (ts) this.ts = ts;
    this.breaks = breaks;
  }
  public static fromJSON(o: SavedTimeSignature) {
    return new TimeSignature(o.ts, o.breaks);
  }
  public toJSON(): SavedTimeSignature {
    return { ts: this.ts, breaks: this.breaks };
  }
  public copy() {
    return new TimeSignature(this.ts, [...this.breaks]);
  }
  public width() {
    return 30;
  }
  public cutTimeFontSize() {
    return settings.lineHeightOf(6);
  }
  public fontSize() {
    return settings.lineHeightOf(5) / 1.6;
  }
  public breaksString() {
    return this.breaks.toString();
  }

  public numberOfBeats(): number {
    // The number of beats per bar
    switch (this.bottom()) {
      case 2:
        return 2;
      case 4:
        return this.top();
      case 8:
        return Math.ceil(this.top() / 3);
    }
  }

  public crotchetsPerBeat() {
    switch (this.bottom()) {
      case 2:
        return 2;
      case 4:
        return 1;
      case 8:
        return 1.5;
    }
  }

  // The number of beats in a group
  // Where n means the nth group in the bar
  public beatDivision(): (n: number) => number {
    return (i: number) => {
      if (i < this.breaks.length) {
        return this.breaks[i] / 2.0;
      }
      switch (this.bottom()) {
        case 2:
          return 2;
        case 4:
          return 1;
        case 8:
          return 1.5;
      }
    };
  }

  public static parseDenominator(text: string) {
    // Turns a string into a Denominator

    switch (text) {
      case '2':
        return 2;
      case '4':
        return 4;
      case '8':
        return 8;
      default:
        return null;
    }
  }

  public equals(ts: TimeSignature) {
    // Check if two time signatures are equal

    return this.top() === ts.top() && this.bottom() === ts.bottom();
  }

  public cutTime() {
    return this.ts === 'cut time';
  }
  public commonTime() {
    return this.ts === 'common time';
  }
  public top() {
    if (this.ts === 'cut time') {
      return 2;
    } else if (this.ts === 'common time') {
      return 4;
    }
    return this.ts[0];
  }
  public bottom() {
    if (this.ts === 'cut time') {
      return 2;
    } else if (this.ts === 'common time') {
      return 4;
    }
    return this.ts[1];
  }
  public edit() {
    return edit(this);
  }
  public render(props: TimeSignatureProps): m.Children {
    const edit = () =>
      this.edit().then((newTimeSignature) =>
        dispatch(editTimeSignature(this, newTimeSignature))
      );

    if (this.cutTime() || this.commonTime()) {
      const y = props.y + settings.lineHeightOf(4);
      const cutLineX = props.x;
      return m('g[class=time-signature]', [
        m(
          'text',
          {
            style: 'font-family: serif; font-weight: bold;',
            'text-anchor': 'middle',
            x: props.x,
            y: y,
            'font-size': this.cutTimeFontSize(),
            onclick: edit,
          },
          'C'
        ),
        this.cutTime()
          ? m('line', {
              x1: cutLineX,
              x2: cutLineX,
              y1: props.y - settings.lineHeightOf(0.7),
              y2: props.y + settings.lineHeightOf(4.5),
              stroke: 'black',
              'stroke-width': 4,
              'shape-rendering': 'crispEdges',
            })
          : null,
      ]);
    } else {
      const y = props.y + settings.lineHeightOf(2);
      return m('g[class=time-signature]', [
        m(
          'text',
          {
            'text-anchor': 'middle',
            x: props.x,
            y,
            style: 'font-family: serif; font-weight: bold; cursor: pointer;',
            'font-size': this.fontSize(),
            onclick: edit,
          },
          this.top().toString()
        ),
        m(
          'text',
          {
            'text-anchor': 'middle',
            x: props.x,
            y: y + settings.lineHeightOf(2.1),
            style: 'font-family: serif; font-weight: bold; cursor: pointer;',
            'font-size': this.fontSize(),
            onclick: edit,
          },
          this.bottom().toString()
        ),
      ]);
    }
  }
}
