/*
  This pops up when a user creates a new score, to give them a few default options to choose from.

  Copyright (C) 2021 macarc
*/
import { h } from '../render/h';
import dialogueBox from './global/dialogueBox';
import { Score } from './Score';

import { TimeSignature } from './TimeSignature';

class ScoreOptions {
  name: string = 'Blank Score';
  numberOfStaves: number = 4;
  timeSignature: TimeSignature = new TimeSignature('cut time');

  toScore(): Score {
    return new Score(this.name, this.numberOfStaves, this.timeSignature);
  }
}

const blankForm = async (): Promise<ScoreOptions> => {
  const ts = await dialogueBox(
    [
      h('h1', { style: 'font-size: 2rem' }, ['Quick Start']),
      h('p', ['These values may all be changed later if necessary']),
      h('label', [
        'Name:',
        h('input', { type: 'text', id: 'name', value: 'My Tune' }),
      ]),
      h('label', [
        'Number of Staves:',
        h('input', {
          type: 'number',
          id: 'stave-number',
          min: 0,
          max: 16,
          value: 4,
          required: true,
        }),
      ]),
      h('label', [
        'Time Signature:',
        h('input', {
          type: 'number',
          id: 'num',
          min: 0,
          value: 2,
          style: 'display: block',
          required: true,
        }),
        h('select', { style: 'display: block', id: 'denom', name: 'denom' }, [
          h('option', { value: '4', name: 'denom' }, ['4']),
          h('option', { value: '2', name: 'denom' }, ['2']),
          h('option', { value: '8', name: 'denom' }, ['8']),
        ]),
      ]),
      h('label', [
        h('input', { type: 'checkbox', id: 'cut-time' }),
        'Cut time?',
      ]),
    ],
    () => {
      const options = new ScoreOptions();
      const nameElement = document.getElementById('name');
      const stavesElement = document.getElementById('stave-number');
      const numElement = document.getElementById('num');
      const denomElement = document.getElementById('denom');
      const cutTimeElement = document.getElementById('cut-time');
      if (
        nameElement instanceof HTMLInputElement &&
        stavesElement instanceof HTMLInputElement &&
        numElement instanceof HTMLInputElement &&
        denomElement instanceof HTMLSelectElement &&
        cutTimeElement instanceof HTMLInputElement
      ) {
        options.name = nameElement.value;
        options.numberOfStaves = parseInt(stavesElement.value);
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
    },
    new ScoreOptions(),
    false
  );
  return ts;
};

export default blankForm;
