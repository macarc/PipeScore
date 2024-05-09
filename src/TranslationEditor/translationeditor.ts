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
import { Documentation, TextItems } from '../PipeScore/Translations';
import {
  EnglishDocumentation,
  EnglishTextItems,
} from '../PipeScore/Translations/English';
import {
  FrenchDocumentation,
  FrenchTextItems,
} from '../PipeScore/Translations/French';
import { saveFile } from '../common/file';
import { Language } from '../common/i18n';

window.addEventListener('beforeunload', (event: Event) => {
    event.preventDefault();
    event.returnValue = true;
});

function redraw() {
  const root = document.getElementById('editor');
  if (root) m.render(root, generateForm());
}

let language: Language | null = null;

function setCurrentTranslation(e: Event) {
  if ((e.target as HTMLOptionElement).value === 'FRA') {
    language = 'FRA';
  } else {
    language = null;
  }

  redraw();
}

function currentDocumentation() {
  switch (language) {
    case 'FRA':
      return FrenchDocumentation;
    default:
      return null;
  }
}

function currentTextItems() {
  switch (language) {
    case 'FRA':
      return FrenchTextItems;
    default:
      return null;
  }
}

function generateTextAreasFromProps(
  o: Record<string, string> | null,
  default_: Record<string, string>,
  longform = false
) {
  const children = [];
  for (const sentence in default_) {
    const k = sentence as keyof Documentation;
    children.push(
      m('label.sentence', [
        default_[k],
        m(
          longform ? 'textarea' : 'input',
          {
            rows: 3,
            id: sentence,
          },
          o && o[k] !== default_[k] ? o[k] : ''
        ),
      ])
    );
  }
  return children;
}

function generateForm() {
  const documentationInputs = generateTextAreasFromProps(
    currentDocumentation(),
    EnglishDocumentation,
    true
  );
  const textItemInputs = generateTextAreasFromProps(
    currentTextItems(),
    EnglishTextItems
  );

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

  return m('form', { action: '', onclick: (e: Event) => e.preventDefault() }, [
    m('label', [
      'Choose translation to work on: ',
      m('select', { onchange: setCurrentTranslation }, [
        m(
          'option',
          {
            name: 'current-translation',
            value: 'FRA',
            selected: language === 'FRA',
          },
          'français'
        ),
        m(
          'option',
          {
            name: 'current-translation',
            value: '',
            selected: language === null,
          },
          'blank'
        ),
      ]),
    ]),
    m('fieldset', [m('legend', 'Help text'), ...documentationInputs]),
    m('fieldset', [m('legend', 'UI Buttons'), ...textItemInputs]),
    m('input', {
      type: 'submit',
      onclick: collectForm,
      value: 'Download Translation',
    }),
  ]);
}

function collectForm() {
  const documentation = { ...EnglishDocumentation };
  for (const sentence in EnglishDocumentation) {
    const k = sentence as keyof Documentation;
    const el = document.querySelector(`textarea#${sentence}`);
    if (el instanceof HTMLTextAreaElement) {
      documentation[k] = el.value.replace('\n', '');
    }
  }
  console.log(JSON.stringify(documentation));

  const textitems = { ...EnglishTextItems };
  for (const sentence in EnglishTextItems) {
    const k = sentence as keyof TextItems;
    const el = document.querySelector(`input#${sentence}`);
    if (el instanceof HTMLInputElement) {
      textitems[k] = el.value.replace('\n', '');
    }
  }
  console.log(JSON.stringify(textitems));

  saveFile('translation.json', `[${JSON.stringify(documentation)}, ${JSON.stringify(textitems)}]`, 'text/json');
}

document.addEventListener('DOMContentLoaded', redraw);
