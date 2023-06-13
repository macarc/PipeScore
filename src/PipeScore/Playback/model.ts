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

import { ID } from '../global/id';
import { Pitch } from '../global/pitch';

export class PlaybackObject {
  type: 'object-start' | 'object-end';
  id: ID;

  constructor(position: 'start' | 'end', id: ID) {
    this.type = position === 'start' ? 'object-start' : 'object-end';
    this.id = id;
  }
}

export class PlaybackNote {
  type = 'note' as const;
  pitch: Pitch;
  tied: boolean;
  duration: number;

  constructor(pitch: Pitch, tied: boolean, duration: number) {
    this.pitch = pitch;
    this.tied = tied;
    this.duration = duration;
  }
}

export class PlaybackGracenote {
  type = 'gracenote' as const;
  pitch: Pitch;

  constructor(pitch: Pitch) {
    this.pitch = pitch;
  }
}

export class PlaybackRepeat {
  type: 'repeat-start' | 'repeat-end';

  constructor(position: 'start' | 'end') {
    this.type = position === 'start' ? 'repeat-start' : 'repeat-end';
  }
}

export type Playback =
  | PlaybackObject
  | PlaybackRepeat
  | PlaybackNote
  | PlaybackGracenote;

export class PlaybackSecondTiming {
  start: number;
  middle: number;
  end: number;

  constructor(start: number, middle: number, end: number) {
    this.start = start;
    this.middle = middle;
    this.end = end;
  }
  in(index: number) {
    return this.start <= index && index <= this.end;
  }
  shouldDeleteElement(index: number, repeating: boolean) {
    if (repeating) {
      return this.start <= index && index <= this.middle;
    } else {
      return this.middle <= index && index <= this.end;
    }
  }
}
