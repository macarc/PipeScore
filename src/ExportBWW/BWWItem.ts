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

//  BWWItem represents an atom (from the point of view of the BWW format)

import { Barline } from '../PipeScore/Barline';
import { Duration, NoteLength } from '../PipeScore/Note/notelength';
import { ShortBeamDirection } from '../PipeScore/Note/noteview';
import { Pitch } from '../PipeScore/global/pitch';
import { gracenoteToBWW } from './gracenotes';
import { toBWWPitch } from './pitch';

export abstract class BWWItem {
  abstract generate(): string;
}

export class BClef extends BWWItem {
  generate(): string {
    return '\n& sharpf sharpc';
  }
}

export class BTerminatingBarline extends BWWItem {
  generate(): string {
    return '!t';
  }
}

export class BBarline extends BWWItem {
  type: Barline;
  start: boolean;

  constructor(type: Barline, start: boolean) {
    super();
    this.type = type;
    this.start = start;
  }

  generate(): string {
    switch (this.type) {
      case Barline.part:
        return this.start ? '\nI!' : '!I';
      case Barline.repeat:
        return this.start ? "\nI!''" : "''!I";
      default:
        return this.start ? '\n!' : '!';
    }
  }
}

export class BGracenote extends BWWItem {
  pitches: Pitch[];

  constructor(pitches: Pitch[]) {
    super();
    this.pitches = pitches;
  }

  generate(): string {
    return gracenoteToBWW(this.pitches);
  }
}

export class BNote extends BWWItem {
  pitch: Pitch;
  length: NoteLength;
  tail: ShortBeamDirection;

  constructor(pitch: Pitch, length: NoteLength, tail: ShortBeamDirection) {
    super();
    this.pitch = pitch;
    this.length = length;
    this.tail = tail;
  }

  generate(): string {
    let bww = toBWWPitch(this.pitch).toUpperCase();

    switch (this.tail) {
      case ShortBeamDirection.Left:
        bww += 'l';
        break;
      case ShortBeamDirection.Right:
        bww += 'r';
        break;
    }

    switch (this.length.duration()) {
      case Duration.Semibreve:
        bww += '_1';
        break;
      case Duration.Minim:
      case Duration.DottedMinim:
        bww += '_2';
        break;
      case Duration.Crotchet:
      case Duration.DottedCrotchet:
        bww += '_4';
        break;
      case Duration.Quaver:
      case Duration.DottedQuaver:
        bww += '_8';
        break;
      case Duration.SemiQuaver:
      case Duration.DottedSemiQuaver:
        bww += '_16';
        break;
      case Duration.DemiSemiQuaver:
      case Duration.DottedDemiSemiQuaver:
        bww += '_32';
        break;
      default:
        throw new Error(
          `Cannot convert duration to BWW format: ${this.length.duration()}`
        );
    }

    if (this.length.hasDot()) {
      bww += ` '${toBWWPitch(this.pitch)}`;
    }

    return bww;
  }
}
