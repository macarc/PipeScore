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

import { PlaybackNote, PlaybackObject } from '../Playback';
import { SavedTriplet } from '../SavedModel';
import { ID, Item, genId } from '../global/id';
import { Pitch } from '../global/pitch';
import { nfirst, nlast } from '../global/utils';
import { Note } from './index';
import { NoteLength } from './notelength';

// FIXME : must we extend Item here?
export class Triplet extends Item {
  private _notes: [Note, Note, Note];
  private _length: NoteLength;

  constructor(length: NoteLength, first: Note, second: Note, third: Note) {
    super(genId());
    this._length = length;
    this._notes = [first, second, third];
  }

  public copy() {
    const n = Triplet.fromObject(this.toObject());
    n.id = genId();
    n._notes.forEach((note) => (note.id = genId()));
    return n;
  }

  public static fromObject(o: SavedTriplet) {
    const t = new Triplet(
      new NoteLength(o.length),
      ...(o.notes.map((note) => Note.fromObject(note)) as [Note, Note, Note])
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
    this._notes.forEach((note) => note.length().set(this._length));
  }

  public length() {
    return this._length;
  }

  public play(previous: Pitch | null) {
    return [
      new PlaybackObject('start', this.id),
      ...this._notes.flatMap((n, i) => [
        ...n
          .gracenote()
          .play(n.pitch(), i === 0 ? previous : this._notes[i - 1].pitch()),
        new PlaybackObject('start', n.id),
        new PlaybackNote(n.pitch(), n.isTied(), (2 / 3) * n.length().inBeats()),
        new PlaybackObject('end', n.id),
      ]),
      new PlaybackObject('end', this.id),
    ];
  }
}
