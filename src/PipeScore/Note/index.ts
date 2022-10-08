//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
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

//  Implementations of notes and triplets

import { noteY, Pitch, pitchUp, pitchDown } from '../global/pitch';
import { Gracenote, GracenoteProps, NoGracenote } from '../Gracenote';
import { ID, genId } from '../global/id';
import { clickTripletLine } from '../Events/Note';
import { nfirst, nlast, foreach, Obj } from '../global/utils';
import { NoteLength } from './notelength';
import width, { Width } from '../global/width';
import m from 'mithril';
import { mouseOffPitch, mouseOverPitch } from '../Events/PitchBoxes';
import { getXY, setXY } from '../global/xy';
import { addNoteBefore, clickNote } from '../Events/Note';
import { pitchBoxes } from '../PitchBoxes';
import { settings } from '../global/settings';
import { dispatch } from '../Controller';
import { Previews } from '../Preview/previews';

import { BaseNote, NoteProps } from './base';
export type { NoteProps } from './base';

export type NoteOrTriplet = Note | Triplet;

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
const normalStemHeight = 30;

export class Note extends BaseNote implements Previews<Gracenote> {
  private _pitch: Pitch;
  private _gracenote: Gracenote;
  private hasNatural: boolean;
  private tied: boolean;

  private previewGracenote: Gracenote | null;
  private preview = false;

