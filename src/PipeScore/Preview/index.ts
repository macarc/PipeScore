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

//  There are 3 things that can be previewed:
//  - Notes
//  - Single gracenotes
//  - Reactive gracenotes
//  When you are inputting these, the preview shows
//  up as an orange note in the place that the note
//  would be if you placed it.

import { Bar } from '../Bar';
import { Pitch } from '../global/pitch';
import { ReactiveGracenote } from '../Gracenote';
import { Note } from '../Note';
import { NoteLength } from '../Note/notelength';
import { Previews } from './previews';

export interface Preview {
  // Returns true if the pitch changed
  setPitch(pitch: Pitch | null): boolean;
  // Returns true if the location changed
  setLocation(
    bar: Bar,
    noteBefore: Note | null,
    noteAfter: Note | null
  ): boolean;
  stop(): void;
  makeReal(notes: Note[]): void;
  justAdded(): boolean;
}

// Previews have a .justMadeReal property, which is true if the preview
// has not been updated since it was last made real. The reason this is needed
// is that when making real, the preview will be removed by the parent. In order
// to add the preview again, all pitch boxes will react on mousemove
// (instead of mouseover) to trigger a mouseOverPitch() event. Then, when
// setPitch() is called, if justMadeReal is true, the preview will redraw
// even if the pitch is the same.

// The reason that the preview is removed by the parent when the preview is made
// real is that adding the preview may make the bar change, which could put the
// mouse before / after the note, and we don't know which. Not removing it could
// result in the preview being on the wrong side of the note, which is wrong.
abstract class BasePreview<U> implements Preview {
  protected _pitch: Pitch | null = null;
  protected bar: Bar | null = null;
  protected noteBefore: Note | null = null;
  protected noteAfter: Note | null = null;
  protected justMadeReal = false;

  protected abstract parent(): Previews<U> | null;
  protected abstract toPreview(): U | null;

  setLocation(bar: Bar, noteBefore: Note | null, noteAfter: Note | null) {
    if (
      bar !== this.bar ||
      noteBefore !== this.noteBefore ||
      noteAfter !== this.noteAfter
    ) {
      this.parent()?.removePreview();
      this.bar = bar;
      this.noteBefore = noteBefore;
      this.noteAfter = noteAfter;
      this.update();
      return true;
    }
    return false;
  }

  setPitch(pitch: Pitch | null) {
    if (pitch !== this._pitch || this.justMadeReal) {
      this.justMadeReal = false;
      if (pitch === null) this.parent()?.removePreview();
      this._pitch = pitch;
      this.update();
      return true;
    }
    return false;
  }

  stop() {
    this.parent()?.removePreview();
  }

  makeReal(notes: Note[]) {
    this.parent()?.makePreviewReal(notes);
    this.justMadeReal = true;
  }

  justAdded() {
    return this.justMadeReal;
  }

  private update() {
    const preview = this.toPreview();
    // If this._pitch is null we always want to hide it
    if (this._pitch && preview)
      this.parent()?.setPreview(preview, this.noteBefore, this.noteAfter);
  }
}

export class NotePreview extends BasePreview<Note> {
  private _length: NoteLength;
  private _natural: boolean;

  constructor(length: NoteLength) {
    super();
    this._length = length;
    this._natural = false;
  }

  public natural() {
    return this._natural;
  }

  public toggleNatural() {
    this._natural = !this._natural;
  }

  public length() {
    return this._length;
  }

  protected parent() {
    return this.bar;
  }

  protected toPreview() {
    return (
      this._pitch &&
      new Note(this._pitch, this._length, false, this._natural).makePreview()
    );
  }
}

export class CustomGracenotePreview extends BasePreview<Pitch> {
  // This assumes that the custom gracenote has only one pitch.
  // That's true right now, but in future we may add more options
  // for inputting one's own gracenotes.
  protected parent() {
    return this.noteAfter;
  }

  protected toPreview() {
    return this._pitch;
  }
}

export class ReactiveGracenotePreview extends BasePreview<ReactiveGracenote> {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public isInputting(name: string) {
    return name === this.name;
  }

  protected parent() {
    return this.noteAfter;
  }

  protected toPreview() {
    return new ReactiveGracenote(this.name);
  }
}
