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

//  Keeps the user language in sync with the selected user language.

import { getLanguage, setLanguage } from '../common/i18n';

document.addEventListener('DOMContentLoaded', () => {
  const language = getLanguage();

  document
    .querySelector(`option[value="${language}"]`)
    ?.setAttribute('selected', '');
  document.querySelector('select')?.addEventListener('change', setLanguage);
});