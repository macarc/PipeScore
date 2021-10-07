/*
  DemoNote (preview note) model
  Copyright (C) 2021 Archie Maclean
 */
import { h, svg, V } from '../../render/h';
import { Bar } from '../Bar';
import { Update } from '../Controllers/Controller';
import { noteY, Pitch } from '../global/pitch';
import { ReactiveGracenote, SingleGracenote } from '../Gracenote';
import { Note, SingleNote } from '../Note';
import { dot, NoteLength } from '../Note/notelength';

export interface DemoNoteProps {
  staveY: number;
}
export abstract class BaseDemo {
  protected abstract ledgerWidth(): number;
  protected abstract rx(): number;
  protected abstract ry(): number;

  protected _pitch: Pitch | null;
  protected staveIndex: number;
  protected x: number;

  constructor() {
    this._pitch = null;
    this.staveIndex = 0;
    this.x = 0;
  }

  public setX(x: number) {
    this.x = x;
  }
  public setStaveIndex(staveIndex: number | null) {
    if (staveIndex !== null) {
      this.staveIndex = staveIndex;
    } else {
      this.staveIndex = 0;
      this._pitch = null;
    }
  }
  public setPitch(pitch: Pitch, note: SingleNote | null) {
    if (this._pitch !== pitch) {
      this._pitch = pitch;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  }
  public pitch() {
    return this._pitch;
  }
  public calculateY(topOffset: number, staveGap: number) {
    return topOffset + staveGap * this.staveIndex;
  }
  public render(props: DemoNoteProps): V {
    if (this._pitch) {
      const y = noteY(props.staveY, this._pitch);
      const opacity = 0.9;

      return svg('g', { class: 'demo-note' }, [
        svg('ellipse', {
          cx: this.x,
          cy: y,
          rx: this.rx(),
          ry: this.ry(),
          fill: 'orange',
          'pointer-events': 'none',
          opacity,
        }),
        this._pitch === Pitch.HA
          ? svg('line', {
              x1: this.x - this.ledgerWidth(),
              x2: this.x + this.ledgerWidth(),
              y1: y,
              y2: y,
              stroke: 'orange',
              'pointer-events': 'none',
              opacity,
            })
          : svg('g'),
      ]);
    } else {
      return svg('g');
    }
  }
}

export class DemoNote extends BaseDemo {
  private _length: NoteLength;
  constructor(length: NoteLength) {
    super();
    this._length = length;
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
  public addNote(
    n: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ) {
    if (this._pitch)
      bar.insertNote(noteBefore, new SingleNote(pitch, this._length));
  }
  protected ledgerWidth() {
    return 12;
  }
  protected rx() {
    return 6.5;
  }
  protected ry() {
    return 5;
  }
}
export class DemoGracenote extends BaseDemo {
  private previous: SingleNote | null = null;
  public addNote(
    note: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ) {
    this.previous?.removePreviewGracenote();
    if (note) note.addGracenote(pitch, noteBefore);
  }
  public stop() {
    this.previous?.removePreviewGracenote();
  }
  public setPitch(pitch: Pitch, note: SingleNote | null) {
    if (note !== this.previous || pitch !== this._pitch) {
      super.setPitch(pitch, note);

      if (this.previous) this.previous.removePreviewGracenote();
      this.previous = note;
      if (this.previous && this._pitch)
        this.previous.setPreviewGracenote(new SingleGracenote(this._pitch));
      return Update.ViewChanged;
    }
    return Update.NoChange;
  }
  protected ledgerWidth() {
    return 7;
  }
  protected rx() {
    return 5;
  }
  protected ry() {
    return 3.5;
  }
  public render() {
    return h('g');
  }
}

export class DemoReactive {
  private previous: SingleNote | null = null;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }
  public stop() {
    this.previous?.removePreviewGracenote();
  }
  public addNote(
    note: Note | null,
    pitch: Pitch,
    bar: Bar,
    noteBefore: Note | null
  ) {
    this.previous?.removePreviewGracenote();
    if (note) note.addGracenote(this.toGracenote(), noteBefore);
  }
  public setPitch(pitch: Pitch, note: SingleNote | null) {
    if (note !== this.previous) {
      if (this.previous) this.previous.removePreviewGracenote();
      this.previous = note;
      if (this.previous)
        this.previous.setPreviewGracenote(new ReactiveGracenote(this.name));
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
  public calculateY() {
    return 0;
  }
  public setStaveIndex() {}
  public setX() {}
  public render() {
    return h('g');
  }
}

export type Demo = DemoNote | DemoGracenote | DemoReactive;
