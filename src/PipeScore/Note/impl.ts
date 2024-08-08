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

//  Implementations of notes and triplets

import type { INote, NoteOrTriplet } from '.';
import {
  type SavedNoteOrTriplet,
  isDeprecatedSavedNoteOrTriplet,
} from '../SavedModel';
import { Note } from './note';
import { Triplet } from './triplet';

export { Note } from './note';
export { Triplet } from './triplet';

export function notesToTriplet(first: INote, second: INote, third: INote) {
  return new Triplet(first.length(), first, second, third);
}

export function noteFromJSON(o: SavedNoteOrTriplet) {
  let s: NoteOrTriplet | null = null;
  switch (o.notetype) {
    case 'single':
      s = Note.fromObject(o.value);
      break;
    case 'triplet':
      s = Triplet.fromObject(o.value);
      break;
  }
  if (s) {
    if (isDeprecatedSavedNoteOrTriplet(o)) {
      s.id = o.id;
    }
    return s;
  }
  throw new Error(`Unrecognised note type ${o.notetype}`);
}
