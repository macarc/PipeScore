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

import { IBar } from '../Bar';
import { Update } from '../Events/types';
import { INote, NoteOrTriplet } from '../Note';
import { Playback, PlaybackSecondTiming } from '../Playback';
import { SavedScore } from '../SavedModel';
import { IStave } from '../Stave';
import { ITextBox } from '../TextBox';
import { ITiming, TimingPart } from '../Timing';
import { ID, Item } from '../global/id';
import { Relative } from '../global/relativeLocation';

type Location = { stave: IStave; bar: IBar };

export abstract class IScore {
  abstract landscape: boolean;
  abstract showNumberOfPages: boolean;
  abstract zoom: number;
  abstract name(): string;
  abstract updateName(): void;
  abstract toJSON(): SavedScore;
  abstract width(): number;
  abstract height(): number;
  abstract printWidth(): number;
  abstract printHeight(): number;
  abstract orientation(): 'landscape' | 'portrait';
  abstract makeLandscape(): Update;
  abstract makePortrait(): Update;
  abstract addText(text: ITextBox): void;
  abstract staveY(stave: IStave): number;
  abstract addStave(nearStave: IStave | null, where: Relative): void;
  abstract nextBar(id: ID): IBar | null;
  abstract previousBar(id: ID): IBar | null;
  abstract nextNote(id: ID): INote | null;
  abstract previousNote(id: ID): INote | null;
  abstract nextStave(stave: IStave): IStave | null;
  abstract previousStave(stave: IStave): IStave | null;
  abstract firstOnPage(page: number): IBar | null;
  abstract lastOnPage(page: number): IBar | null;
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere
  abstract deleteStave(stave: IStave): void;
  abstract notesAndTriplets(): NoteOrTriplet[];
  abstract notes(): INote[];
  abstract bars(): IBar[];
  abstract staves(): IStave[];
  abstract lastStave(): IStave | null;
  abstract pages(): IStave[][];
  abstract location(id: ID): Location | null;
  abstract lastBarAndStave(): Location | null;
  abstract deleteTextBox(text: ITextBox): void;
  abstract dragTextBox(text: ITextBox, x: number, y: number, page: number): void;
  abstract textBoxes(): ITextBox[][];
  abstract timings(): ITiming[];
  abstract addTiming(timing: ITiming): boolean;
  abstract deleteTiming(timing: ITiming): void;
  abstract dragTiming(
    timing: ITiming,
    part: TimingPart,
    x: number,
    y: number,
    page: number
  ): void;
  abstract purgeTimings(items: Item[]): void;
  abstract play(): Playback[];
  abstract playbackTimings(elements: Playback[]): PlaybackSecondTiming[];
}
