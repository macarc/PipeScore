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

//  Utilities for checking browser status

type SafariWindow = Window & { safari: boolean };

export function onSafari() {
  return (window as unknown as SafariWindow).safari !== undefined;
}

export function onMobile() {
  return !matchMedia('(pointer:fine)').matches;
}

export function dipIfOnMobile() {
  if (onMobile()) {
    alert('You cannot create or edit scores on mobile, only view them. Sorry!');
    window.location.replace('/scores');
  }
}
