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

//  There are two types of gracenote:
//  - ReactiveGracenote - e.g. doubling: a gracenote whose notes depend on
//      the notes in front of and behind it. See ./gracenotes for all
//      reactive gracenote types.
//  - CustomGracenote - just a list of pitches. This includes single gracenotes
//      (e.g. High G gracenote) and gracenotes made by dragging a note of
//      a reactive gracenote.
//  - (NoGracenote - used if the note has no gracenote)

import m from 'mithril';
import { clickGracenote } from '../Events/Gracenote';
import { settings } from '../global/settings';
import { pitchY, Pitch, pitchUp, pitchDown } from '../global/pitch';
import { GracenoteNoteList, noteList, gracenotes } from './gracenotes';
import { GracenoteState } from './state';
import { PlaybackGracenote } from '../Playback';
import { dispatch } from '../Controller';
import {
  SavedCustomGracenote,
  SavedGracenote,
  SavedReactiveGracenote,
} from '../SavedModel';

export interface GracenoteProps {
  thisNote: Pitch;
  previousNote: Pitch | null;
  y: number;
  x: number;
  preview: boolean;
  state: GracenoteState;
}

const tailXOffset = 2.5;
const gracenoteHeadRadius = 3;
const gracenoteHeadHeight = 2;
const gracenoteHeadWidth = 2 * gracenoteHeadRadius;
const gracenoteHeadGap = 1.5 * gracenoteHeadWidth;

// Offsets from the centre of the gracenote head to the point where the stem touches it
const stemXOf = (x: number) => x + 2.5;
const colourOf = (selected: boolean) => (selected ? 'orange' : 'black');

export abstract class Gracenote {
  protected abstract toObject(): object;
  protected abstract type: string;
  abstract drag(pitch: Pitch, index: number): Gracenote;
  abstract notes(thisNote?: Pitch, previous?: Pitch | null): GracenoteNoteList;
  abstract equals(other: Gracenote): boolean;

