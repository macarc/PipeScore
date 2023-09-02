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

// TODO: dottedHemiDemiSemiQuaver should probably be removed
// since if it is used it is impossible for its group to be correct
// unless used with another dottedHemiDemiSemiQuaver which is pretty unlikely
export const enum NoteLength {
  Semibreve = 'sb',
  DottedMinim = 'dm',
  Minim = 'm',
  DottedCrotchet = 'dc',
  Crotchet = 'c',
  DottedQuaver = 'dq',
  Quaver = 'q',
  DottedSemiQuaver = 'dsq',
  SemiQuaver = 'sq',
  DottedDemiSemiQuaver = 'dssq',
  DemiSemiQuaver = 'ssq',
  DottedHemiDemiSemiQuaver = 'dhdsq',
  HemiDemiSemiQuaver = 'hdsq',
}

export function isDotted(note: NoteLength): boolean {
  return [
    NoteLength.DottedMinim,
    NoteLength.DottedCrotchet,
    NoteLength.DottedQuaver,
    NoteLength.DottedSemiQuaver,
    NoteLength.DottedDemiSemiQuaver,
    NoteLength.DottedHemiDemiSemiQuaver,
  ].includes(note);
}

export const sameNoteLengthName = (a: NoteLength, b: NoteLength) =>
  a === b || a === dotLength(b);

export function lengthInBeats(length: NoteLength): number {
  switch (length) {
    case NoteLength.Semibreve:
      return 4;
    case NoteLength.DottedMinim:
      return 3;
    case NoteLength.Minim:
      return 2;
    case NoteLength.DottedCrotchet:
      return 1.5;
    case NoteLength.Crotchet:
      return 1;
    case NoteLength.DottedQuaver:
      return 0.75;
    case NoteLength.Quaver:
      return 0.5;
    case NoteLength.DottedSemiQuaver:
      return 0.375;
    case NoteLength.SemiQuaver:
      return 0.25;
    case NoteLength.DottedDemiSemiQuaver:
      return 0.1875;
    case NoteLength.DemiSemiQuaver:
      return 0.125;
    case NoteLength.DottedHemiDemiSemiQuaver:
      return 0.9375;
    case NoteLength.HemiDemiSemiQuaver:
      return 0.0625;
  }
}

export function dotLength(length: NoteLength): NoteLength {
  switch (length) {
    case NoteLength.Semibreve:
      return NoteLength.Semibreve;
    case NoteLength.DottedMinim:
      return NoteLength.Minim;
    case NoteLength.Minim:
      return NoteLength.DottedMinim;
    case NoteLength.DottedCrotchet:
      return NoteLength.Crotchet;
    case NoteLength.Crotchet:
      return NoteLength.DottedCrotchet;
    case NoteLength.DottedQuaver:
      return NoteLength.Quaver;
    case NoteLength.Quaver:
      return NoteLength.DottedQuaver;
    case NoteLength.DottedSemiQuaver:
      return NoteLength.SemiQuaver;
    case NoteLength.SemiQuaver:
      return NoteLength.DottedSemiQuaver;
    case NoteLength.DottedDemiSemiQuaver:
      return NoteLength.DemiSemiQuaver;
    case NoteLength.DemiSemiQuaver:
      return NoteLength.DottedDemiSemiQuaver;
    case NoteLength.DottedHemiDemiSemiQuaver:
      return NoteLength.HemiDemiSemiQuaver;
    case NoteLength.HemiDemiSemiQuaver:
      return NoteLength.DottedHemiDemiSemiQuaver;
  }
}
