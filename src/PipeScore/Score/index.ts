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

//  The Score contains the entire score (what a surprise). Since it delegates,
//  this file mostly deals with delegations and pages.

import type { IBar, IMeasure } from '../Bar';
import type { Update } from '../Events/types';
import type { INote } from '../Note';
import type { Playback, PlaybackSecondTiming } from '../Playback';
import type { SavedScore } from '../SavedModel';
import type { IStave } from '../Stave';
import type { IMovableTextBox } from '../TextBox';
import type { ITiming, TimingPart } from '../Timing';
import type { ITune } from '../Tune';
import type { ID } from '../global/id';
import type { Relative } from '../global/relativeLocation';

type Location = { tune: ITune; stave: IStave; measure: IMeasure; bar: IBar };

export abstract class IScore {
  abstract landscape: boolean;
  abstract showNumberOfPages: boolean;
  abstract zoom: number;
  abstract name(): string;
  abstract toJSON(): SavedScore;
  abstract width(): number;
  abstract height(): number;
  abstract printWidth(): number;
  abstract printHeight(): number;
  abstract orientation(): 'landscape' | 'portrait';
  abstract makeLandscape(): Update;
  abstract makePortrait(): Update;
  abstract addText(text: IMovableTextBox): void;
  abstract staveY(stave: IStave | ITune): number;
  abstract nextBar(id: ID): IBar | null;
  abstract previousBar(id: ID): IBar | null;
  abstract nextNote(id: ID): INote | null;
  abstract previousNote(id: ID): INote | null;
  abstract previousStaveSameTune(stave: IStave): IStave | null;
  abstract firstOnPage(page: number): IBar | null;
  abstract lastOnPage(page: number): IBar | null;
  abstract addTune(nearTune: ITune | null, where: Relative): void;
  abstract deleteTune(tune: ITune): void;
  abstract notes(): INote[][];
  abstract flatNotes(): INote[];
  abstract bars(): IBar[][];
  abstract measures(): IMeasure[];
  abstract staves(): IStave[];
  abstract tunes(): ITune[];
  abstract lastStave(): IStave | null;
  abstract stavesByPage(): IStave[][];
  abstract pages(): (IStave | ITune)[][];
  abstract location(id: ID): Location | null;
  abstract lastBarAndStave(): Location | null;
  abstract deleteTextBox(text: IMovableTextBox): void;
  abstract dragTextBox(
    text: IMovableTextBox,
    x: number,
    y: number,
    page: number
  ): void;
  abstract textBoxes(): IMovableTextBox[][];
  abstract timings(): ITiming[];
  abstract addTiming(timing: ITiming): boolean;
  abstract deleteTiming(timing: ITiming): void;
  // This may only be called immediately after drawing! It relies on the global XY store
  // Returns true if timings were removed
  abstract removeUselessTimings(): boolean;
  abstract dragTiming(
    timing: ITiming,
    part: TimingPart,
    x: number,
    y: number,
    page: number
  ): void;
  abstract play(): Playback[];
  abstract playbackTimings(elements: Playback[]): PlaybackSecondTiming[];
}
