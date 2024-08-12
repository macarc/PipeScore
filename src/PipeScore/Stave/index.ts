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

//  A Stave is a single line of music.

import type { IMeasure } from '../Bar';
import type { INote } from '../Note';
import type { Playback } from '../Playback';
import type { SavedStave } from '../SavedModel';
import type { ID } from '../global/id';
import type { Relative } from '../global/relativeLocation';

export abstract class IStave {
  abstract toJSON(): SavedStave;
  abstract height(): number;
  abstract numberOfParts(): number;
  abstract numberOfMeasures(): number;
  abstract prependMeasure(measure: IMeasure): void;
  abstract appendMeasure(measure: IMeasure): void;
  abstract insertMeasure(newMeasure: IMeasure, relativeTo: IMeasure, where: Relative): void;
  abstract deleteMeasure(measure: IMeasure): void;
  abstract includesID(id: ID): boolean;
  abstract firstMeasure(): IMeasure | null;
  abstract lastMeasure(): IMeasure | null;
  abstract measures(): IMeasure[];
  abstract previousNote(id: ID): INote | null;
  abstract previousMeasure(measure: IMeasure): IMeasure | null;
  abstract partFirst(): void;
  abstract partLast(): void;
  abstract repeatFirst(): void;
  abstract repeatLast(): void;
  abstract play(previous: IStave | null): Playback[];
}