  toJSON(): SavedGracenote {
    return {
      type: this.type,
      value: this.toObject(),
    } as SavedGracenote;
  }
  static fromJSON(o: SavedGracenote): Gracenote {
    switch (o.type) {
      case 'reactive':
        return ReactiveGracenote.fromObject(o.value);
      case 'single':
        return new CustomGracenote(o.value.note);
      case 'custom':
        return CustomGracenote.fromObject(o.value);
      case 'none':
        return NoGracenote.fromObject();
      default:
        console.error('Unrecognised gracenote', o);
        throw new Error('Unrecognised Gracenote type');
    }
  }
  static fromName(name: string | null) {
    if (name === null) {
      return new CustomGracenote(Pitch.HG);
    } else if (name === 'none') {
      return new NoGracenote();
    } else {
      return new ReactiveGracenote(name);
    }
  }
  moveUp(index: number) {
    const pitch = this.notes()[index];
    if (pitch) return this.drag(pitchUp(pitch), index);
    return null;
  }
  moveDown(index: number) {
    const pitch = this.notes()[index];
    if (pitch) return this.drag(pitchDown(pitch), index);
    return null;
  }
  numberOfNotes() {
    const notes = this.notes().length;
    if (notes === 0) return 0;
    // We need extra space before the note, so add one note
    return notes + 1;
  }
  play(thisNote: Pitch, previousNote: Pitch | null) {
    const notes = this.notes(thisNote, previousNote);
    return notes.invalid
      ? []
      : notes.map((pitch) => new PlaybackGracenote(pitch));
  }
  width(thisNote: Pitch, previousNote: Pitch | null) {
    const notes = this.notes(thisNote, previousNote);
    const length = notes.length;
    return gracenoteHeadGap * length + settings.gapAfterGracenote;
  }
  // Add a single to an existing gracenote
  // Used for creating custom embellisments
  addSingle(newPitch: Pitch, note: Pitch, prev: Pitch | null): Gracenote {
    const notes = this.notes(note, prev);
    return new CustomGracenote(...notes, newPitch);
  }
  removeSingle(index: number) {
    const notes = this.notes();
    if (notes.length <= 1) {
      return new NoGracenote();
    } else {
      return new CustomGracenote(
        ...notes.slice(0, index),
        ...notes.slice(index + 1)
      );
    }
  }
  // Draws head and stem
  head(
    x: number,
    y: number,
    note: Pitch,
    beamY: number,
    isValid: boolean,
    isSelected: boolean,
    isPreview: boolean,
    dragging: boolean,
    index: number
  ): m.Children {
    const stemY = y - 1;
    const ledgerLeft = 5;
    const ledgerRight = 5.1;
    const rotateText = 'rotate(-30 ' + x + ' ' + y + ')';
    const boxWidth = 3 * gracenoteHeadRadius;
    const boxHeight = 8;
    const colour = colourOf(isSelected);

    return m('g[class=gracenote-head]', [
      note === Pitch.HA
        ? m('line', {
            x1: x - ledgerLeft,
            x2: x + ledgerRight,
            y1: y,
            y2: y,
            stroke: colour,
          })
        : null,
      m('ellipse', {
        cx: x,
        cy: y,
        rx: gracenoteHeadRadius,
        ry: gracenoteHeadHeight,
        transform: rotateText,
        fill: isValid ? colour : 'red',
        'pointer-events': 'none',
      }),

      m('rect', {
        x: x - boxWidth / 2,
        y: y - boxHeight / 2,
        width: boxWidth,
        height: boxHeight,
        'pointer-events': isPreview || dragging ? 'none' : 'default',
        style: `cursor: ${isSelected ? 'normal' : 'pointer'}`,
        opacity: 0,
        onmousedown: () => dispatch(clickGracenote(this, index)),
      }),
      m('line', {
        x1: x + tailXOffset,
        x2: x + tailXOffset,
        y1: stemY,
        y2: beamY,
        stroke: colour,
      }),
    ]);
  }
  renderSingle(note: Pitch, props: GracenoteProps) {
    const y = pitchY(props.y, note);
    const wholeSelected =
      props.state.selected?.gracenote === this &&
      props.state.selected?.note === 'all';
    const selected =
      props.state.selected?.gracenote === this &&
      (props.state.selected?.note === 0 || wholeSelected);

    const colour = colourOf(wholeSelected || props.preview);
    const height = settings.lineHeightOf(3);

    return m('g[class=gracenote]', [
      this.head(
        props.x,
        y,
        note,
        y - height,
        true,
        props.preview || selected,
        props.preview,
        props.state.dragged !== null,
        0
      ),

      ...[0, 1, 2].map((n) =>
        m('line', {
          x1: stemXOf(props.x),
          x2: stemXOf(props.x) + 5,
          y1: y - height + 3 * n,
          y2: y - height + 4 + 3 * n,
          stroke: colour,
        })
      ),
    ]);
  }
  render(props: GracenoteProps): m.Children {
    const wholeSelected =
      props.state.selected?.gracenote === this &&
      props.state.selected?.note === 'all';
    const pitches = this.notes(props.thisNote, props.previousNote);

    const x = (i: number) =>
      props.x + settings.gapAfterGracenote / 2 + i * gracenoteHeadGap;
    const y = (p: Pitch) => pitchY(props.y, p);

    if (pitches.length === 0) {
      return m('g');
    } else if (pitches.length === 1) {
      return this.renderSingle(pitches[0], props);
    } else {
      const colour = colourOf(wholeSelected || props.preview);
      const beamY = props.y - settings.lineHeightOf(3.5);
      const tailStart = x(0) + tailXOffset - 0.5;
      const tailEnd = x(pitches.length - 1) + tailXOffset + 0.5;
      const clickBoxMargin = 3;
      return m('g[class=reactive-gracenote]', [
        ...[0, 2, 4].map((i) =>
          m('line', {
            x1: tailStart,
            x2: tailEnd,
            y1: beamY + i,
            y2: beamY + i,
            stroke: colour,
          })
        ),
        m('rect', {
          x: tailStart,
          y: beamY - clickBoxMargin,
          width: tailEnd - tailStart,
          height: 4 + 2 * clickBoxMargin,
          opacity: 0,
          style: 'cursor: pointer;',
          onmousedown: () => dispatch(clickGracenote(this, 'all')),
        }),
        ...pitches.map((pitch, i) =>
          this.head(
            x(i),
            y(pitch),
            pitch,
            beamY,
            !pitches.invalid,
            props.preview ||
              (props.state.selected?.gracenote === this &&
                (i === props.state.selected?.note || wholeSelected)),
            props.preview,
            props.state.dragged !== null,
            i
          )
        ),
      ]);
    }
  }
}

