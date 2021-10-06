/*
  This pops up when a user creates a new score, to give them a few default options to choose from.

  Copyright (C) 2021 Archie Maclean
*/
import { h } from '../render/h';
import dialogueBox from './global/dialogueBox';

import { TimeSignature } from './TimeSignature';

interface ScoreOptions {
  name: string;
  numberOfStaves: number;
  timeSignature: TimeSignature;
}

const defaultOptions: ScoreOptions = {
  name: 'Blank Score',
  numberOfStaves: 4,
  timeSignature: new TimeSignature('cut time'),
};
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
      const nameElement = document.getElementById('name');
      const stavesElement = document.getElementById('stave-number');
      const numElement = document.getElementById('num');
      const denomElement = document.getElementById('denom');
      const cutTimeElement = document.getElementById('cut-time');
      if (
        nameElement &&
        nameElement instanceof HTMLInputElement &&
        stavesElement &&
        stavesElement instanceof HTMLInputElement &&
        numElement &&
        numElement instanceof HTMLInputElement &&
        denomElement &&
        denomElement instanceof HTMLSelectElement &&
        cutTimeElement &&
        cutTimeElement instanceof HTMLInputElement
      ) {
        return {
          name: nameElement.value,
          numberOfStaves: parseInt(stavesElement.value),
          timeSignature: new TimeSignature(
            cutTimeElement.checked
              ? 'cut time'
              : [
                  parseInt(numElement.value),
                  TimeSignature.parseDenominator(denomElement.value) || 4,
                ]
          ),
        };
      }
      return defaultOptions;
    },
    defaultOptions,
    false
  );
  return ts;
};

export default blankForm;
