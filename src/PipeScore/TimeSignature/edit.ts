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

//  The pop-up for editing a time signature that displays after clicking it.

import m from 'mithril';
import dialogueBox from '../global/dialogueBox';
import { TimeSignature } from './impl';
import { Denominator, ITimeSignature, parseDenominator } from './index';

export function timeSignatureEditor(ts: ITimeSignature): m.Children {
  const denominatorOption = (i: Denominator) =>
    m(
      'option',
      { value: i, name: 'denominator', selected: ts.bottom() === i },
      i.toString()
    );

  return m('div.time-signature-editor', [
    m('input#num', {
      type: 'number',
      name: 'numerator',
      min: 1,
      value: ts.top(),
    }),
    m('select#denom', { name: 'denominator' }, [
      denominatorOption(2),
      denominatorOption(4),
      denominatorOption(8),
    ]),
    m('div.ts-type', [
      m('label', [
        m('input', {
          type: 'radio',
          name: 'ts',
          value: 'normal',
          checked: !ts.commonTime() && !ts.cutTime(),
        }),
        'Normal',
      ]),
      m('label', [
        m('input', {
          type: 'radio',
          name: 'ts',
          value: 'common time',
          checked: ts.commonTime(),
        }),
        'Common time',
      ]),
      m('label', [
        m('input', {
          type: 'radio',
          name: 'ts',
          value: 'cut time',
          checked: ts.cutTime(),
        }),
        'Cut time',
      ]),
    ]),
  ]);
}

function textDialogue(ts: ITimeSignature) {
  return [
    m('section', [
      timeSignatureEditor(ts),
      m('details', [
        m('summary', 'Advanced'),
        m('label', [
          'Custom grouping (See ',
          m('a[href=/help#time-signatures]', 'help page'),
          ')',
          m('input', {
            type: 'text',
            name: 'breaks',
            // Need to do \. for the pattern regex
            pattern: '^([1-9][0-9]*(,\\s*[1-9][0-9]*)*|())$',
            value: ts.breaksString(),
          }),
        ]),
      ]),
    ]),
  ];
}

// Makes a dialogue box for the user to edit the text, then updates the text
export async function timeSignatureEditDialog(
  ts: ITimeSignature
): Promise<ITimeSignature> {
  const form = await dialogueBox('Edit Time Signature', textDialogue(ts));

  if (form) {
    const data = Object.fromEntries(new FormData(form));

    const breaks = data.breaks
      .toString()
      .split(/,\s*/)
      .filter((l) => l.length > 0)
      // map(parseInt) passes in the index as a radix :)
      // glad I knew that already and didn't have to debug...
      .map((i) => parseInt(i));

    if (data.ts === 'normal') {
      const num = Math.max(parseInt(data.numerator.toString()), 1);
      const denom = parseDenominator(data.denominator.toString());
      if (num && denom) return new TimeSignature([num, denom], breaks);
    } else if (data.ts === 'cut time' || data.ts === 'common time') {
      return new TimeSignature(data.ts, breaks);
    }
  }
  return ts;
}
