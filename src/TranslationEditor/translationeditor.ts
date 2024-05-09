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

import m from 'mithril';
import { Documentation } from '../PipeScore/Translations';
import { EnglishTranslation } from '../PipeScore/Translations/English';
import { FrenchTranslation } from '../PipeScore/Translations/French';

function redraw() {
  const root = document.getElementById('editor');
  if (root) m.render(root, generateForm());
}

let currentTranslation: Documentation | null = null;

function setCurrentTranslation(e: Event) {
  if ((e.target as HTMLOptionElement).value === 'FRA') {
    currentTranslation = FrenchTranslation;
  } else {
    currentTranslation = null;
  }

  redraw();
}

function generateForm() {
  const children = [];
  for (const sentence in EnglishTranslation) {
    const k = sentence as keyof Documentation;
    children.push(
      m('label.sentence', [
        EnglishTranslation[k],
        m(
          'textarea',
          {
            rows: 3,
            id: sentence,
          },
          currentTranslation && currentTranslation[k] !== EnglishTranslation[k]
            ? currentTranslation[k]
            : ''
        ),
      ])
    );
  }

  const headers = ['Login', 'Help', 'Contact', 'Donate', 'Source'];
  const scorePageButtons = [
    'New Score',
    'Import BWW File',
    'Import PipeScore File',
    'Sign Out',
    'Edit',
    'Rename',
    'Duplicate',
    'Delete',
  ];
  const pipescoreTabs = [
    'Note',
    'Gracenote',
    'Bar',
    'Second Timing',
    'Stave',
    'Tune',
    'Text',
    'Playback',
    'Document',
    'Settings',
    'Help',
  ];

  return m('form', { action: '', onclick: (e: Event) => e.preventDefault() }, [
    m('label', [
      'Choose translation to work on: ',
      m('select', { onchange: setCurrentTranslation }, [
        m(
          'option',
          {
            name: 'current-translation',
            value: 'FRA',
            selected: currentTranslation === FrenchTranslation,
          },
          'français'
        ),
        m(
          'option',
          {
            name: 'current-translation',
            value: '',
            selected: currentTranslation === null,
          },
          'blank'
        ),
      ]),
    ]),
    m('fieldset', [m('legend', 'Navigation headers'), ...headers]),
    m('fieldset', [m('legend', 'Help text'), ...children]),
    m('input', {
      type: 'submit',
      onclick: collectForm,
      value: 'Download Translation',
    }),
  ]);
}

function collectForm() {
  const translation = { ...EnglishTranslation };
  for (const sentence in EnglishTranslation) {
    const k = sentence as keyof Documentation;
    const el = document.querySelector(`textarea#${sentence}`);
    if (el instanceof HTMLTextAreaElement) {
      translation[k] = el.value.replace('\n', '');
    }
  }
  console.log(JSON.stringify(translation));
}

document.addEventListener('DOMContentLoaded', redraw);
