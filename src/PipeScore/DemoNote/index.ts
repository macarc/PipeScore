/*
  DemoNote (preview note) model
  Copyright (C) 2021 macarc
 */
import { Bar } from '../Bar';
import { Update } from '../Controllers/Controller';
import { Pitch } from '../global/pitch';
import { ReactiveGracenote, SingleGracenote } from '../Gracenote';
import { Note, SingleNote } from '../Note';
import { dot, NoteLength } from '../Note/notelength';
import { Previewable } from './previewable';

// This could be cleaned up a bit so that BaseDemo is parameterised
// over the previous
export abstract class BaseDemo<U, T extends Previewable<U>> {
  abstract addNote(
    note: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ): void;

  protected _pitch: Pitch | null;
  protected previous: T | null = null;

  constructor() {
    this._pitch = null;
  }
  public pitch() {
    return this._pitch;
  }
  public removePitch() {
    this._pitch = null;
    if (this.previous && this.previous.hasPreview()) {
      this.previous.removePreview();
      return Update.ViewChanged;
    }
    return Update.NoChange;
  }
  public stop() {
    this.previous?.removePreview();
  }
  public addSelf(noteBefore: SingleNote | null) {
    this.previous?.makePreviewReal(noteBefore);
  }
}

export class DemoNote extends BaseDemo<SingleNote, Bar> {
  private _length: NoteLength;

  constructor(length: NoteLength) {
    super();
    this._length = length;
    this.previous = null;
  }
  public addNote(
    note: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ) {
    if (noteBefore?.isDemo()) {
      noteBefore = this.previous?.previousNote(noteBefore) || null;
    }
    this.previous?.removePreview();
    const n = this.toNote(pitch);
    bar.insertNote(noteBefore, n);
    return n;
  }
  public setPitch(
    pitch: Pitch | null,
    noteBefore: SingleNote | null,
    bar: Bar
  ) {
    // Has to be done first since it's possible this._pitch is null but
    // this.previous still has a preview
    if (pitch === null && this.previous) {
      this.previous.removePreview();
      return Update.ViewChanged;
    }
    if (pitch !== this._pitch) {
      if (this.previous && bar !== this.previous) {
        this.previous.removePreview();
      }
      this.previous = bar;
      if (this.previous && pitch)
        this.previous.setPreview(noteBefore, this.toPreviewNote(pitch));
      return Update.ViewChanged;
    }
    return Update.NoChange;
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
  private toNote(pitch: Pitch) {
    return new SingleNote(pitch, this._length);
  }
  private toPreviewNote(pitch: Pitch) {
    return new SingleNote(pitch, this._length).demo();
  }
}
export class DemoGracenote extends BaseDemo<SingleGracenote, SingleNote> {
  public addNote(
    note: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ) {
    this.previous?.removePreview();
    if (note) note.addGracenote(pitch, noteBefore);
  }
  public setPitch(
    pitch: Pitch,
    note: SingleNote | null,
    bar: Bar,
    previous: Note | null
  ) {
    if (note !== this.previous || pitch !== this._pitch) {
      this._pitch = pitch;
      if (this.previous) this.previous.removePreview();
      this.previous = note;
      if (this.previous && this._pitch)
        this.previous.setPreview(this._pitch, previous);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  }
}

export class DemoReactive extends BaseDemo<ReactiveGracenote, SingleNote> {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
  public addNote(
    note: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ) {
    this.previous?.removePreview();
    if (note) note.addGracenote(this.toGracenote(), noteBefore);
  }
  public setPitch(
    pitch: Pitch | null,
    note: SingleNote | null,
    bar: Bar | null,
    previous: Note | null
  ) {
    if (note !== this.previous) {
      if (this.previous) this.previous.removePreview();
      this.previous = note;
      if (this.previous)
        this.previous.setPreview(new ReactiveGracenote(this.name), previous);
      return Update.ViewChanged;
    }
    return Update.NoChange;
  }
  public toGracenote() {
    return new ReactiveGracenote(this.name);
  }
  public isInputting(name: string) {
    return name === this.name;
  }
}

export type Demo = DemoNote | DemoGracenote | DemoReactive;
