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

import type { SavedTune } from '../SavedModel';
import type { IStave } from '../Stave';
import type { IStaticTextBox } from '../TextBox';
import type { ITimeSignature } from '../TimeSignature';
import type { Relative } from '../global/relativeLocation';

export abstract class ITune {
  abstract toJSON(): SavedTune;
  abstract name(): IStaticTextBox;
  abstract composer(): IStaticTextBox;
  abstract tuneType(): IStaticTextBox;
  abstract tuneGap(): number;
  abstract setTuneGap(gap: number): void;
  abstract staves(): IStave[];
  abstract timeSignature(): ITimeSignature | null;
  abstract addStave(nearStave: IStave | null, where: Relative): void;
  abstract deleteStave(stave: IStave): void;
  abstract nextStave(stave: IStave): IStave | null;
  abstract previousStave(stave: IStave): IStave | null;
}
