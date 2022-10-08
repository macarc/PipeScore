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

//  This pops up when a user creates a new score, to give them
//  a few default options to choose from.

import m from 'mithril';
import dialogueBox from './global/dialogueBox';
import { Score } from './Score';

import { TimeSignature } from './TimeSignature';

class ScoreOptions {
  name = 'Blank Score';
  composer = '';
  tuneType = '';
  numberOfParts = 4;
  repeatParts = true;
  timeSignature = new TimeSignature('cut time');

  toScore(): Score {
    return new Score(
      this.name,
      this.composer,
      this.tuneType,
      this.numberOfParts,
      this.repeatParts,
      this.timeSignature
    );
  }
}

export default async function blankForm(): Promise<ScoreOptions> {
  const form = await dialogueBox(
    [
      m('h1', { style: 'font-size: 2rem' }, 'Quick Start'),
      m('p', 'These values may all be changed later if necessary'),
      m('div[class=invisible-div]', [
        m('p', 'About:'),
        m('div', { class: 'quickstart-section quickstart-flex' }, [
          m('label', [
            'Title:',
            m('input[id=name]', {
              type: 'text',
              value: 'My Tune',
            }),
          ]),
          m('label', [
            'Composer:',
            m('input[id=composer]', {
              type: 'text',
              value: 'My name',
            }),
          ]),
          m('label', [
            'Tune type:',
            m('input[id=tune-type]', {
              type: 'text',
              value: 'March',
            }),
          ]),
        ]),
      ]),
      m('div[class=invisible-div]', [
        m('p', 'Parts:'),
        m('div[class=quickstart-section]', [
          m('label', [
            'Number:',
            m('input[id=stave-number]', {
              type: 'number',
              min: 0,
              max: 16,
              value: 2,
              required: true,
            }),
          ]),
          m('label', [
            m('input[id=repeat-parts]', { type: 'checkbox', checked: '' }),
            'Repeat parts?',
          ]),
        ]),
      ]),
      m('div[class=invisible-div]', [
        m('p', 'Time Signature:'),
        m('div', { class: 'quickstart-section quickstart-flex' }, [
          m('label', [
            'Time Signature:',
            m('div', { class: 'quickstart-time-signature' }, [
              m('input[id=num]', {
                type: 'number',
                min: 0,
                value: 2,
                style: 'display: block',
                required: true,
              }),
              m(
                'select[id=denom]',
                { style: 'display: block', name: 'denom' },
                [
                  m('option', { value: '4', name: 'denom' }, '4'),
                  m('option', { value: '2', name: 'denom' }, '2'),
                  m('option', { value: '8', name: 'denom' }, '8'),
                ]
              ),
            ]),
          ]),
          m('label', [
            m('input[id=cut-time]', { type: 'checkbox' }),
            'Cut time?',
          ]),
        ]),
      ]),
    ],
    false
  );
  const options = new ScoreOptions();
  if (form) {
    const nameElement = form.querySelector('#name');
    if (nameElement instanceof HTMLInputElement)
      options.name = nameElement.value;

    const composerElement = form.querySelector('#composer');
    if (composerElement instanceof HTMLInputElement)
      options.composer = composerElement.value;

    const tuneTypeElement = form.querySelector('#tune-type');
    if (tuneTypeElement instanceof HTMLInputElement)
      options.tuneType = tuneTypeElement.value;

    const partsElement = form.querySelector('#stave-number');
    if (partsElement instanceof HTMLInputElement)
      options.numberOfParts = parseInt(partsElement.value);

    const repeatElement = form.querySelector('#repeat-parts');
    if (repeatElement instanceof HTMLInputElement)
      options.repeatParts = repeatElement.checked;

    const numElement = form.querySelector('#num');
    const denomElement = form.querySelector('#denom');
    const cutTimeElement = form.querySelector('#cut-time');
    if (
      numElement instanceof HTMLInputElement &&
      denomElement instanceof HTMLSelectElement &&
      cutTimeElement instanceof HTMLInputElement
    )
      options.timeSignature = new TimeSignature(
        cutTimeElement.checked
          ? 'cut time'
          : [
              parseInt(numElement.value),
              TimeSignature.parseDenominator(denomElement.value) || 4,
            ]
      );
  }
  return options;
}
