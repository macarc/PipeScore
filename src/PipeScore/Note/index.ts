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

import { GracenoteState } from '../Gracenote/state';
import {
  SavedNoteOrTriplet,
  isDeprecatedSavedNoteOrTriplet,
} from '../SavedModel';
import { Pitch } from '../global/pitch';
import { Note } from './note';
import { NoteState } from './state';
import { Triplet } from './triplet';
import { noteWidth, totalWidth } from './view';
export { Note } from './note';
export { Triplet } from './triplet';

export interface NoteProps {
  x: number;
  y: number;
  boxToLast: number | 'lastnote';
  justAddedNote: boolean;
  previousNote: Note | null;
  noteWidth: number;
  endOfLastStave: number;
  state: NoteState;
  gracenoteState: GracenoteState;
}

export type NoteOrTriplet = Note | Triplet;

export function notesToTriplet(first: Note, second: Note, third: Note) {
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

export function noteToJSON(note: NoteOrTriplet): SavedNoteOrTriplet {
  if (note instanceof Note) {
    return {
      notetype: 'single',
      value: note.toObject(),
    };
  } else if (note instanceof Triplet) {
    return {
      notetype: 'triplet',
      value: note.toObject(),
    };
  }
  throw new Error('Unknown note type (not a single or triplet)');
}

export function lastNote(note: NoteOrTriplet): Note {
  if (note instanceof Triplet) return note.lastSingle();
  return note;
}

export function flattenTriplets(notes: NoteOrTriplet[]): Note[] {
  return notes.flatMap((note) =>
    note instanceof Triplet ? note.tripletSingleNotes() : note
  );
}

export function noteOrTripletWidth(
  note: NoteOrTriplet,
  prevNote: Pitch | null
) {
  if (note instanceof Note) {
    return noteWidth(note, prevNote);
  } else {
    return totalWidth(note.tripletSingleNotes(), prevNote);
  }
}

// Given a list of notes, and a function for finding out how long
// each group should be, turns the notes into a set of groups
export function groupNotes(
  notes: NoteOrTriplet[],
  findLengthOfGroup: (i: number) => number
): (Note[] | Triplet)[] {
  let i = 0;
  let remainingLength = findLengthOfGroup(i);
  let currentGroup: Note[] = [];
  const groupedNotes: (Note[] | Triplet)[] = [];

  function endGroup() {
    if (currentGroup.length > 0) {
      groupedNotes.push(currentGroup);
      currentGroup = [];
    }
  }

  function pushNote(note: Note) {
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
    if (note instanceof Triplet) {
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
