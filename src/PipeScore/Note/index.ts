/*
  Note format
  Copyright (C) 2021 macarc
 */
import { noteY, Pitch, pitchUp, pitchDown } from '../global/pitch';
import { genId, ID, Item } from '../global/id';
import {
  Gracenote,
  GracenoteProps,
  NoGracenote,
  ReactiveGracenote,
  SingleGracenote,
} from '../Gracenote';
import { foreach, nfirst, nlast, Obj } from '../global/utils';
import { dot, dotted, lengthInBeats, NoteLength } from './notelength';
import width, { Width } from '../global/width';
import { V } from '../../render/types';
import { svg } from '../../render/h';
import { Dispatch, Update } from '../Controllers/Controller';
import { NoteState } from './state';
import { GracenoteState } from '../Gracenote/state';
import { mouseOffPitch, mouseOverPitch } from '../Controllers/Mouse';
import { getXY, setXY } from '../global/xy';
import {
  addNoteBefore,
  clickNote,
  clickTripletLine,
} from '../Controllers/Note';
import { noteBoxes } from '../global/noteboxes';
import { PlaybackElement } from '../Playback';
import { Previewable } from '../DemoNote/previewable';
import { settings } from '../global/settings';

export interface PreviousNote {
  pitch: Pitch;
  x: number;
  y: number;
}

const tailGap = 3;
const shortTailLength = 10;
// note that this is half the width of the note, not the actual radius
// (the actual radius will actually be slightly larger since the note head is slanted slightly)
const noteHeadRadius = 4;
const noteHeadWidth = 2 * noteHeadRadius;
const dotXOffset = 10;
const dotRadius = 1.5;

