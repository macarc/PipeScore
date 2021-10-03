/*
  Define gracenote format
  Copyright (C) 2021 Archie Maclean
 */
import { svg, V } from '../../render/h';
import { Dispatch, Update } from '../Controllers/Controller';
import { clickGracenote } from '../Controllers/Gracenote';
import { lineGap } from '../global/constants';
import { noteY, Pitch } from '../global/pitch';
import { nlast } from '../global/utils';
import width, { Width } from '../global/width';
import { gracenotes } from './gracenotes';
import { GracenoteState } from './state';

const tailXOffset = 3;
// actually this is half of the head width
const gracenoteHeadRadius = 3.5;
const gracenoteHeadWidth = 2 * gracenoteHeadRadius;
const gracenoteToNoteWidthRatio = 0.6;

// Offsets from the centre of the gracenote head to the point where the stem touches it
const stemXOf = (x: number) => x + 3;
const stemYOf = (y: number) => y - 2;

const colourOf = (selected: boolean) => (selected ? 'orange' : 'black');

export interface GracenoteProps {
  thisNote: Pitch;
  previousNote: Pitch | null;
  y: number;
  x: number;
  noteWidth: number;
  dispatch: Dispatch;
  state: GracenoteState;
}

export abstract class Gracenote {
  abstract notes(thisNote: Pitch, previousNote: Pitch | null): MaybeGracenote;
  abstract render(props: GracenoteProps): V;

  public static from(name: string | null) {
    if (name === null) {
      return new SingleGracenote(Pitch.HG);
    } else if (name === 'none') {
      return new NoGracenote();
    } else {
      return new ReactiveGracenote(name);
    }
  }

  public name() {
    return '';
  }
  public drag(pitch: Pitch) {
    return Update.NoChange;
  }
  public numberOfNotes(thisNote: Pitch, previous: Pitch) {
    const notes = this.notes(thisNote, previous).notes().length;
    if (notes === 0) return 0;
    // We need extra space before the note, so add one note
    return notes + 1;
  }
  public addSingle(
    newPitch: Pitch,
    note: Pitch,
    prev: Pitch | null
  ): Gracenote {
    // Add a single to an existing gracenote
    // Used for creating custom embellisments

    const notes = this.notes(note, prev).notes();
    if (notes.length > 0)
      return new CustomGracenote().addNotes(...notes, newPitch);
    else return new SingleGracenote(newPitch);
  }

