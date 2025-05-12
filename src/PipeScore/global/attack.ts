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

import { unreachable } from './utils';

export enum Attack {
  Off = 0,
  QuickMarchAttack = 1,
  SlowMarchAttack = 2,
}

export function attackToString(attack: Attack): string {
  switch (attack) {
    case Attack.Off:
      return 'none';
    case Attack.QuickMarchAttack:
      return 'quick';
    case Attack.SlowMarchAttack:
        return 'slow';
      default:
      unreachable(attack);
  }
}

export function parseAttack(attack: string): Attack | null {
  switch (attack) {
    case 'none':
      return Attack.Off;
    case 'quick':
      return Attack.QuickMarchAttack;
    case 'slow':
        return Attack.SlowMarchAttack;
    default:
      return null;
  }
}
