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

import { TimeSignature, Denominator } from './index';
import dialogueBox from '../global/dialogueBox';
import m from 'mithril';

function textDialogue(ts: TimeSignature) {
  return [
    m('section', [
      timeSignatureEditor(ts),
      m('label', [
        m('input', { type: 'checkbox', checked: ts.cutTime() }),
        'Cut time ',
      ]),
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

export function timeSignatureEditor(ts: TimeSignature): m.Children {
  const denominatorOption = (i: Denominator) =>
    m(
      'option',
      { value: i, name: 'denominator', selected: ts.bottom() === i },
      i.toString()
    );

  return m('div.time-signature-editor', [
    m('input#num', {
      type: 'number',
      name: 'num',
      min: 1,
      value: ts.top(),
    }),
    m('select#denom', { name: 'denominator' }, [
      denominatorOption(2),
      denominatorOption(4),
      denominatorOption(8),
    ]),
  ]);
}

// Makes a dialogue box for the user to edit the text, then updates the text
export async function edit(ts: TimeSignature): Promise<TimeSignature> {
  const form = await dialogueBox('Edit Time Signature', textDialogue(ts));
  let newTimeSignature: TimeSignature = ts;

  if (form) {
    const numInput = form.querySelector('input[name = "num"]');
    const denomInput = form.querySelector('select');
    const cutTimeInput = form.querySelector('input[type="checkbox"]');
    const breaksInput = form.querySelector('input[name="breaks"]');

    if (
      numInput instanceof HTMLInputElement &&
      denomInput instanceof HTMLSelectElement &&
      cutTimeInput instanceof HTMLInputElement &&
      breaksInput instanceof HTMLInputElement
    ) {
      const num = Math.max(parseInt(numInput.value), 1);
      const denom = TimeSignature.parseDenominator(denomInput.value);
      const isCutTime = cutTimeInput.checked;
      const breaks = breaksInput.value
        .split(/,\s*/)
        .filter((l) => l.length > 0)
        // map(parseInt) passes in the index as a radix :)
        // glad I knew that already and didn't have to debug...
        .map((i) => parseInt(i));

      if (denom)
        newTimeSignature = new TimeSignature(
          isCutTime ? 'cut time' : [num, denom],
          breaks
        );
    }
  }
  return newTimeSignature;
}
