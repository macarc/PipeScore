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

//  Documentation - explanations for the UI that are shown on hover.

import type { Documentation, TextItems } from '.';
import { getLanguage } from '../../common/i18n';
import { EnglishDocumentation, EnglishTextItems } from './English';
import { FrenchDocumentation, FrenchTextItems } from './French';

function getDocForSelectedLanguage(doc: keyof Documentation) {
  switch (getLanguage()) {
    case 'ENG':
      return EnglishDocumentation[doc];
    case 'FRA':
      return FrenchDocumentation[doc];
    default:
      return '';
  }
}

function getTextForSelectedLanguage(label: keyof TextItems) {
  switch (getLanguage()) {
    case 'ENG':
      return EnglishTextItems[label];
    case 'FRA':
      return FrenchTextItems[label];
    default:
      return '';
  }
}

export function helpText(label: keyof Documentation) {
  const helpText = getDocForSelectedLanguage(label) || EnglishDocumentation[label];
  return helpText.replaceAll(/\.\s?/g, '.\n\n');
}

export function text(label: keyof TextItems) {
  return getTextForSelectedLanguage(label) || EnglishTextItems[label];
}
