/*
  This pops up when a user creates a new score, to give them a few default options to choose from.

  Copyright (C) 2021 macarc
*/
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

const blankForm = async (): Promise<ScoreOptions> => {
  const ts = await dialogueBox(
    [
      m('h1', { style: 'font-size: 2rem' }, 'Quick Start'),
      m('p', 'These values may all be changed later if necessary'),
      m('div[class=invisible-div]', [
        m('p', 'About:'),
        m('div', { class: 'quickstart-section quickstart-flex' }, [
          m('label', [
            'Title:',
            m('input', {
              type: 'text',
              id: 'name',
              value: 'My Tune',
            }),
          ]),
          m('label', [
            'Composer:',
            m('input', {
              type: 'text',
              id: 'composer',
              value: 'My name',
            }),
          ]),
          m('label', [
            'Tune type:',
            m('input', {
              type: 'text',
              id: 'tune-type',
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
              m('input', {
                type: 'number',
                id: 'num',
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
