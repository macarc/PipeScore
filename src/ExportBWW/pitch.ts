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

//  Convert Pitch to BWW text

import { Pitch } from '../PipeScore/global/pitch';

export function toBWWPitch(pitch: Pitch): string {
  switch (pitch) {
    case Pitch.G:
      return 'lg';
    case Pitch.A:
      return 'la';
    case Pitch.B:
      return 'b';
    case Pitch.C:
      return 'c';
    case Pitch.D:
      return 'd';
    case Pitch.E:
      return 'e';
    case Pitch.F:
      return 'f';
    case Pitch.HG:
      return 'hg';
    case Pitch.HA:
      return 'ha';
  }
}
