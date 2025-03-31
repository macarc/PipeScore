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

//  Interfaces of notes and triplets

import type { IGracenote } from '../Gracenote';
import type { PlaybackItem } from '../Playback';
import type { Previews } from '../Preview/previews';
import type { SavedNote, SavedNoteOrTriplet, SavedTriplet } from '../SavedModel';
import { Item } from '../global/id';
import type { Pitch } from '../global/pitch';
import { unreachable } from '../global/utils';
import type { NoteLength } from './notelength';

export abstract class INote
  extends Item
  implements Previews<IGracenote>, Previews<Pitch>
{
  abstract toObject(): SavedNote;
  abstract copy(): INote;
  abstract toggleTie(notes: INote[][]): void;
  abstract isTied(): boolean;
  // Corrects the pitches of any notes tied to this note
  abstract makeCorrectTie(notes: INote[][]): void;
  abstract pitch(): Pitch;
  abstract setPitch(pitch: Pitch): void;
  abstract length(): NoteLength;
  abstract setLength(length: NoteLength): void;
  abstract hasPreview(): boolean;
  abstract makePreviewReal(): void;
  abstract setPreview(gracenote: IGracenote | Pitch, noteBefore: INote | null): void;
  abstract removePreview(): void;
  abstract isPreview(): boolean;
  abstract makeUnPreview(): INote;
  abstract makePreview(): INote;
  abstract drag(pitch: Pitch): void;
  abstract moveUp(): void;
  abstract moveDown(): void;
  abstract natural(): boolean;
  abstract toggleNatural(): void;
  abstract gracenote(): IGracenote;
  abstract setGracenote(gracenote: IGracenote): void;
  abstract addSingleGracenote(grace: Pitch, previous: INote | null): void;
  abstract replaceGracenote(g: IGracenote, n: IGracenote | null): void;
  abstract play(pitchBefore: Pitch | null): PlaybackItem[];
}

// TODO : must we extend Item here?
export abstract class ITriplet extends Item {
  abstract copy(): ITriplet;
  abstract toObject(): SavedTriplet;
  abstract tripletSingleNotes(): INote[];
  abstract firstSingle(): INote;
  abstract lastSingle(): INote;
  abstract ensureNotesAreCorrectLength(): void;
  abstract length(): NoteLength;
  abstract setLength(length: NoteLength): void;
  abstract play(previous: Pitch | null): PlaybackItem[];
}

export type NoteOrTriplet = INote | ITriplet;

export function noteToJSON(note: NoteOrTriplet): SavedNoteOrTriplet {
  if (note instanceof INote) {
    return {
      notetype: 'single',
      value: note.toObject(),
    };
  }
  if (note instanceof ITriplet) {
    return {
      notetype: 'triplet',
      value: note.toObject(),
    };
  }
  unreachable(note, 'Unknown note type (not a single or triplet)');
}

export function lastNote(note: NoteOrTriplet): INote {
  if (note instanceof ITriplet) return note.lastSingle();
  return note;
}

export function flattenTriplets(notes: NoteOrTriplet[]): INote[] {
  return notes.flatMap((note) =>
    note instanceof ITriplet ? note.tripletSingleNotes() : note
  );
}

type NoteGroup = INote[] | ITriplet;

// Given a list of notes, and a function for finding out how long
// each group should be, turns the notes into a set of groups
export function groupNotes(
  notes: NoteOrTriplet[],
  findLengthOfGroup: (i: number) => number
): NoteGroup[] {
  let i = 0;
  let remainingLength = findLengthOfGroup(i);
  let currentGroup: INote[] = [];
  const groupedNotes: NoteGroup[] = [];

  function endGroup() {
    if (currentGroup.length > 0) {
      groupedNotes.push(currentGroup);
      currentGroup = [];
    }
  }

  function pushNote(note: INote) {
    if (note.length().hasBeam()) {
      currentGroup.push(note);
    } else {
      endGroup();
      currentGroup.push(note);
      endGroup();
    }
    remainingLength -= note.length().inBeats();
  }

  for (const note of notes) {
    if (note instanceof ITriplet) {
      endGroup();
      groupedNotes.push(note);
      remainingLength = findLengthOfGroup(++i);
    } else {
      if (remainingLength >= note.length().inBeats()) {
        pushNote(note);
      } else {
        endGroup();
        remainingLength += findLengthOfGroup(++i);
        pushNote(note);
      }
      if (remainingLength < 0) {
        remainingLength += findLengthOfGroup(++i);
      }
    }
  }
  endGroup();
  return groupedNotes;
}
