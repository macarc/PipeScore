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
//
//  A single bar - simple container for notes.

import type { IMeasure } from '../Measure';
import type { INote, ITriplet, NoteOrTriplet } from '../Note';
import type { PlaybackItem } from '../Playback';
import type { Previews } from '../Preview/previews';
import type { SavedBar } from '../SavedModel';
import { type ID, Item } from '../global/id';
import type { Pitch } from '../global/pitch';

export abstract class IBar extends Item implements Previews<INote> {
  abstract toJSON(): SavedBar;
  // Get parent measure
  abstract measure(): IMeasure;
  abstract harmonyIndex(): number;
  abstract containsNoteWithID(id: ID): boolean;
  abstract notes(): INote[];
  abstract notesAndTriplets(): NoteOrTriplet[];
  abstract nonPreviewNotes(): NoteOrTriplet[];
  abstract insertNote(noteBefore: INote | null, note: INote): void;
  abstract appendNotes(note: NoteOrTriplet[]): void;
  abstract deleteNote(note: INote): void;
  abstract clearNotes(): void;
  abstract lastPitch(): Pitch | null;
  abstract lastNote(): INote | null;
  abstract previousNote(note: INote): NoteOrTriplet | null;
  abstract makeTriplet(first: INote, second: INote, third: INote): void;
  abstract unmakeTriplet(tr: ITriplet): void;
  abstract setPreview(
    note: INote,
    noteBefore: INote | null,
    noteAfter: INote | null
  ): void;
  abstract hasPreview(): boolean;
  abstract makePreviewReal(notes: INote[][]): void;
  abstract removePreview(): void;
  abstract preview(): INote | null;
  abstract play(previous: IBar | null): PlaybackItem[];
}
