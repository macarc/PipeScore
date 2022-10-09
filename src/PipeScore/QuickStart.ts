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
import { timeSignatureEditor } from './TimeSignature/edit';
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
    'Quick Start',
    [
      m('section', [
        m('h2', 'About:'),
        m('label', [
          'Title:',
          m('input#name', {
            type: 'text',
            value: 'My Tune',
          }),
        ]),
        m('label', [
          'Composer:',
          m('input#composer', {
            type: 'text',
            value: 'My name',
          }),
        ]),
        m('label', [
          'Tune type:',
          m('input#tune-type', {
            type: 'text',
            value: 'March',
          }),
        ]),
      ]),
      m('section', [
        m('h2', 'Parts:'),
        m('label', [
          'Number:',
          m('input#stave-number', {
            type: 'number',
            min: 0,
            max: 16,
            value: 2,
            required: true,
          }),
        ]),
        m('label', [
          m('input#repeat-parts', { type: 'checkbox', checked: '' }),
          'Repeat Parts',
        ]),
      ]),
      m('section', [
        m('h2', 'Time Signature:'),
        m('label', [timeSignatureEditor(new TimeSignature([2, 4]))]),
        m('label', [m('input#cut-time', { type: 'checkbox' }), 'Cut time']),
      ]),
    ],
    false,
    'These options can be changed later.',
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
