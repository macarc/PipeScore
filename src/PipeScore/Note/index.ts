/*
  Note format
  Copyright (C) 2021 Archie Maclean
 */
import { pitchOffset, noteY, Pitch, pitchUp, pitchDown } from '../global/pitch';
import { genId, ID, Item } from '../global/id';
import { Gracenote, GracenoteProps, NoGracenote } from '../Gracenote';
import { arrayflatten, nfirst, nlast, nmap, Obj } from '../global/utils';
import { dot, dotted, lengthInBeats, NoteLength } from './notelength';
import width, { Width } from '../global/width';
import { V } from '../../render/types';
import { svg } from '../../render/h';
import { Dispatch, Update } from '../Controllers/Controller';
import { NoteState } from './state';
import { GracenoteState } from '../Gracenote/state';
import { mouseOverPitch } from '../Controllers/Mouse';
import { getXY, setXY } from '../global/xy';
import { addNoteBefore, clickNote } from '../Controllers/Note';
import { noteBoxes } from '../global/noteboxes';
import { PlaybackElement } from '../Playback';

export interface PreviousNote {
  pitch: Pitch;
  x: number;
  y: number;
}

const tailGap = 5;
const shortTailLength = 10;
// note that this is half the width of the note, not the actual radius
// (the actual radius will actually be slightly larger since the note head is slanted slightly)
const noteHeadRadius = 4;
const noteHeadWidth = 2 * noteHeadRadius;

interface NoteProps {
  x: number;
  y: number;
  previousNote: Note | null;
  noteWidth: number;
  endOfLastStave: number;
  dispatch: Dispatch;
  onlyNoteInBar: boolean;
  state: NoteState;
  gracenoteState: GracenoteState;
}
abstract class BaseNote extends Item {
  protected length: NoteLength;
  protected tied: boolean;
  abstract addGracenote(
    gracenote: Pitch | Gracenote,
    previous: Note | null
  ): void;
  abstract width(previous: Pitch | null): Width;
  abstract firstSingle(): SingleNote;
  abstract firstPitch(): Pitch;
  abstract lastPitch(): Pitch;
  protected abstract setFirstPitch(pitch: Pitch): void;
  protected abstract setLastPitch(pitch: Pitch): void;
  abstract play(previous: Pitch | null): PlaybackElement[];
  abstract toObject(): Obj;
  abstract render(props: NoteProps): V;

