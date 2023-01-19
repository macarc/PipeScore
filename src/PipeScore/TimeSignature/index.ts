//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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

export class TimeSignature {
  private ts: [number, Denominator] | 'cut time';
  private breaks: number[];

  constructor(ts?: [number, Denominator] | 'cut time', breaks: number[] = []) {
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
    switch (this.ts) {
      case 'cut time':
        return 2;
      default:
        switch (this.bottom()) {
          case 2:
            return 2;
          case 4:
            return this.top();
          case 8:
            return Math.ceil(this.top() / 3);
        }
    }
  }

  // The number of beats in a group
  // Where n means the nth group in the bar
  public beatDivision(): (n: number) => number {
    return (i: number) => {
      if (i < this.breaks.length) {
        return this.breaks[i] / 2.0;
      }
      switch (this.ts) {
        case 'cut time':
          return 2;
        default:
          switch (this.bottom()) {
            case 2:
              return 2;
            case 4:
              return 1;
            case 8:
              return 1.5;
          }
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
  public top() {
    return this.ts === 'cut time' ? 2 : this.ts[0];
  }
  public bottom() {
    return this.ts === 'cut time' ? 2 : this.ts[1];
  }
  public edit() {
    return edit(this);
  }
  public render(props: TimeSignatureProps): m.Children {
    const y =
      props.y +
      (this.cutTime() ? settings.lineHeightOf(4) : settings.lineHeightOf(2));

    const edit = () =>
      this.edit().then((newTimeSignature) =>
        dispatch(editTimeSignature(this, newTimeSignature))
      );

    if (this.cutTime()) {
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
      ]);
    } else {
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
