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

//  Functionality for getting/setting user language

export type Language = 'ENG' | 'FRA';

export function setLanguage(event: Event) {
  if (event.target instanceof HTMLSelectElement) {
    if (event.target.value === 'ENG' || event.target.value === 'FRA')
      localStorage.setItem('lang', event.target.value);
  }
}

export function getLanguage() {
  const stored = localStorage.getItem('lang');

  if (stored) {
    return stored;
  }

  if (navigator.language === 'fr') {
    return 'FRA';
  }

  return 'ENG';
}
