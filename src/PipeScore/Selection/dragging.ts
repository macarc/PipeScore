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

import { ISelection } from '.';
import { IScore } from '../Score';
import { Pitch } from '../global/pitch';

// Stubs for all methods, that can then be overriden as needed
export abstract class DefaultSelection extends ISelection {
  dragging() {
    return false;
  }

  delete(score: IScore): ISelection | null {
    return null;
  }

  mouseDrag(x: number, y: number, score: IScore, page: number): void {}

  mouseUp(): void {}

  dragOverPitch(pitch: Pitch, score: IScore): void {}
}

export abstract class DraggableSelection extends DefaultSelection {
  _dragging: boolean;
  // Selections created by the user clicking should
  // have createdByMouseDown on, otherwise (e.g. from keyboard)
  // createdByMouseDown should be off
  constructor(createdByMouseDown: boolean) {
    super();
    this._dragging = createdByMouseDown;
  }

  override dragging() {
    return this._dragging;
  }

  override mouseUp() {
    this._dragging = false;
  }

  override delete(score: IScore): ISelection | null {
    return null;
  }
}
