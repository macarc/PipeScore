/*
  DemoNote (preview note) model
  Copyright (C) 2021 macarc
 */
import { Bar } from '../Bar';
import { Pitch } from '../global/pitch';
import { ReactiveGracenote, SingleGracenote } from '../Gracenote';
import { Note, SingleNote } from '../Note';
import { dot, NoteLength } from '../Note/notelength';
import { Previewable } from './previewable';

export interface Demo {
  setPitch(pitch: Pitch | null): boolean;
  setLocation(
    bar: Bar,
    noteBefore: Note | null,
    noteAfter: Note | null
  ): boolean;
  stop(): void;
  makeReal(notes: SingleNote[]): void;
}

abstract class BaseDemo<U> implements Demo {
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
  protected abstract parent(): Previewable<U> | null;
  protected abstract toPreview(): U | null;
}

export class DemoNote extends BaseDemo<SingleNote> {
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
      new SingleNote(this._pitch, this._length, false, this._natural).demo()
    );
  }
}
export class DemoGracenote extends BaseDemo<SingleGracenote> {
  protected parent() {
    return this.noteAfter;
  }
  protected toPreview() {
    return this._pitch && new SingleGracenote(this._pitch);
  }
}

export class DemoReactive extends BaseDemo<ReactiveGracenote> {
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