  constructor(length: NoteLength, tied = false) {
    super(genId());
    this.length = length;
    this.tied = tied;
  }
  public setLength(length: NoteLength) {
    this.length = length;
  }
  public toggleDot() {
    return (this.length = dot(this.length));
  }
  public toggleTie(notes: BaseNote[]) {
    this.tied = !this.tied;
    this.makeCorrectTie(notes);
  }
  public makeCorrectTie(notes: BaseNote[]) {
    // Corrects the pitches of any notes tied to this note

    for (let i = 0; i < notes.length; i++) {
      if (notes[i].hasID(this.id)) {
        let pitch = this.firstPitch();
        // Work backwards while tied, ensuring all notes
        // are the same pitch
        for (
          let b = i, previousNote = notes[b];
          b > 0 && previousNote.tied;
          b--, previousNote = notes[b - 1]
        ) {
          previousNote.setLastPitch(pitch);
          if (previousNote instanceof Triplet) break;
        }
        pitch = this.lastPitch();
        // Work forwards while tied, ensuring all notes
        // are the same pitch
        if (this instanceof SingleNote) {
          for (
            let a = i, nextNote = notes[a + 1];
            a < notes.length - 1 && nextNote.tied;
            a++, nextNote = notes[a + 1]
          ) {
            nextNote.setFirstPitch(pitch);
            if (nextNote instanceof Triplet) break;
          }
          break;
        }
      }
    }
  }
  public copy() {
    const n = BaseNote.fromJSON(this.toJSON());
    n.id = genId();
    return n;
  }
  public static fromJSON(o: Obj) {
    if (o.notetype !== 'single' && o.notetype !== 'triplet')
      throw new Error(`Unrecognised note type ${o.notetype}`);

    const s =
      o.notetype === 'single'
        ? SingleNote.fromObject(o.value)
        : Triplet.fromObject(o.value);
    s.id = o.id;
    return s;
  }
  public toJSON() {
    if (this instanceof SingleNote) {
      return {
        notetype: 'single',
        id: this.id,
        value: this.toObject(),
      };
    } else if (this instanceof Triplet) {
      return {
        notetype: 'triplet',
        id: this.id,
        value: this.toObject(),
      };
    } else {
      throw new Error('Unrecognised note type.');
    }
  }
  public static flatten(notes: Note[]): SingleNote[] {
    return notes.flatMap((note) =>
      note instanceof Triplet ? note.tripletSingleNotes() : note
    );
  }
  public static ungroupNotes(notes: Note[][]) {
    return arrayflatten(notes);
  }
  public static groupNotes(
    notes: Note[],
    findLengthOfGroup: (i: number) => number
  ): (SingleNote[] | Triplet)[] {
    let i = 0;
    let lengthOfGroup = findLengthOfGroup(i);
    const pushNote = (
      group: SingleNote[],
      note: SingleNote,
      currentLength: number,
      lengthOfNote: number
    ): number => {
      if (note.hasBeam()) {
        group.push(note);
        return currentLength + lengthOfNote;
      } else {
        // Push the note as its own group.
        if (group.length > 0) groupedNotes.push(group.slice());
        group.splice(0, group.length, note);
        groupedNotes.push(group.slice());
        group.splice(0, group.length);

        return (currentLength + lengthOfNote) % lengthOfGroup;
      }
    };
    let currentGroup: SingleNote[] = [];
    const groupedNotes: (SingleNote[] | Triplet)[] = [];
    // This must be separate from currentGroup in the case that , e.g. it goes Quaver,Crotchet,Quaver,Quaver
    // In this case, the last two quavers should not be tied. If currentLength was tied to currentGroup, that
    // behaviour would not be achievable
    let currentLength = 0;
    for (const note of notes) {
      if (note instanceof Triplet) {
        if (currentGroup.length > 0) {
          groupedNotes.push(currentGroup);
          lengthOfGroup = findLengthOfGroup(++i);
        }
        groupedNotes.push(note);
        lengthOfGroup = findLengthOfGroup(++i);
        currentGroup = [];
        currentLength = 0;
      } else {
        const length = note.lengthInBeats();
        if (currentLength + length < lengthOfGroup) {
          currentLength = pushNote(currentGroup, note, currentLength, length);
        } else if (currentLength + length === lengthOfGroup) {
          currentLength = pushNote(currentGroup, note, currentLength, length);
          // this check is needed since pushNote could end up setting currentGroup to have no notes in it
          if (currentGroup.length > 0) {
            groupedNotes.push(currentGroup);
            lengthOfGroup = findLengthOfGroup(++i);
          }
          currentLength = 0;
          currentGroup = [];
        } else {
          if (currentGroup.length > 0) groupedNotes.push(currentGroup);
          currentGroup = [];
          currentLength = pushNote(currentGroup, note, currentLength, length);
          if (currentLength >= lengthOfGroup) {
            if (currentGroup.length > 0) {
              groupedNotes.push(currentGroup);
              lengthOfGroup = findLengthOfGroup(++i);
            }
            currentGroup = [];
            currentLength = 0;
          }
        }
      }
    }
    if (currentGroup.length > 0) groupedNotes.push(currentGroup);
    return groupedNotes;
  }

  protected shouldTie(previous: Note | null): previous is SingleNote {
    return this.tied && previous instanceof SingleNote;
  }
  protected numTails() {
    switch (this.length) {
      case NoteLength.Semibreve:
      case NoteLength.DottedMinim:
      case NoteLength.Minim:
      case NoteLength.DottedCrotchet:
      case NoteLength.Crotchet:
        return 0;
      case NoteLength.DottedQuaver:
      case NoteLength.Quaver:
        return 1;
      case NoteLength.DottedSemiQuaver:
      case NoteLength.SemiQuaver:
        return 2;
      case NoteLength.DottedDemiSemiQuaver:
      case NoteLength.DemiSemiQuaver:
        return 3;
      case NoteLength.DottedHemiDemiSemiQuaver:
      case NoteLength.HemiDemiSemiQuaver:
        return 4;
    }
  }
  protected lengthInBeats(): number {
    return lengthInBeats(this.length);
  }
  protected hasDot() {
    return dotted(this.length);
  }
  protected hasBeam() {
    return this.lengthInBeats() < 1;
  }
  protected isFilled() {
    return this.lengthInBeats() < 2;
  }
  protected hasStem() {
    return this.length !== NoteLength.Semibreve;
  }
}

