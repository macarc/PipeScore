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

//  Triplet model

import { type INote, ITriplet } from '.';
import { playbackNote, playbackObject } from '../Playback';
import type { SavedTriplet } from '../SavedModel';
import { type ID, genID } from '../global/id';
import type { Pitch } from '../global/pitch';
import { nfirst, nlast } from '../global/utils';
import { Note } from './impl';
import { NoteLength } from './notelength';

export class Triplet extends ITriplet {
  private _notes: [INote, INote, INote];
  private _length: NoteLength;

  constructor(length: NoteLength, first: INote, second: INote, third: INote) {
    super(genID());
    this._length = length;
    this._notes = [first, second, third];
  }

  public copy() {
    const n = Triplet.fromObject(this.toObject());
    n.id = genID();
    for (const note of n._notes) {
      note.id = genID();
    }
    return n;
  }

  public static fromObject(o: SavedTriplet) {
    const t = new Triplet(
      new NoteLength(o.length),
      ...(o.notes.map((note) => Note.fromObject(note)) as INote[] as [
        INote,
        INote,
        INote,
      ])
    );
    if (o.id) {
      t.id = o.id;
    }
    for (const note in o.notes) {
      const id = o.notes[note].id;
      if (id) {
        t._notes[note].id = id;
      }
    }
    return t;
  }

  public toObject(): SavedTriplet {
    return {
      id: this.id,
      notes: this._notes.map((n) => n.toObject()),
      length: this._length.toJSON(),
    };
  }

  public hasID(id: ID) {
    return super.hasID(id) || this._notes.some((n) => n.hasID(id));
  }

  public tripletSingleNotes() {
    return this._notes;
  }

  public firstSingle() {
    return nfirst(this._notes);
  }

  public lastSingle() {
    return nlast(this._notes);
  }

  public ensureNotesAreCorrectLength() {
    for (const note of this._notes) {
      note.setLength(this._length);
    }
  }

  public length() {
    return this._length;
  }

  public setLength(length: NoteLength) {
    this._length = length;
  }

  public play(previous: Pitch | null) {
    return playbackObject(
      this.id,
      this._notes.flatMap((n, i) => [
        ...n
          .gracenote()
          .play(n.pitch(), i === 0 ? previous : this._notes[i - 1].pitch()),
        ...playbackObject(n.id, [
          playbackNote(n.pitch(), (2 / 3) * n.length().inBeats(), n.isTied()),
        ]),
      ])
    );
  }
}