  constructor(
    pitch: Pitch,
    length: NoteLength,
    tied = false,
    hasNatural = false,
    gracenote: Gracenote = new NoGracenote()
  ) {
    super(length);
    this.tied = tied;
    this._pitch = pitch;
    this._gracenote = gracenote;
    this.hasNatural = hasNatural;
    this.previewGracenote = null;
  }
  public static width = (noteHeadWidth * 2) / 3;
  public static noteHeadRadius = noteHeadRadius;
  public static spacerWidth() {
    return width.init(noteHeadWidth, 1);
  }
  // Finds the total width of the note array in beat widths
  public static totalWidth(notes: Note[], prevNote: Pitch | null): Width {
    return notes
      .map((n, i) => n.width(i === 0 ? prevNote : notes[i - 1]._pitch))
      .reduce(width.add, width.zero());
  }
  public static fromObject(o: Obj) {
    return new Note(
      o.pitch,
      o.length,
      o.tied,
      o.hasNatural || false,
      Gracenote.fromJSON(o.gracenote)
    );
  }
  public toggleTie(notes: Note[]) {
    this.tied = !this.tied;
    this.makeCorrectTie(notes);
  }
  public isTied() {
    return this.tied;
  }
  // Corrects the pitches of any notes tied to this note
  public makeCorrectTie(notes: Note[]) {
    for (let i = 0; i < notes.length; i++) {
      if (notes[i].hasID(this.id)) {
        let pitch = this.pitch();
        let j = i;
        // Ensure previous tied notes are the same pitch
        while (j > 0 && notes[j].tied) notes[--j].setPitch(pitch);
        j = i + 1;
        // Ensure subsequent tied notes are the same pitch
        while (j < notes.length && notes[j].tied) notes[j++].setPitch(pitch);
        break;
      }
    }
  }
  public toObject() {
    return {
      pitch: this._pitch,
      length: this.length,
      tied: this.tied,
      hasNatural: this.hasNatural,
      gracenote: this._gracenote.toJSON(),
    };
  }
  public hasPreview() {
    return this.previewGracenote !== null;
  }
  public pitch() {
    return this._pitch;
  }
  public setPitch(pitch: Pitch) {
    this._pitch = pitch;
  }
  public makePreviewReal() {
    if (this.previewGracenote) this.setGracenote(this.previewGracenote);
    this.previewGracenote = null;
  }
  public setPreview(gracenote: Gracenote) {
    // TODO BUG fix creating custom gracenotes from scratch
    if (!this._gracenote.equals(gracenote)) {
      this.previewGracenote = gracenote;
    } else {
      this.previewGracenote = null;
    }
  }
  public gracenote(): Gracenote {
    return this._gracenote;
  }
  public removePreview() {
    this.previewGracenote = null;
  }
  public isPreview() {
    return this.preview;
  }
  public makeUnPreview() {
    this.preview = false;
    return this;
  }
  public makePreview() {
    this.preview = true;
    return this;
  }
  public drag(pitch: Pitch) {
    this.setPitch(pitch);
    this.hasNatural = false;
  }
  public moveUp() {
    this.setPitch(pitchUp(this.pitch()));
    this.hasNatural = false;
  }
  public moveDown() {
    this.setPitch(pitchDown(this.pitch()));
    this.hasNatural = false;
  }
  private widthOfGracenote(prevNote: Pitch | null) {
    return this.tied
      ? width.zero()
      : width.init(
          this.previewGracenote
            ? this.previewGracenote.width(this.pitch(), prevNote)
            : this._gracenote.width(this.pitch(), prevNote),
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
      this.shouldDrawNatural()
        ? width.constant(Note.naturalWidth)
        : width.zero(),
      this.hasDot()
        ? width.constant(dotXOffset - noteHeadRadius + dotRadius)
        : width.zero(),
      this.widthOfGracenote(prevNote)
    );
  }
  public y(staveY: number) {
    return noteY(staveY, this.pitch());
  }
  public play(previous: Pitch | null) {
    return [
      ...this._gracenote.play(this.pitch(), previous),
      {
        pitch: this.pitch(),
        tied: this.tied,
        duration: this.lengthInBeats(),
      },
    ];
  }
  private static naturalWidth = 14;
  private shouldDrawNatural() {
    return this.hasNatural && this.canHaveNatural();
  }
  public natural() {
    return this.hasNatural;
  }
  public toggleNatural() {
    if (this.canHaveNatural()) {
      this.hasNatural = !this.hasNatural;
    }
  }
  public canHaveNatural() {
    return this.pitch() === Pitch.C || this.pitch() === Pitch.F;
  }
  public setGracenote(grace: Gracenote) {
    this._gracenote = grace;
  }
  public addSingleGracenote(grace: Pitch, previous: Note | null = null) {
    this._gracenote = this._gracenote.addSingle(
      grace,
      this.pitch(),
      previous && previous.pitch()
    );
  }
  public replaceGracenote(g: Gracenote, n: Gracenote) {
    if (this._gracenote === g) this._gracenote = n;
  }
  public static toTriplet(first: Note, second: Note, third: Note) {
    return new Triplet(first.length, first, second, third);
  }
  private static beamFrom(
    xL: number,
    yL: number,
    xR: number,
    yR: number,
    leftTails: number,
    rightTails: number,
    tailsBefore: number | null,
    tailsAfter: number | null,
    // whether or not the first note is the 2nd, 4th, e.t.c. note in the group
    even: boolean
  ): m.Children {
    // Draws beams from left note to right note

    const moreTailsOnLeft = leftTails > rightTails;
    const drawExtraTails = moreTailsOnLeft
      ? tailsBefore === null || (even && leftTails > tailsBefore)
      : tailsAfter === null || (even && rightTails > tailsAfter);

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

    return m('g[class=tails]', [
      ...foreach(sharedTails, (i) =>
        m('line', {
          x1: xL,
          x2: xR,
          y1: yL - i * tailGap,
          y2: yR - i * tailGap,
          stroke: 'black',
          'stroke-width': 2,
        })
      ),
      ...foreach(extraTails, (i) => i + sharedTails).map((i) =>
        m('line', {
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
    return this._gracenote.render({
      ...props,
      x: props.x + noteHeadRadius / 2,
      preview: false,
    });
  }
  private shouldTie(previous: Note | null): previous is Note {
    return this.tied && !this.isPreview() && !previous?.isPreview();
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
  ): m.Children {
    // Draws note head, ledger line and dot, as well as mouse event box

    const rotation = this.hasStem() ? -35 : 0;
    const noteWidth = 4.5; //Math.abs( noteHeadRadius / Math.cos((2 * Math.PI * rotation) / 360));
    const noteHeight = 3;
    const holeRotation = this.hasStem() ? rotation : 240;

    const maskrx = this.hasStem() ? 5 : 4;
    const maskry = 2;

    const clickableWidth = 30;
    const clickableHeight = 12;

    const dotted = this.hasDot();
    const dotYOffset = [Pitch.G, Pitch.B, Pitch.D, Pitch.F, Pitch.HA].includes(
      this.pitch()
    )
      ? -3
      : 0;

    // pointer events must be set so that if any note is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)

    // if we're dragging the note, disable the note box since it prevents
    // pitch boxes underneath from being triggered
    const drawNoteBox = !(
      props.state.dragged ||
      props.gracenoteState.dragged ||
      this.isPreview()
    );
    const pointerEvents = drawNoteBox ? 'visiblePainted' : 'none';

    const filled = this.isFilled();

    const rotateText = `rotate(${rotation} ${x} ${y})`;
    const holeRotateText = `rotate(${holeRotation} ${x} ${y})`;

    return m('g[class=note-head]', [
      m('ellipse', {
        cx: x,
        cy: y,
        rx: noteWidth,
        ry: noteHeight,
        stroke: this.colour(),
        fill: this.colour(),
        transform: rotateText,
        'pointer-events': pointerEvents,
        opacity,
      }),
      filled
        ? null
        : m('g[class=centre-hole]', [
            m('ellipse', {
              cx: x,
              cy: y,
              rx: maskrx,
              ry: maskry,
              'stroke-width': 0,
              fill: 'white',
              'pointer-events': pointerEvents,
              transform: holeRotateText,
            }),
          ]),
      dotted
        ? m('circle', {
            cx: x + dotXOffset,
            cy: y + dotYOffset,
            r: dotRadius,
            fill: this.colour(),
            'pointer-events': 'none',
            opacity,
          })
        : null,
      this.pitch() === Pitch.HA
        ? m('line[class=ledger]', {
            x1: x - 8,
            x2: x + 8,
            y1: y,
            y2: y,
            stroke: this.colour(),
            'pointer-events': pointerEvents,
            opacity,
          })
        : null,

      m('rect', {
        x: x - clickableWidth / 2,
        y: y - clickableHeight / 2,
        width: clickableWidth,
        height: clickableHeight,
        'pointer-events': pointerEvents,
        style: 'cursor: pointer;',
        opacity: 0,
        onmousedown: mousedown as (e: Event) => void,
        onmouseover: () => dispatch(mouseOffPitch()),
      }),
    ]);
  }
  private tie(
    x: number,
    staveY: number,
    noteWidth: number,
    previousNote: Note,
    lastStaveX: number
  ): m.Children {
    // Draws a tie to previousNote

    const previous = getXY(previousNote.id);
    if (!previous) return m('g');

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
    return m('path[class=note-tie]', { d: path, stroke: this.colour() });
  }
  private renderNatural(x: number, y: number): m.Children {
    const verticalLineLength = 15;
    const width = 8;
    // The vertical distance from the centre to the start of the horizontal line
    const boxGapHeight = 3.5;
    const slantHeight = 4;
    const yShift = 1.5;
    const xShift = 1;
    const colour = this.colour();
    return m('g[class=natural]', [
      m('line', {
        x1: x + xShift,
        x2: x + xShift,
        y1: y - verticalLineLength + yShift,
        y2: y + boxGapHeight + 1.5 + yShift, // 1.5 = half the width of the horizontal line
        'stroke-width': 1.5,
        stroke: colour,
      }),
      m('line', {
        x1: x + width + xShift,
        x2: x + width + xShift,
        y1: y - slantHeight - boxGapHeight - 1.5 + yShift,
        y2: y - slantHeight + verticalLineLength + yShift, // 1.5 = half the width of the horizontal line
        'stroke-width': 1.5,
        stroke: colour,
      }),
      m('line', {
        x1: x + xShift,
        x2: x + width + xShift,
        y1: y - boxGapHeight + yShift,
        y2: y - slantHeight - boxGapHeight + yShift,
        'stroke-width': 3,
        stroke: colour,
      }),
      m('line', {
        x1: x + xShift,
        x2: x + width + xShift,
        y1: y + boxGapHeight + yShift,
        y2: y - slantHeight + boxGapHeight + yShift,
        'stroke-width': 3,
        stroke: colour,
      }),
    ]);
  }
  public render(props: NoteProps): m.Children {
    // Draws a single note
    const xOffset = width.reify(Note.spacerWidth(), props.noteWidth);
    const naturalWidth = this.shouldDrawNatural() ? Note.naturalWidth : 0;

    setXY(
      this.id,
      props.x + xOffset,
      props.x +
        xOffset +
        naturalWidth +
        width.reify(
          this.widthOfGracenote(props.previousNote?.pitch() || null),
          props.noteWidth
        ) +
        noteHeadWidth,
      props.y
    );
    const gracenoteProps = {
      // can just be props.x since it is the first note
      x: props.x + xOffset + noteHeadRadius,
      y: props.y,
      thisNote: this.pitch(),
      preview: false,
      previousNote: props.previousNote?.pitch() || null,
      state: props.gracenoteState,
    };

    const naturalX =
      props.x +
      xOffset +
      width.reify(
        this.widthOfGracenote(props.previousNote?.pitch() || null),
        props.noteWidth
      );

    const x = naturalX + naturalWidth;
    const y = this.y(props.y);
    const stemTopY = y + 1.5;
    const stemBottomY = y + normalStemHeight;
    const numberOfTails = this.numTails();

    const noteBoxStart =
      props.boxToLast === 'lastnote'
        ? props.previousNote
          ? getXY(props.previousNote.id)?.afterX || props.x
          : props.x
        : props.boxToLast;
    const noteBoxWidth = (getXY(this.id)?.afterX || 0) - noteBoxStart;

    return m('g[class=singleton]', [
      props.state.inputtingNotes && !this.isPreview()
        ? pitchBoxes(
            noteBoxStart,
            props.y,
            noteBoxWidth,
            (pitch) => dispatch(mouseOverPitch(pitch, this)),
            (pitch) => dispatch(addNoteBefore(pitch, this)),
            props.justAddedNote
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
      this.shouldDrawNatural() ? this.renderNatural(naturalX, y) : null,
      this.head(
        x + noteHeadRadius,
        y,
        (event: MouseEvent) => dispatch(clickNote(this, event)),
        props
      ),
      this.shouldTie(props.previousNote)
        ? null
        : this.renderGracenote(gracenoteProps),

      this.hasStem()
        ? m('line', {
            x1: x,
            x2: x,
            y1: stemTopY,
            y2: stemBottomY,
            stroke: this.colour(),
          })
        : null,

      numberOfTails > 0
        ? m(
            'g[class=tails]',
            numberOfTails === 1
              ? m('path', {
                  fill: this.colour(),
                  stroke: this.colour(),
                  'stroke-width': 0.5,
                  // d: `M ${x},${stemBottomY} q 8,-6 8,-15 q 0,-8 -4,-11 q 4,5 3,11 q -1,7 -7,11`,
                  d: `M ${x},${stemBottomY} c 16,-10 6,-22 4,-25 c 3,6 8,15 -4,22`,
                })
              : foreach(numberOfTails, (t) =>
                  m('path', {
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
  public static renderMultiple(notes: Note[], props: NoteProps) {
    if (notes.length === 0) {
      return m('g');
    } else if (notes.length === 1) {
      return notes[0].render(props);
    }

    const xOffset = width.reify(Note.spacerWidth(), props.noteWidth);
    const previousPitch = props.previousNote?.pitch() || null;
    const xOfGracenote = (noteIndex: number) =>
      props.x +
      xOffset +
      width.reify(
        Note.totalWidth(notes.slice(0, noteIndex), previousPitch),
        props.noteWidth
      );
    const naturalXOf = (i: number) =>
      xOfGracenote(i) +
      width.reify(
        notes[i].widthOfGracenote(
          i === 0 ? previousPitch : notes[i - 1].pitch()
        ),
        props.noteWidth
      );
    const xOf = (i: number) =>
      naturalXOf(i) + (notes[i].shouldDrawNatural() ? Note.naturalWidth : 0);
    const yOf = (note: Note) => note.y(props.y);

    const setNoteXY = (note: Note, index: number) =>
      setXY(note.id, xOfGracenote(index), xOf(index) + noteHeadWidth, props.y);

    const stemY = props.y + settings.lineHeightOf(6);

    return m(
      'g[class=grouped-notes]',
      notes.map((note, index) => {
        const previousNote = notes[index - 1] || props.previousNote;

        setNoteXY(note, index);
        const noteBoxX =
          index === 0
            ? props.x + noteHeadWidth
            : xOf(index - 1) + noteHeadWidth;

        const gracenoteProps = {
          x: xOfGracenote(index) + noteHeadRadius, // So that it doesn't overlap the previous note
          y: props.y,
          thisNote: note.pitch(),
          preview: false,
          previousNote:
            (previousNote && previousNote.pitch()) ||
            (props.previousNote && props.previousNote.pitch()),
          state: props.gracenoteState,
        };

        return m('g', { class: `grouped-note ${note.pitch()}` }, [
          props.state.inputtingNotes && !note.isPreview()
            ? pitchBoxes(
                noteBoxX,
                props.y,
                xOf(index) + noteHeadRadius - noteBoxX,
                (pitch) => dispatch(mouseOverPitch(pitch, note)),
                (pitch) => dispatch(addNoteBefore(pitch, note)),
                props.justAddedNote
              )
            : m('g'),

          note.shouldTie(previousNote)
            ? note.tie(
                xOf(index),
                props.y,
                props.noteWidth,
                previousNote,
                props.endOfLastStave
              )
            : null,

          note.shouldDrawNatural()
            ? note.renderNatural(naturalXOf(index), yOf(note))
            : null,

          note.head(
            xOf(index) + noteHeadRadius,
            yOf(note),
            (event: MouseEvent) => dispatch(clickNote(note, event)),
            props
          ),

          note.shouldTie(previousNote)
            ? null
            : note.renderGracenote(gracenoteProps),

          previousNote !== null && index > 0
            ? Note.beamFrom(
                xOf(index - 1),
                stemY,
                xOf(index),
                stemY,
                previousNote.numTails(),
                note.numTails(),
                (notes[index - 2] && notes[index - 2].numTails()) || null,
                (notes[index + 1] && notes[index + 1].numTails()) || null,
                index % 2 === 1
              )
            : null,

          m('line', {
            x1: xOf(index),
            x2: xOf(index),
            y1: yOf(note),
            y2: note.hasBeam() ? stemY : yOf(note) + normalStemHeight,
            stroke: note.colour(),
          }),
        ]);
      })
    );
  }
}

export class Triplet extends BaseNote {
  private _notes: [Note, Note, Note];

  constructor(length: NoteLength, first: Note, second: Note, third: Note) {
    super(length);
    this._notes = [first, second, third];
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
      ...(o.notes.map((note: Obj) => Note.fromObject(note)) as [
        Note,
        Note,
        Note
      ])
    );
  }
  public toObject() {
    return {
      id: this.id,
      notes: this._notes.map((n) => n.toObject()),
      length: this.length,
      tied: this.firstSingle().isTied(), // previously: this.tied,
    };
  }
  public hasID(id: ID) {
    return (
      super.hasID(id) ||
      this._notes.reduce<boolean>((acc, n) => acc || n.hasID(id), false)
    );
  }
  public tripletSingleNotes() {
    return this._notes;
  }
  public width(prevNote: Pitch | null): Width {
    return Note.totalWidth(this._notes, prevNote);
  }
  public firstSingle() {
    return nfirst(this._notes);
  }
  public lastSingle() {
    return nlast(this._notes);
  }
  public play(previous: Pitch | null) {
    return this._notes
      .flatMap((n, i) =>
        n.play(i === 0 ? previous : this._notes[i - 1].pitch() || previous)
      )
      .map((n) => ({ ...n, duration: (2 / 3) * n.duration }));
  }
  public static flatten(notes: (Note | Triplet)[]): Note[] {
    return notes.flatMap((note) =>
      note instanceof Triplet ? note.tripletSingleNotes() : note
    );
  }
  public static lastNote(note: Note | Triplet): Note {
    if (note instanceof Triplet) return note.lastSingle();
    return note;
  }
  // Draws a triplet marking from x1,y1 to x2,y2
  private tripletLine(
    staveY: number,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    selected: boolean
  ): m.Children {
    const midx = x1 + (x2 - x1) / 2;
    const height = 40;
    const midy = staveY - height;
    const gap = 15;
    const path = `M ${x1},${y1 - gap} Q ${midx},${midy},${x2},${y2 - gap}`;
    const colour = selected ? 'orange' : 'black';
    const events = { onmousedown: () => dispatch(clickTripletLine(this)) };
    return m('g[class=triplet]', [
      m(
        'text',
        {
          x: midx - 2.5,
          y: midy + 10,
          'text-anchor': 'center',
          fill: colour,
          style: 'font-size: 10px;',
          ...events,
        },
        '3'
      ),
      m('path', { d: path, stroke: colour, fill: 'none', ...events }),
    ]);
  }
  public render(props: NoteProps) {
    Note.makeSameLength(this._notes);

    const renderedNotes = Note.renderMultiple(this._notes, props);
    const line = this.tripletLine(
      props.y,
      getXY(this.firstSingle().id)?.afterX || 0,
      getXY(this.lastSingle().id)?.beforeX || 0,
      this.firstSingle().y(props.y),
      this.lastSingle().y(props.y),
      props.state.selectedTripletLine === this
    );

    return m('g', [renderedNotes, line]);
  }
}
