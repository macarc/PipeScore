/*
  There are 3 things that can be previewed:
  - Notes
  - Single gracenotes
  - Reactive gracenotes
  When you are inputting these, the preview shows
  up as an orange note in the place that the note
  would be if you placed it.

  Copyright (C) 2021 macarc
 */
import { Bar } from '../Bar';
import { Pitch } from '../global/pitch';
import { ReactiveGracenote, SingleGracenote } from '../Gracenote';
import { Note, SingleNote } from '../Note';
import { dot, NoteLength } from '../Note/notelength';
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
  makeReal(notes: SingleNote[]): void;
}

abstract class BasePreview<U> implements Preview {
  protected _pitch: Pitch | null = null;
  protected bar: Bar | null = null;
  protected noteBefore: SingleNote | null = null;
  protected noteAfter: SingleNote | null = null;

  setLocation(
    bar: Bar,
    noteBefore: SingleNote | null,
    noteAfter: SingleNote | null
  ) {
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
    if (pitch !== this._pitch) {
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
  makeReal(notes: SingleNote[]) {
    this.parent()?.makePreviewReal(notes);
  }

  private update() {
    const preview = this.toPreview();
    // If this._pitch is null we always want to hide it
    if (this._pitch && preview)
      this.parent()?.setPreview(preview, this.noteAfter);
  }
  protected abstract parent(): Previews<U> | null;
  protected abstract toPreview(): U | null;
}

export class NotePreview extends BasePreview<SingleNote> {
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
  public setLength(length: NoteLength) {
    this._length = length;
  }
  public toggleDot() {
    this._length = dot(this._length);
  }
  protected parent() {
    return this.bar;
  }
  protected toPreview() {
    return (
      this._pitch &&
      new SingleNote(
        this._pitch,
        this._length,
        false,
        this._natural
      ).makePreview()
    );
  }
}

export class SingleGracenotePreview extends BasePreview<SingleGracenote> {
  protected parent() {
    return this.noteAfter;
  }
  protected toPreview() {
    return this._pitch && new SingleGracenote(this._pitch);
  }
}

export class ReactiveGracenotePreview extends BasePreview<ReactiveGracenote> {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
  protected parent() {
    return this.noteAfter;
  }
  protected toPreview() {
    return new ReactiveGracenote(this.name);
  }
  public isInputting(name: string) {
    return name === this.name;
  }
}