export class SingleNote extends BaseNote {
  private pitch: Pitch;
  private gracenote: Gracenote;
  private previewGracenote: Gracenote | null;

  constructor(
    pitch: Pitch,
    length: NoteLength,
    tied = false,
    gracenote: Gracenote = new NoGracenote()
  ) {
    super(length, tied);
    this.pitch = pitch;
    this.gracenote = gracenote;
    this.previewGracenote = null;
  }
  public static spacerWidth() {
    return width.init(noteHeadWidth, 1);
  }
  public static totalWidth(notes: SingleNote[], prevNote: Pitch | null): Width {
    // Finds the total width of the note array in beat widths
    return notes
      .map((n, i) => n.width(i === 0 ? prevNote : notes[i - 1].lastPitch()))
      .reduce(width.add, width.zero());
  }
  public static fromObject(o: Obj) {
    return new SingleNote(
      o.pitch,
      o.length,
      o.tied,
      Gracenote.fromJSON(o.gracenote)
    );
  }
  public toObject() {
    return {
      pitch: this.pitch,
      length: this.length,
      tied: this.tied,
      gracenote: this.gracenote.toJSON(),
    };
  }
  public setPreviewGracenote(gracenote: Gracenote) {
    if (!this.gracenote.equals(gracenote)) this.previewGracenote = gracenote;
  }
  public removePreviewGracenote() {
    this.previewGracenote = null;
  }
  public drag(pitch: Pitch): Update {
    if (pitch === this.pitch) return Update.NoChange;
    this.pitch = pitch;
    return Update.ViewChanged;
  }
  public moveUp() {
    this.pitch = pitchUp(this.pitch);
  }
  public moveDown() {
    this.pitch = pitchDown(this.pitch);
  }
  private widthOfGracenote(prevNote: Pitch | null) {
    return this.tied
      ? width.zero()
      : this.previewGracenote
      ? this.previewGracenote.width(this.pitch, prevNote)
      : this.gracenote.width(this.pitch, prevNote);
  }
  public width(prevNote: Pitch | null): Width {
    return width.addAll(
      width.init(noteHeadWidth, 1),
      this.hasDot() ? width.init(5, 0) : width.zero(),
      this.widthOfGracenote(prevNote)
    );
  }
  public firstSingle() {
    return this;
  }
  public firstPitch() {
    return this.pitch;
  }
  public setFirstPitch(pitch: Pitch) {
    this.pitch = pitch;
  }
  public lastPitch() {
    return this.pitch;
  }
  public setLastPitch(pitch: Pitch) {
    this.pitch = pitch;
  }
  public y(staveY: number) {
    return noteY(staveY, this.pitch);
  }
  public play(previous: Pitch | null) {
    return [
      ...this.gracenote.play(this.pitch, previous),
      {
        pitch: this.pitch,
        tied: this.tied,
        duration: this.lengthInBeats(),
      },
    ];
  }
  public addGracenote(g: Pitch | Gracenote, previous: Note | null = null) {
    if (g instanceof Gracenote) {
      this.gracenote = g;
    } else {
      this.gracenote = this.gracenote.addSingle(
        g,
        this.pitch,
        previous && previous.lastPitch()
      );
    }
  }
  public replaceGracenote(g: Gracenote, n: Gracenote) {
    if (this.gracenote === g) this.gracenote = n;
  }
  public static toTriplet(
    first: SingleNote,
    second: SingleNote,
    third: SingleNote
  ) {
    return new Triplet(first.length, [first, second, third]);
  }
  private static beamFrom(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    tails1: number,
    tails2: number,
    tailsBefore: number,
    tailsAfter: number
  ): V {
    // Draws beams from note1 at x1,y1 with tails1 to note2 x2,y2 with tails2

    const leftIs1 = x1 < x2;
    const leftTails = leftIs1 ? tails1 : tails2;
    const rightTails = leftIs1 ? tails2 : tails1;
    const xL = leftIs1 ? x1 : x2;
    const xR = leftIs1 ? x2 : x1;
    const yL = leftIs1 ? y1 : y2;
    const yR = leftIs1 ? y2 : y1;

    const moreTailsOnLeft = leftTails > rightTails;
    const drawExtraTails = moreTailsOnLeft
      ? leftTails > tailsBefore
      : rightTails > tailsAfter;

    // tails shared by both notes
    const sharedTails = moreTailsOnLeft
      ? [...Array(rightTails).keys()]
      : [...Array(leftTails).keys()];
    // tails extra tails for one note
    const extraTails = drawExtraTails
      ? moreTailsOnLeft
        ? [...Array(leftTails).keys()].splice(rightTails)
        : [...Array(rightTails).keys()].splice(leftTails)
      : [];

    const tailEndY = moreTailsOnLeft
      ? // because similar triangles
        yL + (shortTailLength / (xR - xL)) * (yR - yL)
      : yR - (shortTailLength / (xR - xL)) * (yR - yL);

    return svg('g', { class: 'tails' }, [
      ...sharedTails.map((i) =>
        svg('line', {
          x1: xL,
          x2: xR,
          y1: yL - i * tailGap,
          y2: yR - i * tailGap,
          stroke: 'black',
          'stroke-width': 2,
        })
      ),
      ...extraTails.map((i) =>
        svg('line', {
          x1: moreTailsOnLeft ? xL : xR,
          x2: moreTailsOnLeft ? xL + shortTailLength : xR - shortTailLength,
          y1: (moreTailsOnLeft ? yL : yR) - i * tailGap,
          y2: tailEndY - i * tailGap,
          stroke: 'black',
          'stroke-width': 2,
        })
      ),
    ]);
  }
  private renderGracenote(props: GracenoteProps) {
    if (this.previewGracenote) {
      return this.previewGracenote.render({
        ...props,
        x: props.x + noteHeadRadius / 2,
        preview: true,
      });
    }
    return this.gracenote.render({
      ...props,
      x: props.x + noteHeadRadius / 2,
      preview: false,
    });
  }
  private noteHead(
    x: number,
    y: number,
    mousedown: (e: MouseEvent) => void,
    props: NoteProps,
    opacity = 1
  ): V {
    // Draws note head, ledger line and dot, as well as mouse event box

    const gracenoteBeingDragged = props.gracenoteState.dragged !== null;

    const rotation = this.hasStem() ? -35 : 0;
    const noteWidth = Math.abs(
      noteHeadRadius / Math.cos((2 * Math.PI * rotation) / 360)
    );
    const noteHeight = 3.5;
    const maskRotation = this.hasStem() ? 0 : rotation + 60;

    const maskrx = this.hasStem() ? 5 : 4;
    const maskry = 2;

    const clickableWidth = 30;
    const clickableHeight = 12;

    const dotted = this.hasDot();
    const dotYOffset = [Pitch.G, Pitch.B, Pitch.D, Pitch.F, Pitch.HA].includes(
      this.pitch
    )
      ? -3
      : 0;
    const dotXOffset = 10;

    // pointer events must be set so that if any note is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)
    const pointerEvents =
      props.state.dragged || gracenoteBeingDragged ? 'none' : 'visiblePainted';

    const filled = this.isFilled();

    const rotateText = `rotate(${rotation} ${x} ${y})`;
    const maskRotateText = `rotate(${maskRotation} ${x} ${y})`;

    const colour = 'black';
    const maskId = Math.random();
    const mask = `url(#${maskId})`;
    return svg('g', { class: 'note-head' }, [
      svg('mask', { id: maskId }, [
        svg('rect', {
          x: x - 10,
          y: y - 10,
          width: 20,
          height: 20,
          fill: 'white',
        }),
        svg('ellipse', {
          cx: x,
          cy: y,
          rx: maskrx,
          ry: maskry,
          'stroke-width': 0,
          fill: colour,
          transform: maskRotateText,
        }),
      ]),
      svg('ellipse', {
        cx: x,
        cy: y,
        rx: noteWidth,
        ry: noteHeight,
        stroke: colour,
        fill: colour,
        transform: rotateText,
        'pointer-events': pointerEvents,
        opacity,
        mask: filled ? '' : mask,
      }),
      dotted
        ? svg('circle', {
            cx: x + dotXOffset,
            cy: y + dotYOffset,
            r: 1.5,
            fill: colour,
            'pointer-events': 'none',
            opacity,
          })
        : null,
      this.pitch === Pitch.HA
        ? svg('line', {
            class: 'ledger',
            x1: x - 8,
            x2: x + 8,
            y1: y,
            y2: y,
            stroke: colour,
            'pointer-events': pointerEvents,
            opacity,
          })
        : null,

      svg(
        'rect',
        {
          x: x - clickableWidth / 2,
          y: y - clickableHeight / 2,
          width: clickableWidth,
          height: clickableHeight,
          'pointer-events': pointerEvents,
          opacity: 0,
        },
        {
          mousedown: mousedown as (e: Event) => void,
          mouseover: () => props.dispatch(mouseOverPitch(this.pitch, this)),
        }
      ),
    ]);
  }
  private tie(
    x: number,
    staveY: number,
    noteWidth: number,
    previousNote: SingleNote,
    lastStaveX: number
  ): V {
    // Draws a tie to previousNote

    const previous = getXY(previousNote.id);
    if (!previous) return svg('g');

    const tieOffsetY = 10;
    const tieHeight = 15;
    const tieWidth = 8;
    const x0 = x - 1 + noteHeadRadius;
    const y0 = this.y(staveY) - tieOffsetY;
    const x1 = previous.afterX + 1 - noteHeadRadius;
    const y1 = previousNote.y(previous.y) - tieOffsetY;
    const midx = previous.afterX + (x - previous.afterX) / 2.0;
    const midy = y0 + (y1 - y0) / 2.0;
    const midloy = midy - tieHeight;
    const midhiy = midy - tieHeight - tieWidth;
    const path =
      y0 === y1
        ? `M ${x0},${y0} S ${midx},${midhiy}, ${x1},${y1}` +
          `M ${x1},${y1} S ${midx},${midloy}, ${x0},${y0}`
        : `M ${x0},${y0} S ${x0 - noteWidth / 2},${
            y0 - tieHeight - tieWidth
          }, ${x0 - noteWidth},${y0}` +
          `M ${x0 - noteWidth},${y0} S ${x0 - noteWidth / 2},${
            y0 - tieHeight
          }, ${x0},${y0}` +
          `M ${x1},${y1} S ${(lastStaveX - x1) / 2 + x1},${
            y1 - tieHeight - tieWidth
          }, ${lastStaveX},${y1}` +
          `M ${lastStaveX},${y1} S ${(lastStaveX - x1) / 2 + x1},${
            y1 - tieHeight
          }, ${x1},${y1} `;
    return svg('path', { class: 'note-tie', d: path, stroke: 'black' });
  }
  public render(props: NoteProps): V {
    // Draws a single note
    const xOffset = width.reify(SingleNote.spacerWidth(), props.noteWidth);

    setXY(
      this.id,
      props.x + xOffset,
      props.x +
        xOffset +
        width.reify(
          this.widthOfGracenote(props.previousNote?.lastPitch() || null),
          props.noteWidth
        ) +
        noteHeadWidth,
      props.y
    );
    const gracenoteProps = {
      // can just be props.x since it is the first note
      x: props.x + xOffset,
      y: props.y,
      noteWidth: props.noteWidth,
      thisNote: this.pitch,
      preview: false,
      previousNote: props.previousNote?.lastPitch() || null,
      dispatch: props.dispatch,
      state: props.gracenoteState,
    };

    const x =
      props.x +
      xOffset +
      width.reify(
        this.widthOfGracenote(props.previousNote?.lastPitch() || null),
        props.noteWidth
      );
    const y = this.y(props.y);
    const stemY = y + 30;
    const numberOfTails = this.numTails();

    return svg('g', { class: 'singleton' }, [
      this.shouldTie(props.previousNote)
        ? this.tie(
            x,
            props.y,
            props.noteWidth,
            props.previousNote,
            props.endOfLastStave
          )
        : null,
      this.shouldTie(props.previousNote)
        ? null
        : this.renderGracenote(gracenoteProps),

      this.noteHead(
        x + noteHeadRadius,
        y,
        (event: MouseEvent) => props.dispatch(clickNote(this, event)),
        props
      ),
      this.hasStem()
        ? svg('line', { x1: x, x2: x, y1: y, y2: stemY, stroke: 'black' })
        : null,

      numberOfTails > 0
        ? svg(
            'g',
            { class: 'tails' },
            [...Array(numberOfTails).keys()].map((t) =>
              svg('line', {
                x1: x,
                x2: x + 10,
                y1: stemY - 5 * t,
                y2: stemY - 5 * t - 10,
                stroke: 'black',
                'stroke-width': 2,
              })
            )
          )
        : null,

      props.state.inputtingNotes
        ? noteBoxes(
            props.x,
            props.y,
            x + noteHeadRadius - props.x, //props.noteWidth - xOffset,
            (pitch) => props.dispatch(mouseOverPitch(pitch, this)),
            (pitch) => props.dispatch(addNoteBefore(pitch, this))
          )
        : null,
    ]);
  }
  public static renderMultiple(notes: SingleNote[], props: NoteProps) {
    if (notes.length === 0) {
      return svg('g');
    } else if (notes.length === 1) {
      return notes[0].render(props);
    }

    const xOffset = width.reify(SingleNote.spacerWidth(), props.noteWidth);
    const previousPitch = props.previousNote?.lastPitch() || null;
    const xOfGracenote = (noteIndex: number) =>
      props.x +
      xOffset +
      width.reify(
        SingleNote.totalWidth(notes.slice(0, noteIndex), previousPitch),
        props.noteWidth
      );
    const xOf = (i: number) =>
      xOfGracenote(i) +
      width.reify(
        notes[i].widthOfGracenote(
          i === 0 ? previousPitch : notes[i - 1].lastPitch()
        ),
        props.noteWidth
      );
    const yOf = (note: SingleNote) => note.y(props.y);

    const totalXWidth = width.reify(
      SingleNote.totalWidth(notes, previousPitch),
      props.noteWidth
    );

    const firstNote = notes[0];
    const lastNote = nlast(notes);

    const setNoteXY = (note: SingleNote, index: number) =>
      setXY(note.id, xOfGracenote(index), xOf(index) + noteHeadWidth, props.y);

    const cap = (n: number, max: number) =>
      n > max ? max : n < -max ? -max : n;

    const diff = cap(
      // todo cap should be dependent on how many notes are in the group
      // difference between first and last notes in a group
      pitchOffset(lastNote.pitch) - pitchOffset(firstNote.pitch),
      30 / notes.length
    );

    const [lowestNote, lowestNoteIndex, multipleLowest] = notes.reduce(
      (last, next, index) => {
        if (index === 0) {
          return last;
        }
        const [lowestNoteSoFar, lowestNoteIndexSoFar] = last;
        if (pitchOffset(next.pitch) === pitchOffset(lowestNoteSoFar.pitch)) {
          return [lowestNoteSoFar, lowestNoteIndexSoFar, true];
        } else if (
          pitchOffset(next.pitch) > pitchOffset(lowestNoteSoFar.pitch)
        ) {
          return [next, index, false];
        } else {
          return last;
        }
      },
      [firstNote, 0, false] as [SingleNote, number, boolean]
    );

    const diffForLowest =
      30 +
      pitchOffset(lowestNote.pitch) -
      (multipleLowest ? 0 : (diff * xOf(lowestNoteIndex)) / totalXWidth);

    const stemYOf = (note: SingleNote, index: number) =>
      note.hasBeam()
        ? props.y +
          (multipleLowest
            ? // straight line if there is more than one lowest note
              0
            : // otherwise use a slant
              (diff * xOf(index)) / totalXWidth) +
          // offset so that the lowest note is always a constant height
          diffForLowest
        : noteY(props.y, note.pitch) + 30;

    return svg(
      'g',
      { class: 'grouped-notes' },
      notes.map((note, index) => {
        const previousNote = notes[index - 1] || props.previousNote;

        setNoteXY(note, index);
        const noteBoxX = index === 0 ? props.x : xOf(index - 1); // xOf(index) + noteHeadWidth,

        const gracenoteProps = {
          x: xOfGracenote(index),
          y: props.y,
          noteWidth: props.noteWidth,
          thisNote: note.pitch,
          preview: false,
          previousNote:
            nmap(previousNote, (p) => p.lastPitch()) ||
            nmap(props.previousNote, (p) => p.lastPitch()),
          dispatch: props.dispatch,
          state: props.gracenoteState,
        };

        return svg('g', { class: `grouped-note ${note.pitch}` }, [
          note.shouldTie(previousNote)
            ? note.tie(
                xOf(index),
                props.y,
                props.noteWidth,
                previousNote,
                props.endOfLastStave
              )
            : null,
          note.shouldTie(previousNote)
            ? null
            : note.renderGracenote(gracenoteProps),

          previousNote !== null && index > 0
            ? SingleNote.beamFrom(
                xOf(index),
                stemYOf(note, index),
                xOf(index - 1),
                stemYOf(previousNote, index - 1),
                note.numTails(),
                previousNote.numTails(),
                nmap(notes[index - 2] || null, (n) => n.numTails()) || 0,
                nmap(notes[index + 1] || null, (n) => n.numTails()) || 0
              )
            : null,

          note.noteHead(
            xOf(index) + noteHeadRadius,
            yOf(note),
            (event: MouseEvent) => props.dispatch(clickNote(note, event)),
            props
          ),

          props.state.inputtingNotes
            ? noteBoxes(
                noteBoxX,
                props.y,
                xOf(index) + noteHeadRadius - noteBoxX,
                (pitch) => props.dispatch(mouseOverPitch(pitch, note)),
                (pitch) => props.dispatch(addNoteBefore(pitch, note))
              )
            : svg('g'),

          svg('line', {
            x1: xOf(index),
            x2: xOf(index),
            y1: yOf(note),
            y2: stemYOf(note, index),
            stroke: 'black',
          }),
        ]);
      })
    );
  }
}