export interface NoteProps {
  x: number;
  y: number;
  boxToLast: number | 'lastnote';
  previousNote: SingleNote | null;
  noteWidth: number;
  endOfLastStave: number;
  dispatch: Dispatch;
  state: NoteState;
  gracenoteState: GracenoteState;
}
export abstract class BaseNote extends Item {
  protected length: NoteLength;
  protected tied: boolean;
  abstract addGracenote(
    gracenote: Pitch | Gracenote,
    previous: Note | null
  ): void;
  abstract width(previous: Pitch | null): Width;
  abstract firstSingle(): SingleNote;
  abstract lastSingle(): SingleNote;
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
  public static noteHeadRadius = noteHeadRadius;
  public static fromJSON(o: Obj) {
    let s: Note | null = null;
    switch (o.notetype) {
      case 'single':
        s = SingleNote.fromObject(o.value);
        break;
      case 'triplet':
        s = Triplet.fromObject(o.value);
        break;
    }
    if (s) {
      s.id = o.id;
      return s;
    }
    throw new Error(`Unrecognised note type ${o.notetype}`);
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
  public isLength(length: NoteLength) {
    return this.length === length;
  }
  public setLength(length: NoteLength) {
    this.length = length;
  }
  public toggleDot() {
    return (this.length = dot(this.length));
  }
  public toggleTie(notes: SingleNote[]) {
    this.tied = !this.tied;
    this.makeCorrectTie(notes);
  }
  public makeCorrectTie(notes: SingleNote[]) {
    // Corrects the pitches of any notes tied to this note

    for (let i = 0; i < notes.length; i++) {
      if (notes[i].hasID(this.id)) {
        let pitch = this.firstPitch();
        // Work backwards while tied, ensuring all notes
        // are the same pitch
        for (
          let b = i - 1, previousNote = notes[b];
          b >= 0 && notes[b + 1].tied;
          b--, previousNote = notes[b]
        ) {
          previousNote.setLastPitch(pitch);
        }
        pitch = this.lastPitch();
        // Work forwards while tied, ensuring all notes
        // are the same pitch
        if (this instanceof SingleNote) {
          for (
            let a = i + 1, nextNote = notes[a];
            a < notes.length && nextNote.tied;
            a++, nextNote = notes[a]
          ) {
            nextNote.setFirstPitch(pitch);
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
  public static flatten(notes: Note[]): SingleNote[] {
    return notes.flatMap((note) =>
      note instanceof Triplet ? note.tripletSingleNotes() : note
    );
  }
  public static makeSameLength(notes: SingleNote[]) {
    notes.forEach((note) => (note.length = notes[0].length));
  }
  public static ungroupNotes(notes: Note[][]): Note[] {
    return ([] as Note[]).concat(...notes);
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

export class SingleNote
  extends BaseNote
  implements
    Previewable<ReactiveGracenote>,
    Previewable<SingleGracenote>,
    Previewable<Pitch>
{
  private pitch: Pitch;
  private gracenote: Gracenote;

  private previewGracenote: Gracenote | null;
  private preview = false;

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
  public static width = (noteHeadWidth * 2) / 3;
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
  public hasPreview() {
    return this.previewGracenote !== null;
  }
  public makePreviewReal(previous: Note | null) {
    if (this.previewGracenote)
      this.addGracenote(this.previewGracenote, previous);
  }
  public setPreview(gracenote: Gracenote | Pitch, previous: Note | null) {
    if (gracenote instanceof Gracenote) {
      if (!this.gracenote.equals(gracenote)) {
        this.previewGracenote = gracenote;
      } else {
        this.previewGracenote = null;
      }
    } else {
      this.previewGracenote = this.gracenote.addSingle(
        gracenote,
        this.pitch,
        previous?.lastPitch() || null
      );
    }
  }
  // TODO name this better
  public gracenoteType(): Gracenote {
    return this.gracenote;
  }
  public removePreview() {
    this.previewGracenote = null;
  }
  public isDemo() {
    return this.preview;
  }
  public unDemo() {
    this.preview = false;
    return this;
  }
  public demo() {
    this.preview = true;
    return this;
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
      : width.init(
          this.previewGracenote
            ? this.previewGracenote.width(this.pitch, prevNote)
            : this.gracenote.width(this.pitch, prevNote),
          0
        );
  }
  // This is used as an invisible empty note in bars with single
  // notes to make positioning correct
  public static invisibleWidth(): Width {
    return width.init(noteHeadWidth, 1);
  }
  public width(prevNote: Pitch | null): Width {
    return width.addAll(
      width.init(noteHeadWidth, 1),
      this.hasDot()
        ? width.init(dotXOffset - noteHeadRadius + dotRadius, 0)
        : width.zero(),
      this.widthOfGracenote(prevNote)
    );
  }
  public firstSingle() {
    return this;
  }
  public lastSingle() {
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
    return new Triplet(first.length, first, second, third);
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
    const yL = leftIs1 ? y1 - 1 : y2 - 1;
    const yR = leftIs1 ? y2 - 1 : y1 - 1;

    const moreTailsOnLeft = leftTails > rightTails;
    const drawExtraTails = moreTailsOnLeft
      ? leftTails > tailsBefore
      : rightTails > tailsAfter;

    // tails shared by both notes
    const sharedTails = moreTailsOnLeft ? rightTails : leftTails;
    // extra tails for one note
    const extraTails = drawExtraTails
      ? moreTailsOnLeft
        ? leftTails - rightTails
        : rightTails - leftTails
      : 0;

    const tailEndY = moreTailsOnLeft
      ? // because similar triangles
        yL + (shortTailLength / (xR - xL)) * (yR - yL)
      : yR - (shortTailLength / (xR - xL)) * (yR - yL);

    return svg('g', { class: 'tails' }, [
      ...foreach(sharedTails, (i) =>
        svg('line', {
          x1: xL,
          x2: xR,
          y1: yL - i * tailGap,
          y2: yR - i * tailGap,
          stroke: 'black',
          'stroke-width': 2,
        })
      ),
      ...foreach(extraTails, (i) => i + 1).map((i) =>
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
  private shouldTie(previous: SingleNote | null): previous is SingleNote {
    return this.tied && !this.isDemo() && !previous?.isDemo();
  }
  private colour() {
    return this.preview ? 'orange' : 'black';
  }
  private head(
    x: number,
    y: number,
    mousedown: (e: MouseEvent) => void,
    props: NoteProps,
    opacity = 1
  ): V {
    // Draws note head, ledger line and dot, as well as mouse event box

    const rotation = this.hasStem() ? -35 : 0;
    const noteWidth = 4.5; //Math.abs( noteHeadRadius / Math.cos((2 * Math.PI * rotation) / 360));
    const noteHeight = 3;
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

    // pointer events must be set so that if any note is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)

    // if we're dragging the note, disable the note box since it prevents
    // pitch boxes underneath from being triggered
    const drawNoteBox = !(props.state.dragged === this || this.isDemo());
    const pointerEvents = drawNoteBox ? 'visiblePainted' : 'none';

    const filled = this.isFilled();

    const rotateText = `rotate(${rotation} ${x} ${y})`;
    const maskRotateText = `rotate(${maskRotation} ${x} ${y})`;

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
          fill: this.colour(),
          transform: maskRotateText,
        }),
      ]),
      svg('ellipse', {
        cx: x,
        cy: y,
        rx: noteWidth,
        ry: noteHeight,
        stroke: this.colour(),
        fill: this.colour(),
        transform: rotateText,
        'pointer-events': pointerEvents,
        opacity,
        mask: filled ? '' : mask,
      }),
      dotted
        ? svg('circle', {
            cx: x + dotXOffset,
            cy: y + dotYOffset,
            r: dotRadius,
            fill: this.colour(),
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
            stroke: this.colour(),
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
          style: 'cursor: pointer;',
          opacity: 0,
        },
        {
          mousedown: mousedown as (e: Event) => void,
          mouseover: () => props.dispatch(mouseOffPitch()),
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
    return svg('path', { class: 'note-tie', d: path, stroke: this.colour() });
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
      x: props.x + xOffset + noteHeadRadius,
      y: props.y,
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
    const stemTopY = y + 1.5;
    const stemBottomY = y + 30;
    const numberOfTails = this.numTails();

    const noteBoxStart =
      props.boxToLast === 'lastnote'
        ? props.previousNote
          ? getXY(props.previousNote.id)?.afterX || props.x
          : props.x
        : props.boxToLast;
    const noteBoxWidth = (getXY(this.id)?.afterX || 0) - noteBoxStart;

    return svg('g', { class: 'singleton' }, [
      props.state.inputtingNotes && !this.isDemo()
        ? noteBoxes(
            noteBoxStart,
            props.y,
            noteBoxWidth,
            (pitch) => props.dispatch(mouseOverPitch(pitch, this)),
            (pitch) => props.dispatch(addNoteBefore(pitch, this))
          )
        : null,
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

      this.head(
        x + noteHeadRadius,
        y,
        (event: MouseEvent) => props.dispatch(clickNote(this, event)),
        props
      ),
      this.hasStem()
        ? svg('line', {
            x1: x,
            x2: x,
            y1: stemTopY,
            y2: stemBottomY,
            stroke: this.colour(),
          })
        : null,

      numberOfTails > 0
        ? svg(
            'g',
            { class: 'tails' },
            numberOfTails === 1
              ? [
                  svg('path', {
                    fill: this.colour(),
                    stroke: this.colour(),
                    'stroke-width': 0.5,
                    // d: `M ${x},${stemBottomY} q 8,-6 8,-15 q 0,-8 -4,-11 q 4,5 3,11 q -1,7 -7,11`,
                    d: `M ${x},${stemBottomY} c 16,-10 6,-22 4,-25 c 3,6 8,15 -4,22`,
                  }),
                ]
              : foreach(numberOfTails, (t) =>
                  svg('path', {
                    fill: this.colour(),
                    stroke: this.colour(),
                    // d: `M ${x},${
                    //   stemBottomY - 5 * t
                    // } q 8,-4 8,-13 q -2,9 -8,11`,
                    d: `M ${x}, ${
                      stemBottomY - 5 * t
                    } c 12,-5 9,-8 6,-10 c 4,3 4,5 -6,8`,
                  })
                )
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

    const setNoteXY = (note: SingleNote, index: number) =>
      setXY(note.id, xOfGracenote(index), xOf(index) + noteHeadWidth, props.y);

    const stemY = props.y + settings.lineHeightOf(6);

    return svg(
      'g',
      { class: 'grouped-notes' },
      notes.map((note, index) => {
        const previousNote = notes[index - 1] || props.previousNote;

        setNoteXY(note, index);
        const noteBoxX = index === 0 ? props.x : xOf(index - 1); // xOf(index) + noteHeadWidth,

        const gracenoteProps = {
          x: xOfGracenote(index) + noteHeadRadius, // So that it doesn't overlap the previous note
          y: props.y,
          thisNote: note.pitch,
          preview: false,
          previousNote:
            (previousNote && previousNote.lastPitch()) ||
            (props.previousNote && props.previousNote.lastPitch()),
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
                stemY,
                xOf(index - 1),
                stemY,
                note.numTails(),
                previousNote.numTails(),
                (notes[index - 2] && notes[index - 2].numTails()) || 0,
                (notes[index + 1] && notes[index + 1].numTails()) || 0
              )
            : null,

          note.head(
            xOf(index) + noteHeadRadius,
            yOf(note),
            (event: MouseEvent) => props.dispatch(clickNote(note, event)),
            props
          ),

          props.state.inputtingNotes && !note.isDemo()
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
            y2: stemY,
            stroke: note.colour(),
          }),
        ]);
      })
    );
  }
}

export class Triplet extends BaseNote {
  // It is assumed that _notes always has length >= 1
  // Whenever notes are deleted, this should be ensured
  private _notes: [SingleNote, SingleNote, SingleNote];

  constructor(
    length: NoteLength,
    first: SingleNote,
    second: SingleNote,
    third: SingleNote
  ) {
    super(length);
    this._notes = [first, second, third];
  }
  public isDemo() {
    return false;
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
      ...(o.notes.map((note: Obj) => SingleNote.fromObject(note)) as [
        SingleNote,
        SingleNote,
        SingleNote
      ])
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
    y2: number,
    selected: boolean,
    dispatch: Dispatch
  ): V {
    // Draws a triplet marking from x1,y1 to x2,y2

    const midx = x1 + (x2 - x1) / 2;
    const height = 40;
    const midy = staveY - height;
    const gap = 15;
    const path = `M ${x1},${y1 - gap} Q ${midx},${midy},${x2},${y2 - gap}`;
    const colour = selected ? 'orange' : 'black';
    const events = { mousedown: () => dispatch(clickTripletLine(this)) };
    return svg('g', { class: 'triplet' }, [
      svg(
        'text',
        {
          x: midx - 2.5,
          y: midy + 10,
          'text-anchor': 'center',
          fill: colour,
          style: 'font-size: 10px;',
        },
        events,
        ['3']
      ),
      svg('path', { d: path, stroke: colour, fill: 'none' }, events),
    ]);
  }
  public render(props: NoteProps) {
    // Draws a triplet
    SingleNote.makeSameLength(this._notes);

    const renderedNotes = SingleNote.renderMultiple(this._notes, props);
    const line = this.tripletLine(
      props.y,
      getXY(this.firstSingle().id)?.afterX || 0,
      getXY(this.lastSingle().id)?.beforeX || 0,
      this.firstSingle().y(props.y),
      this.lastSingle().y(props.y),
      props.state.selectedTripletLine === this,
      props.dispatch
    );

    return svg('g', [renderedNotes, line]);
  }
}

export type Note = SingleNote | Triplet;
