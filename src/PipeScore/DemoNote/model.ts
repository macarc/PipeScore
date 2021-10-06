/*
  DemoNote (preview note) model
  Copyright (C) 2021 Archie Maclean
 */
import { svg, V } from '../../render/h';
import { noteY, Pitch } from '../global/pitch';
import { SingleNote } from '../Note/model';
import { dot, NoteLength } from '../Note/notelength';

export interface DemoNoteProps {
  staveY: number;
}
export abstract class Demo {
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
  public setPitch(pitch: Pitch) {
    this._pitch = pitch;
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

export class DemoNote extends Demo {
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
  public toNote(pitch: Pitch) {
    return new SingleNote(pitch, this._length);
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
export class DemoGracenote extends Demo {
  protected ledgerWidth() {
    return 7;
  }
  protected rx() {
    return 5;
  }
  protected ry() {
    return 3.5;
  }
}