export class ReactiveGracenote extends Gracenote {
  private grace: string;

  // These are just cached so we don't have to pass them to every method
  private thisNote: Pitch = Pitch.A;
  private previousNote: Pitch | null = null;
  public type = 'reactive';

  constructor(grace: string) {
    super();
    if (gracenotes.has(grace)) {
      this.grace = grace;
    } else {
      throw new Error(`${grace} is not a valid gracenote.`);
    }
  }
  static fromObject(o: SavedReactiveGracenote) {
    return new ReactiveGracenote(o.grace);
  }
  toObject(): SavedReactiveGracenote {
    return {
      grace: this.grace,
    };
  }
  equals(other: Gracenote): boolean {
    return other instanceof ReactiveGracenote && this.grace === other.grace;
  }
  copy() {
    return new ReactiveGracenote(this.grace);
  }
  notes(thisNote?: Pitch, previousNote?: Pitch | null) {
    if (thisNote !== undefined) this.thisNote = thisNote;
    if (previousNote !== undefined) this.previousNote = previousNote;

    const notes = gracenotes.get(this.grace);
    if (notes) {
      return notes(this.thisNote, this.previousNote);
    } else {
      return noteList([]);
    }
  }
  drag(pitch: Pitch, index: number) {
    const notes = this.notes(this.thisNote, this.previousNote);
    if (notes[index] !== pitch) {
      return new CustomGracenote(
        ...notes.slice(0, index),
        pitch,
        ...notes.slice(index + 1)
      );
    }
    return this;
  }
  name() {
    return this.grace;
  }
  render(props: GracenoteProps) {
    this.thisNote = props.thisNote;
    this.previousNote = props.previousNote;
    return super.render(props);
  }
}

export class CustomGracenote extends Gracenote {
  private pitches: Pitch[] = [];

  protected type = 'custom';

  constructor(...pitches: Pitch[]) {
    super();
    this.pitches = pitches;
  }
  toObject(): SavedCustomGracenote {
    return {
      pitches: this.pitches,
    };
  }
  static fromObject(o: SavedCustomGracenote) {
    return new CustomGracenote(...o.pitches);
  }

  equals(other: Gracenote): boolean {
    return (
      other instanceof CustomGracenote &&
      other.pitches.every((p, i) => this.pitches[i] === p)
    );
  }
  drag(pitch: Pitch, index: number) {
    if (pitch !== this.pitches[index]) {
      this.pitches[index] = pitch;
      return new CustomGracenote(
        ...this.pitches.slice(0, index),
        pitch,
        ...this.pitches.slice(index + 1)
      );
    }
    return this;
  }
  copy() {
    return new CustomGracenote(...this.pitches);
  }
  notes() {
    return noteList(this.pitches);
  }
}

export class NoGracenote extends Gracenote {
  type = 'none';

  static fromObject() {
    return new NoGracenote();
  }
  toObject() {
    return {};
  }
  equals(other: Gracenote) {
    return other instanceof NoGracenote;
  }
  copy() {
    return new NoGracenote();
  }
  drag() {
    return this;
  }
  notes() {
    return noteList([]);
  }
}
