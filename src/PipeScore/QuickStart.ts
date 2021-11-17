/*
  This pops up when a user creates a new score, to give them a few default options to choose from.

  Copyright (C) 2021 macarc
*/
import { h } from '../render/h';
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

const blankForm = async (): Promise<ScoreOptions> => {
  const ts = await dialogueBox(
    [
      h('h1', { style: 'font-size: 2rem' }, ['Quick Start']),
      h('p', ['These values may all be changed later if necessary']),
      h('div', { class: 'invisible-div' }, [
        h('p', ['About:']),
        h('div', { class: 'quickstart-section quickstart-flex' }, [
          h('label', [
            'Title:',
            h('input', {
              type: 'text',
              id: 'name',
              value: 'My Tune',
            }),
          ]),
          h('label', [
            'Composer:',
            h('input', {
              type: 'text',
              id: 'composer',
              value: 'My name',
            }),
          ]),
          h('label', [
            'Tune type:',
            h('input', {
              type: 'text',
              id: 'tune-type',
              value: 'March',
            }),
          ]),
        ]),
      ]),
      h('div', { class: 'invisible-div' }, [
        h('p', ['Parts:']),
        h('div', { class: 'quickstart-section' }, [
          h('label', [
            'Number:',
            h('input', {
              type: 'number',
              id: 'stave-number',
              min: 0,
              max: 16,
              value: 2,
              required: true,
            }),
          ]),
          h('label', [
            h('input', { type: 'checkbox', id: 'repeat-parts', checked: '' }),
            'Repeat parts?',
          ]),
        ]),
      ]),
      h('div', { class: 'invisible-div' }, [
        h('p', ['Time Signature:']),
        h('div', { class: 'quickstart-section quickstart-flex' }, [
          h('label', [
            'Time Signature:',
            h('div', { class: 'quickstart-time-signature' }, [
              h('input', {
                type: 'number',
                id: 'num',
                min: 0,
                value: 2,
                style: 'display: block',
                required: true,
              }),
              h(
                'select',
                { style: 'display: block', id: 'denom', name: 'denom' },
                [
                  h('option', { value: '4', name: 'denom' }, ['4']),
                  h('option', { value: '2', name: 'denom' }, ['2']),
                  h('option', { value: '8', name: 'denom' }, ['8']),
                ]
              ),
            ]),
          ]),
          h('label', [
            h('input', { type: 'checkbox', id: 'cut-time' }),
            'Cut time?',
          ]),
        ]),
      ]),
    ],
    () => {
      const options = new ScoreOptions();
      const nameElement = document.getElementById('name');
      const composerElement = document.getElementById('composer');
      const tuneTypeElement = document.getElementById('tune-type');
      const partsElement = document.getElementById('stave-number');
      const repeatElement = document.getElementById('repeat-parts');
      const numElement = document.getElementById('num');
      const denomElement = document.getElementById('denom');
      const cutTimeElement = document.getElementById('cut-time');
      if (
        nameElement instanceof HTMLInputElement &&
        composerElement instanceof HTMLInputElement &&
        tuneTypeElement instanceof HTMLInputElement &&
        partsElement instanceof HTMLInputElement &&
        repeatElement instanceof HTMLInputElement &&
        numElement instanceof HTMLInputElement &&
        denomElement instanceof HTMLSelectElement &&
        cutTimeElement instanceof HTMLInputElement
      ) {
        options.name = nameElement.value;
        options.composer = composerElement.value;
        options.tuneType = tuneTypeElement.value;
        options.numberOfParts = parseInt(partsElement.value);
        options.repeatParts = repeatElement.checked;
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
