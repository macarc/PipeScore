//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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

import { Score } from '../Score';
import { Pitch } from '../global/pitch';

export class Selection {
  dragging = false;
  // Return true if the selection should be deleted
  delete(score: Score): boolean {
    return true;
  }
  mouseDrag(x: number, y: number, score: Score, page: number) {}
  dragOverPitch(pitch: Pitch, score: Score) {}
  mouseUp() {}
}

export class Drags extends Selection {
  public dragging = true;
  public mouseUp() {
    this.dragging = false;
  }
}