  public width(thisNote: Pitch, previousNote: Pitch | null): Width {
    const notes = this.notes(thisNote, previousNote);
    const length = notes.notes().length;
    return width.init(
      2 * gracenoteHeadRadius * length,
      gracenoteToNoteWidthRatio * length
    );
  }
  protected head(
    dispatch: Dispatch,
    x: number,
    y: number,
    note: Pitch,
    beamY: number,
    isValid: boolean,
    isSelected: boolean
  ): V {
    // Draws head and stem

    const ledgerLeft = 5;
    const ledgerRight = 5.1;
    const rotateText = 'rotate(-30 ' + x + ' ' + y + ')';
    const boxWidth = 2.5 * gracenoteHeadRadius;
    const boxHeight = 6;
    const colour = colourOf(isSelected);

    return svg('g', { class: 'gracenote-head' }, [
      note === Pitch.HA
        ? svg('line', {
            x1: x - ledgerLeft,
            x2: x + ledgerRight,
            y1: y,
            y2: y,
            stroke: colour,
          })
        : null,
      svg('ellipse', {
        cx: x,
        cy: y,
        rx: gracenoteHeadRadius,
        ry: 2.5,
        transform: rotateText,
        fill: isValid ? colour : 'red',
        'pointer-events': 'none',
      }),

      svg(
        'rect',
        {
          x: x - boxWidth / 2,
          y: y - boxHeight / 2,
          width: boxWidth,
          height: boxHeight,
          'pointer-events': isSelected ? 'none' : 'default',
          opacity: 0,
        },
        { mousedown: () => dispatch(clickGracenote(this)) }
      ),
      svg('line', {
        x1: x + tailXOffset,
        x2: x + tailXOffset,
        y1: y,
        y2: beamY,
        stroke: colour,
      }),
    ]);
  }
  protected renderSingle(note: Pitch, props: GracenoteProps) {
    const selected = props.state.selected === this;

    const y = noteY(props.y, note);

    const colour = colourOf(selected);

    return svg('g', { class: 'gracenote' }, [
      this.head(
        props.dispatch,
        props.x,
        y,
        note,
        y - 3 * lineGap,
        true,
        selected
      ),

      ...[0, 1, 2].map((n) =>
        svg('line', {
          x1: stemXOf(props.x),
          x2: stemXOf(props.x) + 5,
          y1: stemYOf(y) - 20 + 3 * n,
          y2: stemYOf(y) - 16 + 3 * n,
          stroke: colour,
        })
      ),
    ]);
  }
  protected renderMultiple(pitches: MaybeGracenote, props: GracenoteProps) {
    const selected = props.state.selected === this;
    // If each note is an object, then we can use .indexOf and other related functions
    const uniqueNotes = pitches.notes().map((note) => ({ note }));

    // If the width gets too large, it looks bad, so limit the maximum gap between gracenote heads to 10
    const width = Math.min(gracenoteToNoteWidthRatio * props.noteWidth, 10);
    const offset =
      uniqueNotes.length *
      (gracenoteToNoteWidthRatio * props.noteWidth - width);

    const xOf = (noteObj: { note: Pitch }) =>
      props.x +
      offset +
      uniqueNotes.indexOf(noteObj) * (width + gracenoteHeadWidth);
    const y = (note: Pitch) => noteY(props.y, note);

    if (uniqueNotes.length === 0) {
      return svg('g');
    } else if (uniqueNotes.length === 1) {
      return this.renderSingle(uniqueNotes[0].note, props);
    } else {
      const colour = colourOf(selected);
      return svg('g', { class: 'reactive-gracenote' }, [
        ...[0, 2, 4].map((i) =>
          svg('line', {
            x1: xOf(uniqueNotes[0]) + tailXOffset,
            x2: xOf(nlast(uniqueNotes)) + tailXOffset,
            y1: props.y - 3.5 * lineGap + i,
            y2: props.y - 3.5 * lineGap + i,
            stroke: colour,
          })
        ),

        ...uniqueNotes.map((noteObj) =>
          this.head(
            props.dispatch,
            xOf(noteObj),
            y(noteObj.note),
            noteObj.note,
            props.y - 3.5 * lineGap,
            pitches.isValid(),
            selected
          )
        ),
      ]);
    }
  }
}

export class ReactiveGracenote extends Gracenote {
  private grace: string;
  constructor(grace: string) {
    super();
    if (gracenotes.has(grace)) {
      this.grace = grace;
    } else {
      throw new Error(`${grace} is not a valid gracenote.`);
    }
  }
  public notes(thisNote: Pitch, previousNote: Pitch | null) {
    const notes = gracenotes.get(this.grace);
    if (notes) {
      return notes(thisNote, previousNote);
    } else {
      return new MaybeGracenote([]);
    }
  }
  public name() {
    return this.grace;
  }
  public render(props: GracenoteProps) {
    return this.renderMultiple(
      this.notes(props.thisNote, props.previousNote),
      props
    );
  }
}

export class SingleGracenote extends Gracenote {
  private note: Pitch;
  constructor(note: Pitch) {
    super();
    this.note = note;
  }
  public drag(pitch: Pitch) {
    if (this.note != pitch) {
      this.note = pitch;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  }
  public notes() {
    return new MaybeGracenote([this.note]);
  }
  public render(props: GracenoteProps) {
    return this.renderSingle(this.note, props);
  }
}

export class CustomGracenote extends Gracenote {
  private pitches: Pitch[] = [];

  public notes() {
    return new MaybeGracenote(this.pitches);
  }
  public addNotes(...notes: Pitch[]) {
    this.pitches = this.pitches.concat(notes);
    return this;
  }
  public addNote(note: Pitch) {
    this.pitches.push(note);
    return this;
  }
  public render(props: GracenoteProps) {
    return this.renderMultiple(this.notes(), props);
  }
}

export class NoGracenote extends Gracenote {
  public notes() {
    return new MaybeGracenote([]);
  }
  public name() {
    return 'none';
  }

  public render() {
    return svg('g', []);
  }
}

// consider naming this better
export class MaybeGracenote {
  private pitches: Pitch[];
  private valid: boolean;

  constructor(pitches: Pitch[], valid?: boolean) {
    this.pitches = pitches;
    this.valid = valid || false;
  }
  public isValid() {
    return this.valid;
  }
  public notes() {
    return this.pitches;
  }
}
