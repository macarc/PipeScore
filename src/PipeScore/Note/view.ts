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

//  Code for drawing notes

import { INote, ITriplet, NoteOrTriplet } from '.';
import { Dispatch } from '../Dispatch';
import { GracenoteState } from '../Gracenote/state';
import { Pitch } from '../global/pitch';
import { noteWidth, totalWidth } from './noteview';
import { NoteState } from './state';

export {
  drawNoteGroup,
  noteHeadWidth,
  noteWidth,
  totalWidth,
  spacerWidth,
} from './noteview';
export { drawTriplet } from './tripletview';

export interface NoteProps {
  x: number;
  y: number;
  boxToLast: number | 'lastnote';
  justAddedNote: boolean;
  previousNote: INote | null;
  noteWidth: number;
  endOfLastStave: number;
  state: NoteState;
  gracenoteState: GracenoteState;
  dispatch: Dispatch;
}

export function noteOrTripletWidth(note: NoteOrTriplet, prevNote: Pitch | null) {
  if (note instanceof ITriplet) {
    return totalWidth(note.tripletSingleNotes(), prevNote);
  }
  return noteWidth(note, prevNote);
}
