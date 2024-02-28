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

import { Playback } from '../Playback';
import { IPreview } from '../Preview';
import { SavedGracenote } from '../SavedModel';
import { Pitch } from '../global/pitch';
import { GracenoteNoteList } from './gracenotes';

export abstract class IGracenote {
  abstract drag(pitch: Pitch, index: number): IGracenote;
  abstract notes(thisNote?: Pitch, previous?: Pitch | null): GracenoteNoteList;
  abstract equals(other: IGracenote): boolean;
  abstract toJSON(): SavedGracenote;
  abstract asPreview(): IPreview | null;
  abstract moveUp(index: number): IGracenote | null;
  abstract moveDown(index: number): IGracenote | null;
  abstract numberOfNotes(): number;
  abstract play(thisNote: Pitch, previousNote: Pitch | null): Playback[];
  // Add a single to an existing gracenote
  // Used for creating custom embellisments
  abstract addSingle(newPitch: Pitch, note: Pitch, prev: Pitch | null): IGracenote;
  abstract removeSingle(index: number): IGracenote;
  abstract copy(): IGracenote;
  abstract reactiveName(): string | null;
}
