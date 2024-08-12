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

//  Preview interface - this is used for note and gracenote previews

import type { IBar } from '../Bar';
import type { INote } from '../Note';
import type { Pitch } from '../global/pitch';

export interface IPreview {
  // Returns true if the pitch changed
  setPitch(pitch: Pitch | null): boolean;
  // Returns true if the location changed
  setLocation(bar: IBar, noteBefore: INote | null, noteAfter: INote | null): boolean;
  stop(): void;
  makeReal(notes: INote[][]): void;
  justAdded(): boolean;
}
