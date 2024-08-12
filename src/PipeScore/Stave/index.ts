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

import type { IBar } from '../Bar';
import type { IMeasure } from '../Measure';
import type { INote } from '../Note';
import type { Playback } from '../Playback';
import type { SavedStave } from '../SavedModel';
import type { ID } from '../global/id';
import type { Relative } from '../global/relativeLocation';

export abstract class IStave {
  abstract toJSON(): SavedStave;
  abstract height(): number;
  abstract numberOfHarmonyParts(): number;
  abstract addHarmony(): void;
  abstract removeHarmony(): void;
  abstract numberOfMeasures(): number;
  abstract prependMeasure(measure: IMeasure): void;
  abstract appendMeasure(measure: IMeasure): void;
  abstract insertMeasure(
    relativeTo: IMeasure,
    where: Relative,
    anacrusis: boolean
  ): void;
  abstract deleteMeasure(measure: IMeasure): void;
  abstract containsID(id: ID): boolean;
  abstract firstMeasure(): IMeasure | null;
  abstract lastMeasure(): IMeasure | null;
  abstract measures(): IMeasure[];
  abstract previousNote(id: ID): INote | null;
  abstract previousBar(bar: IBar): IBar | null;
  abstract partFirst(): void;
  abstract partLast(): void;
  abstract repeatFirst(): void;
  abstract repeatLast(): void;
  abstract play(previous: IStave | null): Playback[];
}
