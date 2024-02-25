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

import { ITriplet } from '../Note';
import { IScore } from '../Score';
import { DefaultSelection } from './dragging';

export class TripletLineSelection extends DefaultSelection {
  public selected: ITriplet;

  constructor(triplet: ITriplet) {
    super();
    this.selected = triplet;
  }

  override delete(score: IScore) {
    const location = score.location(this.selected.id);
    if (location) location.bar.unmakeTriplet(this.selected);
    return null;
  }
}
