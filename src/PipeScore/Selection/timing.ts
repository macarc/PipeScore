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

import type { IScore } from '../Score';
import type { ITiming, TimingPart } from '../Timing';
import { DraggableSelection } from './dragging';

export class TimingSelection extends DraggableSelection {
  timing: ITiming;
  private part: TimingPart;

  constructor(
    timing: ITiming,
    clickedPart: TimingPart,
    createdByMouseDown: boolean
  ) {
    super(createdByMouseDown);
    this.timing = timing;
    this.part = clickedPart;
  }

  override delete(score: IScore) {
    score.deleteTiming(this.timing);
    return null;
  }

  override mouseDrag(x: number, y: number, score: IScore, page: number) {
    score.dragTiming(this.timing, this.part, x, y, page);
  }
}
