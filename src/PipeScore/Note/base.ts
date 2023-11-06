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

import {
  NoteLength,
  sameNoteLengthName,
  dotLength,
  lengthInBeats,
  isDotted,
} from './notelength';
import { Item, genId } from '../global/id';
import { Note, Triplet, NoteOrTriplet } from './index';
import { NoteState } from './state';
import { GracenoteState } from '../Gracenote/state';
import { SavedNoteOrTriplet, isDeprecatedSavedNoteOrTriplet } from '../SavedModel';

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

export abstract class BaseNote extends Item {
  protected length: NoteLength;

  constructor(length: NoteLength) {
    super(genId());
    this.length = length;
  }
  public static fromJSON(o: SavedNoteOrTriplet) {
    let s: Note | Triplet | null = null;
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
  public toJSON(): SavedNoteOrTriplet {
    if (this instanceof Note) {
      return {
        notetype: 'single',
        value: this.toObject(),
      };
    } else if (this instanceof Triplet) {
      return {
        notetype: 'triplet',
        value: this.toObject(),
      };
    }
    throw new Error('Unknown note type (not a single or triplet)');
  }
  public isLength(length: NoteLength) {
    return sameNoteLengthName(this.length, length);
  }
  public setLength(length: NoteLength) {
    this.length = length;
  }
  public lengthForInput() {
    return this.length;
  }
  public toggleDot() {
    return (this.length = dotLength(this.length));
  }
  public static makeSameLength(notes: Note[]) {
    notes.forEach((note) => (note.length = notes[0].length));
  }
  public static ungroupNotes(notes: NoteOrTriplet[][]): NoteOrTriplet[] {
    return ([] as NoteOrTriplet[]).concat(...notes);
  }
  // Given a list of notes, and a function for finding out how long
  // each group should be, turns the notes into a set of groups
  public static groupNotes(
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
      if (note.hasBeam()) {
        currentGroup.push(note);
      } else {
        endGroup();
        currentGroup.push(note);
        endGroup();
      }
      remainingLength -= note.lengthInBeats();
    }
    for (const note of notes) {
      if (note instanceof Triplet) {
        endGroup();
        groupedNotes.push(note);
      } else {
        if (remainingLength >= note.lengthInBeats()) {
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

  protected numTails() {
    switch (this.length) {
      case NoteLength.Semibreve:
      case NoteLength.DottedMinim:
      case NoteLength.Minim:
      case NoteLength.DottedCrotchet:
      case NoteLength.Crotchet:
        return 0;
      case NoteLength.DottedQuaver:
      case NoteLength.Quaver:
        return 1;
      case NoteLength.DottedSemiQuaver:
      case NoteLength.SemiQuaver:
        return 2;
      case NoteLength.DottedDemiSemiQuaver:
      case NoteLength.DemiSemiQuaver:
        return 3;
      case NoteLength.DottedHemiDemiSemiQuaver:
      case NoteLength.HemiDemiSemiQuaver:
        return 4;
    }
  }
  public lengthInBeats(): number {
    return lengthInBeats(this.length);
  }
  protected hasDot() {
    return isDotted(this.length);
  }
  protected hasBeam() {
    return this.lengthInBeats() < 1;
  }
  protected isFilled() {
    return this.lengthInBeats() < 2;
  }
  protected hasStem() {
    return this.length !== NoteLength.Semibreve;
  }
}