export class Triplet extends BaseNote {
  // It is assumed that _notes always has length >= 1
  // Whenever notes are deleted, this should be ensured
  private _notes: SingleNote[];

  constructor(length: NoteLength, notes: SingleNote[]) {
    super(length);
    this._notes = notes;
  }
  public copy() {
    const n = Triplet.fromObject(this.toObject());
    n.id = genId();
    n._notes.forEach((note) => (note.id = genId()));
    return n;
  }
  public static fromObject(o: Obj) {
    return new Triplet(
      o.length,
      o.notes.map((note: Obj) => SingleNote.fromObject(note))
    );
  }
  public hasID(id: ID) {
    return (
      super.hasID(id) ||
      this._notes.reduce<boolean>((acc, n) => acc || n.hasID(id), false)
    );
  }
  public toObject() {
    return {
      id: this.id,
      notes: this._notes.map((n) => n.toObject()),
      length: this.length,
      tied: this.tied,
    };
  }
  public tripletSingleNotes() {
    return this._notes;
  }
  public width(prevNote: Pitch | null): Width {
    return SingleNote.totalWidth(this._notes, prevNote);
  }
  public firstSingle() {
    return nfirst(this._notes);
  }
  public firstPitch() {
    return this.firstSingle().firstPitch();
  }
  public setFirstPitch(pitch: Pitch) {
    this.firstSingle().setFirstPitch(pitch);
  }
  public lastSingle() {
    return nlast(this._notes);
  }
  public lastPitch() {
    return this.lastSingle().lastPitch();
  }
  public setLastPitch(pitch: Pitch) {
    nlast(this._notes).setLastPitch(pitch);
  }
  public addGracenote(g: Pitch | Gracenote, previous: Note | null) {
    this.firstSingle().addGracenote(g, previous);
  }
  public play(previous: Pitch | null) {
    return this._notes
      .flatMap((n, i) => n.play(this._notes[i - 1].lastPitch() || previous))
      .map((n) => ({ ...n, duration: (2 / 3) * n.duration }));
  }
  private tripletLine(
    staveY: number,
    x1: number,
    x2: number,
    y1: number,
    y2: number
  ): V {
    // Draws a triplet marking from x1,y1 to x2,y2

    const midx = x1 + (x2 - x1) / 2;
    const height = 40;
    const midy = staveY - height;
    const gap = 15;
    const path = `M ${x1},${y1 - gap} Q ${midx},${midy},${x2},${y2 - gap}`;
    return svg('g', { class: 'triplet' }, [
      svg('text', { x: midx, y: midy + 10, 'text-anchor': 'center' }, ['3']),
      svg('path', { d: path, stroke: 'black', fill: 'none' }),
    ]);
  }
  public render(props: NoteProps) {
    // Draws a triplet

    const renderedNotes = SingleNote.renderMultiple(this._notes, props);
    const line = this.tripletLine(
      props.y,
      getXY(this.firstSingle().id)?.afterX || 0,
      getXY(this.lastSingle().id)?.afterX || 0,
      this.firstSingle().y(props.y),
      this.lastSingle().y(props.y)
    );

    return svg('g', [renderedNotes, line]);
  }
}

export type Note = SingleNote | Triplet;
