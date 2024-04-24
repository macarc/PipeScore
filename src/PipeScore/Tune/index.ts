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

import { SavedTune } from '../SavedModel';
import { IStave } from '../Stave';
import { Relative } from '../global/relativeLocation';

export abstract class ITune {
  abstract toJSON(): SavedTune;
  abstract staves(): IStave[]
  abstract addStave(nearStave: IStave | null, where: Relative): void;
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere
  abstract deleteStave(stave: IStave): void;
}
