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

//  Note model

import { INote } from '.';
import { IGracenote } from '../Gracenote';
import { Gracenote, NoGracenote } from '../Gracenote/impl';
import { type PlaybackItem, playbackNote, playbackObject } from '../Playback';
import type { SavedNote } from '../SavedModel';
import { genID } from '../global/id';
import { Pitch, pitchDown, pitchUp } from '../global/pitch';
import { NoteLength } from './notelength';

export class Note extends INote {
  private _length: NoteLength;
  private _pitch: Pitch;
  private _gracenote: IGracenote;
  private hasNatural: boolean;
  private tied: boolean;

  private previewGracenote: IGracenote | null;
  private preview = false;

  constructor(
    pitch: Pitch,
    length: NoteLength,
    tied = false,
    hasNatural = false,
    gracenote: IGracenote = new NoGracenote()
  ) {
    super(genID());
    this.tied = tied;
    this._length = length;
    this._pitch = pitch;
    this._gracenote = gracenote;
    this.hasNatural = hasNatural;
    this.previewGracenote = null;
  }

  static fromObject(o: SavedNote) {
    const n = new Note(
      o.pitch,
      new NoteLength(o.length),
      o.tied,
      o.hasNatural || false,
      Gracenote.fromJSON(o.gracenote)
    );
    if (o.id) {
      n.id = o.id;
    }
    return n;
  }

  toObject(): SavedNote {
    return {
      id: this.id,
      pitch: this._pitch,
      length: this._length.toJSON(),
      tied: this.tied,
      hasNatural: this.hasNatural,
      gracenote: this._gracenote.toJSON(),
    };
  }

  copy() {
    const n = Note.fromObject(this.toObject());
    n.id = genID();
    return n;
  }

  toggleTie(notes: Note[][]) {
    this.tied = !this.tied;
    this.makeCorrectTie(notes);
  }

  isTied() {
    return this.tied;
  }

  // Corrects the pitches of any notes tied to this note
  makeCorrectTie(notes: Note[][]) {
    for (const part of notes) {
      const thisIdx = part.findIndex((n) => n.hasID(this.id));
      if (thisIdx !== -1) {
        const pitch = this.pitch();

        // Ensure previous tied notes are the same pitch
        for (let i = thisIdx; i > 0 && part[i].tied; i--) {
          part[i - 1].setPitch(pitch);
        }

        // Ensure subsequent tied notes are the same pitch
        for (let i = thisIdx + 1; i < part.length && part[i].tied; i++) {
          part[i].setPitch(pitch);
        }
        return;
      }
    }
  }

  pitch() {
    return this._pitch;
  }

  setPitch(pitch: Pitch) {
    this._pitch = pitch;
  }

  length() {
    return this._length;
  }

  setLength(length: NoteLength) {
    this._length = length;
  }

  hasPreview() {
    return this.previewGracenote !== null;
  }

  makePreviewReal() {
    if (this.previewGracenote) this.setGracenote(this.previewGracenote);
    this.previewGracenote = null;
  }

  setPreview(gracenote: IGracenote | Pitch, noteBefore: Note | null) {
    if (gracenote instanceof IGracenote) {
      if (!this._gracenote.equals(gracenote)) {
        this.previewGracenote = gracenote;
      } else {
        // If the gracenote is the same then we don't need to show a preview
        this.previewGracenote = null;
      }
    } else {
      this.previewGracenote = this._gracenote.addSingle(
        gracenote,
        this.pitch(),
        noteBefore?.pitch() || null
      );
    }
  }

  removePreview() {
    this.previewGracenote = null;
  }

  isPreview() {
    return this.preview;
  }

  makeUnPreview() {
    this.preview = false;
    return this;
  }

  makePreview() {
    this.preview = true;
    return this;
  }

  drag(pitch: Pitch) {
    this.setPitch(pitch);
    this.hasNatural = false;
  }

  moveUp() {
    this.setPitch(pitchUp(this.pitch()));
    this.hasNatural = false;
  }

  moveDown() {
    this.setPitch(pitchDown(this.pitch()));
    this.hasNatural = false;
  }

  natural() {
    return this.hasNatural && this.canHaveNatural();
  }

  toggleNatural() {
    if (this.canHaveNatural()) {
      this.hasNatural = !this.hasNatural;
    }
  }

  private canHaveNatural() {
    return this.pitch() === Pitch.C || this.pitch() === Pitch.F;
  }

  gracenote() {
    return this.previewGracenote !== null ? this.previewGracenote : this._gracenote;
  }

  setGracenote(gracenote: IGracenote) {
    this._gracenote = gracenote;
  }

  addSingleGracenote(grace: Pitch, previous: INote | null = null) {
    this._gracenote = this._gracenote.addSingle(
      grace,
      this.pitch(),
      previous?.pitch() || null
    );
  }

  replaceGracenote(g: IGracenote, n: IGracenote | null) {
    if (this._gracenote === g) this._gracenote = n || new NoGracenote();
  }

  play(pitchBefore: Pitch | null): PlaybackItem[] {
    return playbackObject(this.id, [
      ...this.gracenote().play(this._pitch, pitchBefore),
      playbackNote(this._pitch, this._length.inBeats(), this.tied),
    ]);
  }
}
