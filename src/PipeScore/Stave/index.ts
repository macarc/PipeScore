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

import { IBar } from '../Bar';
import { INote } from '../Note';
import { Playback } from '../Playback';
import { SavedStave } from '../SavedModel';
import { ID } from '../global/id';
import { Relative } from '../global/relativeLocation';

type Gap = 'auto' | number;

export abstract class IStave {
  abstract toJSON(): SavedStave;
  abstract setGap(gap: Gap): void;
  abstract gap(): Gap;
  abstract gapAsNumber(): number;
  abstract height(): number;
  abstract numberOfBars(): number;
  abstract insertBar(bar: IBar): void;
  abstract appendBar(bar: IBar): void;
  abstract deleteBar(bar: IBar): void;
  abstract includesID(id: ID): boolean;
  abstract firstBar(): IBar | null;
  abstract lastBar(): IBar | null;
  abstract bars(): IBar[];
  abstract previousNote(id: ID): INote | null;
  abstract previousBar(bar: IBar): IBar | null;
  abstract partFirst(): void;
  abstract partLast(): void;
  abstract repeatFirst(): void;
  abstract repeatLast(): void;
  abstract replaceBar(newBar: IBar, oldBar: IBar, where: Relative): void;
  abstract play(previous: IStave | null): Playback[];
}
