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

import { Gracenote, NoGracenote } from '../Gracenote';
import { Playback, PlaybackNote, PlaybackObject } from '../Playback';
import { Previews } from '../Preview/previews';
import { SavedNote } from '../SavedModel';
import { Item, genId } from '../global/id';
import { Pitch, pitchDown, pitchUp } from '../global/pitch';
import { NoteLength } from './notelength';

export interface PreviousNote {
  pitch: Pitch;
  x: number;
  y: number;
}

export class Note extends Item implements Previews<Gracenote>, Previews<Pitch> {
  private _length: NoteLength;
  private _pitch: Pitch;
  private _gracenote: Gracenote;
  private hasNatural: boolean;
  private tied: boolean;

  private previewGracenote: Gracenote | null;
  private preview = false;

  constructor(
    pitch: Pitch,
    length: NoteLength,
    tied = false,
    hasNatural = false,
    gracenote: Gracenote = new NoGracenote()
  ) {
    super(genId());
    this.tied = tied;
    this._length = length;
    this._pitch = pitch;
    this._gracenote = gracenote;
    this.hasNatural = hasNatural;
    this.previewGracenote = null;
  }

  public static fromObject(o: SavedNote) {
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

  public toObject(): SavedNote {
    return {
      id: this.id,
      pitch: this._pitch,
      length: this._length.toJSON(),
      tied: this.tied,
      hasNatural: this.hasNatural,
      gracenote: this._gracenote.toJSON(),
    };
  }

  public copy() {
    const n = Note.fromObject(this.toObject());
    n.id = genId();
    return n;
  }

  public toggleTie(notes: Note[]) {
    this.tied = !this.tied;
    this.makeCorrectTie(notes);
  }

  public isTied() {
    return this.tied;
  }

  // Corrects the pitches of any notes tied to this note
  public makeCorrectTie(notes: Note[]) {
    const thisIdx = notes.findIndex((n) => n.hasID(this.id));
    const pitch = this.pitch();

    // Ensure previous tied notes are the same pitch
    for (let i = thisIdx; i > 0 && notes[i].tied; i--) {
      notes[i - 1].setPitch(pitch);
    }

    // Ensure subsequent tied notes are the same pitch
    for (let i = thisIdx + 1; i < notes.length && notes[i].tied; i++) {
      notes[i].setPitch(pitch);
    }
  }

  public pitch() {
    return this._pitch;
  }

  public setPitch(pitch: Pitch) {
    this._pitch = pitch;
  }

  public length() {
    return this._length;
  }

  public setLength(length: NoteLength) {
    this._length = length;
  }

  public hasPreview() {
    return this.previewGracenote !== null;
  }

  public makePreviewReal() {
    if (this.previewGracenote) this.setGracenote(this.previewGracenote);
    this.previewGracenote = null;
  }

  public setPreview(gracenote: Gracenote | Pitch, noteBefore: Note | null) {
    if (gracenote instanceof Gracenote) {
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

  public removePreview() {
    this.previewGracenote = null;
  }

  public isPreview() {
    return this.preview;
  }

  public makeUnPreview() {
    this.preview = false;
    return this;
  }

  public makePreview() {
    this.preview = true;
    return this;
  }

  public drag(pitch: Pitch) {
    this.setPitch(pitch);
    this.hasNatural = false;
  }

  public moveUp() {
    this.setPitch(pitchUp(this.pitch()));
    this.hasNatural = false;
  }

  public moveDown() {
    this.setPitch(pitchDown(this.pitch()));
    this.hasNatural = false;
  }

  public natural() {
    return this.hasNatural && this.canHaveNatural();
  }

  public toggleNatural() {
    if (this.canHaveNatural()) {
      this.hasNatural = !this.hasNatural;
    }
  }

  private canHaveNatural() {
    return this.pitch() === Pitch.C || this.pitch() === Pitch.F;
  }

  public gracenote(): Gracenote {
    return this.previewGracenote !== null ? this.previewGracenote : this._gracenote;
  }

  public setGracenote(gracenote: Gracenote) {
    this._gracenote = gracenote;
  }

  public addSingleGracenote(grace: Pitch, previous: Note | null = null) {
    this._gracenote = this._gracenote.addSingle(
      grace,
      this.pitch(),
      previous?.pitch() || null
    );
  }

  public replaceGracenote(g: Gracenote, n: Gracenote) {
    if (this._gracenote === g) this._gracenote = n;
  }

  public play(pitchBefore: Pitch | null): Playback[] {
    return [
      new PlaybackObject('start', this.id),
      ...this.gracenote().play(this._pitch, pitchBefore),
      new PlaybackNote(this._pitch, this.tied, this._length.inBeats()),
      new PlaybackObject('end', this.id),
    ];
  }
}
