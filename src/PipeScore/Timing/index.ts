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

//  Timings include:
//  - second timings - with two parts
//  - single timings - has one part

import { Playback, PlaybackSecondTiming } from '../Playback';
import { SavedTiming } from '../SavedModel';
import { ID } from '../global/id';

export type TimingPart = 'start' | 'middle' | 'end';

export type TimingLine = {
  start: ID;
  end: ID;
  text: string;
  part(first: boolean): TimingPart;
  drawUntilAfterEnd: boolean;
};

export abstract class ITiming {
  abstract toJSON(): SavedTiming;
  abstract pointsTo(id: ID): boolean;
  abstract drag(
    part: TimingPart,
    x: number,
    y: number,
    page: number,
    others: ITiming[]
  ): void;
  abstract editText(): Promise<void>;
  abstract lines(): TimingLine[];
  // Checks that there is no overlap, either with itself or with
  // the other timings in the array
  abstract noOverlap(others: ITiming[]): boolean;
  // Returns true if the timing is pointing to something that doesn't exist
  // This only works if it is called after the score is drawn! i.e. directly before
  // clearXY
  abstract isDangling(): boolean;
  abstract play(elements: Playback[]): PlaybackSecondTiming | null;
}
