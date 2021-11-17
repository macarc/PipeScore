import { h, svg, V } from '../../render/h';
import { editTimeSignature } from '../Controllers/Bar';
import { Dispatch } from '../Controllers/Controller';
import dialogueBox from '../global/dialogueBox';
import { settings } from '../global/settings';
import { Obj } from '../global/utils';

/*
  TimeSignature format
  Copyright (C) 2021 macarc
*/
export type Denominator = 2 | 4 | 8;

interface TimeSignatureProps {
  x: number;
  y: number;
  dispatch: Dispatch;
}

export class TimeSignature {
  private ts: [number, Denominator] | 'cut time';
  private breaks: number[];

  constructor(ts?: [number, Denominator] | 'cut time', breaks: number[] = []) {
    this.ts = [2, 4];
    if (ts) this.ts = ts;
    this.breaks = breaks;
  }
  public static fromJSON(o: Obj) {
    return new TimeSignature(o.ts, o.breaks);
  }
  public toJSON() {
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

  public beatDivision(): (i: number) => number {
    // The number of beats in a group

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
  public edit(): Promise<TimeSignature> {
    // Makes a dialogue box for the user to edit the text, then updates the text

    const denominatorOption = (i: Denominator) =>
      h(
        'option',
        { value: i, name: 'denominator', selected: this.bottom() === i },
        [i.toString()]
      );

    return new Promise((res) =>
      dialogueBox(
        [
          h('input', {
            type: 'number',
            name: 'num',
            min: 1,
            value: this.top(),
          }),
          h('br'),
          h('select', { name: 'denominator' }, [
            denominatorOption(2),
            denominatorOption(4),
            denominatorOption(8),
          ]),
          h('label', [
            'Cut time ',
            h('input', { type: 'checkbox', checked: this.cutTime() }),
          ]),
          h('details', [
            h('summary', ['Advanced']),
            h('label', [
              'Custom grouping (the number of quavers in each group, separated by `,`)',
              h('input', {
                type: 'text',
                name: 'breaks',
                // Need to do \. for the pattern regex
                pattern: '^([1-9][0-9]*(,\\s*[1-9][0-9]*)*|())$',
                value: this.breaks.toString(),
              }),
            ]),
          ]),
        ],
        (form) => {
          try {
            const num = Math.max(
              parseInt(
                (form.querySelector('input[name = "num"]') as HTMLInputElement)
                  .value
              ),
              1
            );
            const denom = TimeSignature.parseDenominator(
              (form.querySelector('select') as HTMLSelectElement).value
            );
            const isCutTime = (
              form.querySelector('input[type="checkbox"]') as HTMLInputElement
            ).checked;
            const breaks = (
              form.querySelector('input[name="breaks"]') as HTMLInputElement
            ).value
              .split(/,\s*/)
              .filter((l) => l.length > 0)
              // map(parseInt) passes in the index as a radix :)
              // glad I new that already and didn't have to debug...
              .map((i) => parseInt(i));

            return (
              denom &&
              new TimeSignature(isCutTime ? 'cut time' : [num, denom], breaks)
            );
          } catch (e) {
            return this;
          }
        },
        this
      ).then((newTimeSignature) => res(newTimeSignature || this))
    );
  }
  public render(props: TimeSignatureProps): V {
    const y =
      props.y +
      (this.cutTime() ? settings.lineHeightOf(4) : settings.lineHeightOf(2));

    const edit = () =>
      this.edit().then((newTimeSignature) =>
        props.dispatch(editTimeSignature(this, newTimeSignature))
      );

    if (this.cutTime()) {
      return svg('g', { class: 'time-signature' }, [
        svg(
          'text',
          {
            style: 'font-family: serif; font-weight: bold;',
            'text-anchor': 'middle',
            x: props.x,
            y: y,
            'font-size': this.cutTimeFontSize(),
          },
          { click: edit },
          ['C']
        ),
      ]);
    } else {
      return svg('g', { class: 'time-signature' }, [
        svg(
          'text',
          {
            'text-anchor': 'middle',
            x: props.x,
            y,
            style: 'font-family: serif; font-weight: bold; cursor: pointer;',
            'font-size': this.fontSize(),
          },
          { click: edit },
          [this.top().toString()]
        ),
        svg(
          'text',
          {
            'text-anchor': 'middle',
            x: props.x,
            y: y + settings.lineHeightOf(2.1),
            style: 'font-family: serif; font-weight: bold; cursor: pointer;',
            'font-size': this.fontSize(),
          },
          { click: edit },
          [this.bottom().toString()]
        ),
      ]);
    }
  }
}
