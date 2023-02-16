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
          m('input', {
            type: 'text',
            name: 'tune-name',
            value: 'My Tune',
          }),
        ]),
        m('label', [
          'Composer:',
          m('input', {
            type: 'text',
            name: 'composer',
            value: 'My name',
          }),
        ]),
        m('label', [
          'Tune type:',
          m('input', {
            type: 'text',
            name: 'tune-type',
            value: 'March',
          }),
        ]),
      ]),
      m('section', [
        m('h2', 'Parts:'),
        m('label', [
          'Number:',
          m('input', {
            type: 'number',
            name: 'stave-number',
            min: 0,
            max: 16,
            value: 2,
            required: true,
          }),
        ]),
        m('label', [
          m('input', { type: 'checkbox', name: 'repeat-parts', checked: '' }),
          'Repeat Parts',
        ]),
      ]),
      m('section', [
        m('h2', 'Time Signature:'),
        timeSignatureEditor(new TimeSignature([2, 4])),
      ]),
    ],
    false,
    'These options can be changed later.',
    false
  );
  const options = new ScoreOptions();
  if (form) {
    const data = Object.fromEntries(new FormData(form));
    if (data['tune-name']) options.name = data['tune-name'].toString();

    if (data.composer) options.composer = data.composer.toString();

    if (data['tune-type']) options.tuneType = data['tune-type'].toString();

    if (data['stave-number'])
      options.numberOfParts = parseInt(data['stave-number'].toString());

    if (data['repeat-parts'])
      options.repeatParts = data['repeat-parts'] === 'on';

    if (data.ts === 'common time' || data.ts === 'cut time') {
      options.timeSignature = new TimeSignature(data.ts);
    } else {
      options.timeSignature = new TimeSignature([
        parseInt(data.numerator.toString()),
        TimeSignature.parseDenominator(data.denominator.toString()) || 4,
      ]);
    }
  }
  return options;
}
