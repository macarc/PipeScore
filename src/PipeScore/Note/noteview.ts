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

//  Code for drawing notes

import m from 'mithril';
import type { INote } from '.';
import { addNoteBefore, clickNote } from '../Events/Note';
import { mouseOffPitch, mouseOverPitch } from '../Events/PitchBoxes';
import {
  type GracenoteProps,
  drawGracenote,
  gracenoteWidth,
} from '../Gracenote/view';
import { pitchBoxes } from '../PitchBoxes';
import { Pitch, isPitchOnLine, pitchY } from '../global/pitch';
import { settings } from '../global/settings';
import { foreach, isRoughlyZero, sum } from '../global/utils';
import width, { type Width } from '../global/width';
import { getXY, setXY } from '../global/xy';
import type { NoteProps } from './view';

type NoteLayout = {
  gracenote: number;
  natural: number;
  x: number;
  y: number;
}[];

export enum ShortBeamDirection {
  Left = 0,
  Right = 1,
}

const beamThickness = 2.5;
const tailGap = 5;
const shortTailLength = 10;
// note that this is half the width of the note, not the actual radius
// (the actual radius will actually be slightly larger since the note head is slanted slightly)
const dotXOffset = 10;
const dotRadius = 1.5;
const naturalWidth = 14;
const normalStemHeight = 30;
const stemThickness = 1;
// Offset (downwards) from centre of note that stem should start
const stemYOffset = 2;
const noteHeadRadius = 4;
export const noteHeadWidth = 2 * noteHeadRadius;

export function spacerWidth() {
  return width.init(noteHeadWidth, 1);
}

// Finds the total width of the note array in beat widths
export function totalWidth(notes: INote[], prevNote: Pitch | null): Width {
  return notes
    .map((n, i) => noteWidth(n, i === 0 ? prevNote : notes[i - 1].pitch()))
    .reduce(width.add, width.zero());
}

// TODO : only pass gracenote here?
function widthOfGracenote(note: INote, pitchBefore: Pitch | null) {
  return note.isTied()
    ? width.zero()
    : width.init(gracenoteWidth(note.gracenote(), note.pitch(), pitchBefore), 0);
}

export function noteWidth(note: INote, pitchBefore: Pitch | null): Width {
  return width.addAll(
    width.init(noteHeadWidth, 1),
    note.natural() ? width.constant(naturalWidth) : width.zero(),
    note.length().hasDot()
      ? width.constant(dotXOffset - noteHeadRadius + dotRadius)
      : width.zero(),
    widthOfGracenote(note, pitchBefore)
  );
}

function shouldDrawTie(note: INote, previous: INote | null) {
  return (
    note.isTied() && previous !== null && !note.isPreview() && !previous?.isPreview()
  );
}

// Draws beams from left note to right note
function drawBeam(
  xL: number,
  xR: number,
  y: number,
  leftTails: number,
  rightTails: number,
  tailsBefore: number | null,
  tailsAfter: number | null,
  leftShortBeamDirection: ShortBeamDirection,
  rightShortBeamDirection: ShortBeamDirection
): m.Children {
  const moreTailsOnLeft = leftTails > rightTails;

  const drawExtraTails = moreTailsOnLeft
    ? tailsBefore === null ||
      (leftShortBeamDirection === ShortBeamDirection.Right &&
        leftTails > tailsBefore)
    : tailsAfter === null ||
      (rightShortBeamDirection === ShortBeamDirection.Left &&
        rightTails > tailsAfter);

  // tails shared by both notes
  const sharedTails = Math.min(leftTails, rightTails);
  // extra tails for one note
  const extraTails = drawExtraTails ? Math.abs(leftTails - rightTails) : 0;

  return m('g[class=tails]', [
    ...foreach(sharedTails, (i) =>
      m('line', {
        x1: xL - stemThickness / 2,
        x2: xR + stemThickness / 2,
        y1: y - i * tailGap,
        y2: y - i * tailGap,
        stroke: 'black',
        'stroke-width': beamThickness,
      })
    ),
    ...foreach(extraTails, (i) => i + sharedTails).map((i) =>
      m('line', {
        x1: moreTailsOnLeft ? xL - stemThickness / 2 : xR + stemThickness / 2,
        x2: moreTailsOnLeft ? xL + shortTailLength : xR - shortTailLength,
        y1: y - i * tailGap,
        y2: y - i * tailGap,
        stroke: 'black',
        'stroke-width': beamThickness,
      })
    ),
  ]);
}

function drawGrace(note: INote, props: GracenoteProps) {
  return drawGracenote(note.gracenote(), {
    ...props,
    x: props.x + noteHeadRadius / 2,
    preview: note.hasPreview(),
  });
}

function colour(note: INote) {
  return note.isPreview() ? 'orange' : 'black';
}

// Draws note head, ledger line and dot
function drawHead(note: INote, x: number, y: number, props: NoteProps): m.Children {
  const rotation = note.length().hasStem() ? -35 : 0;
  const noteWidth = 4.5;
  const noteHeight = 3;
  const holeRotation = note.length().hasStem() ? rotation : 240;

  const maskrx = note.length().hasStem() ? 5 : 4;
  const maskry = 2;

  const clickableWidth = 30;
  const clickableHeight = 12;

  const dotYOffset = isPitchOnLine(note.pitch()) ? -3 : 0;

  // if we're dragging the note, disable the note box since it prevents
  // pitch boxes underneath from being triggered
  const drawNoteBox = !(
    props.state.dragged ||
    props.gracenoteState.dragged ||
    note.isPreview()
  );
  const pointerEvents = drawNoteBox ? 'visiblePainted' : 'none';

  return m('g[class=note-head]', [
    m('ellipse', {
      cx: x,
      cy: y,
      rx: noteWidth,
      ry: noteHeight,
      stroke: colour(note),
      fill: colour(note),
      transform: `rotate(${rotation}, ${x} ${y})`,
      'pointer-events': pointerEvents,
    }),
    note.length().isFilled()
      ? null
      : m('ellipse', {
          cx: x,
          cy: y,
          rx: maskrx,
          ry: maskry,
          'stroke-width': 0,
          fill: 'white',
          'pointer-events': pointerEvents,
          transform: `rotate(${holeRotation} ${x} ${y})`,
        }),
    note.length().hasDot()
      ? m('circle', {
          cx: x + dotXOffset,
          cy: y + dotYOffset,
          r: dotRadius,
          fill: colour(note),
          'pointer-events': 'none',
        })
      : null,
    note.pitch() === Pitch.HA
      ? m('line[class=ledger]', {
          x1: x - 8,
          x2: x + 8,
          y1: y,
          y2: y,
          stroke: colour(note),
          'pointer-events': pointerEvents,
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
      onmousedown: (e: MouseEvent) => props.dispatch(clickNote(note, e)),
      onmouseover: () => props.dispatch(mouseOffPitch()),
    }),
  ]);
}

// Draws a tie to previousNote
function drawTie(
  note: INote,
  x: number,
  staveY: number,
  noteWidth: number,
  previousNote: INote,
  lastStaveX: number
): m.Children {
  const previous = getXY(previousNote.id);
  if (!previous) return m('g[class=empty-tie]');

  const tieOffsetY = 10;
  const tieHeight = 15;
  const tieThickness = 8;

  const x0 = previous.afterX + 1 - noteHeadRadius;
  const y0 = pitchY(previous.y, previousNote.pitch()) - tieOffsetY;
  const x1 = x - 1 + noteHeadRadius;
  const y1 = pitchY(staveY, note.pitch()) - tieOffsetY;

  const curveTo = (x1: number, x2: number, y: number, height: number) =>
    `M ${x1},${y} S ${x1 + (x2 - x1) / 2},${height}, ${x2}, ${y}`;

  const curve = (x1: number, x2: number, y: number) =>
    curveTo(x1, x2, y, y - tieHeight) +
    curveTo(x2, x1, y, y - tieHeight - tieThickness);

  return m('path[class=tie]', {
    d:
      y0 === y1
        ? curve(x0, x1, y0)
        : curve(x0, lastStaveX, y0) + curve(x1, x1 - noteWidth, y1),
    stroke: colour(note),
  });
}

function drawNatural(note: INote, x: number, y: number): m.Children {
  const verticalLineLength = 15;
  const width = 8;
  // The vertical distance from the centre to the start of
  // the horizontal line
  const boxGapHeight = 3.5;
  const slantHeight = 4;
  const yShift = 1.5;
  const xShift = 1;
  const thickLineWidth = 3;
  const thinLineWidth = 1.5;
  const stroke = colour(note);

  return m('g[class=natural]', [
    m('line', {
      x1: x + xShift,
      x2: x + xShift,
      y1: y - verticalLineLength + yShift,
      y2: y + boxGapHeight + thickLineWidth / 2 + yShift,
      'stroke-width': thinLineWidth,
      stroke,
    }),
    m('line', {
      x1: x + width + xShift,
      x2: x + width + xShift,
      y1: y - slantHeight - boxGapHeight - thickLineWidth / 2 + yShift,
      y2: y - slantHeight + verticalLineLength + yShift,
      'stroke-width': thinLineWidth,
      stroke,
    }),
    m('line', {
      x1: x + xShift,
      x2: x + width + xShift,
      y1: y - boxGapHeight + yShift,
      y2: y - slantHeight - boxGapHeight + yShift,
      'stroke-width': thickLineWidth,
      stroke,
    }),
    m('line', {
      x1: x + xShift,
      x2: x + width + xShift,
      y1: y + boxGapHeight + yShift,
      y2: y - slantHeight + boxGapHeight + yShift,
      'stroke-width': thickLineWidth,
      stroke,
    }),
  ]);
}

function drawTails(note: INote, x: number, y: number) {
  const stemY = y + normalStemHeight;
  return (
    note.length().numTails() > 0 &&
    m(
      'g[class=tails]',
      note.length().numTails() === 1
        ? m('path', {
            fill: colour(note),
            stroke: colour(note),
            'stroke-width': 0.5,
            d: `M ${x},${stemY} c 16,-10 6,-22 4,-25 c 3,6 8,15 -4,22`,
          })
        : foreach(note.length().numTails(), (t) =>
            m('path', {
              fill: colour(note),
              stroke: colour(note),
              d: `M ${x}, ${stemY - 5 * t} c 12,-5 9,-8 6,-10 c 4,3 4,5 -6,8`,
            })
          )
    )
  );
}

function layoutNotes(notes: INote[], props: NoteProps): NoteLayout {
  const xOffset = width.reify(spacerWidth(), props.noteWidth);
  const previousPitch = props.previousNote?.pitch() || null;

  return notes.map((note, i) => {
    const gracenote =
      props.x +
      xOffset +
      width.reify(totalWidth(notes.slice(0, i), previousPitch), props.noteWidth);
    const natural =
      gracenote +
      width.reify(
        widthOfGracenote(note, i === 0 ? previousPitch : notes[i - 1].pitch()),
        props.noteWidth
      );
    const x = natural + (note.natural() ? naturalWidth : 0);
    const y = pitchY(props.y, note.pitch());
    return { gracenote, natural, x, y };
  });
}

export function shortBeamDirection(
  notes: INote[],
  index: number
): ShortBeamDirection {
  const lengthOfNotes = (notes: INote[]) =>
    sum(notes.map((n) => n.length().inBeats()));

  // If we're on the outside of the group, point inwards
  if (index === 0) {
    return ShortBeamDirection.Right;
  }
  if (index === notes.length - 1) {
    return ShortBeamDirection.Left;
  }
  // Otherwise:
  // The short beam should point to the left if we are part way
  // through a "beat" ("beat" = 2 * length of note) - i.e. if it "completes the beat"
  // Otherwise, we're at the start of a new "beat" so point to the right
  const lengthUpToNote = lengthOfNotes(notes.slice(0, index));
  if (isRoughlyZero(lengthUpToNote % (notes[index].length().inBeats() * 2))) {
    return ShortBeamDirection.Right;
  }
  return ShortBeamDirection.Left;
}

// Render a group of notes
export function drawNoteGroup(notes: INote[], props: NoteProps) {
  if (notes.length === 0) return m('g');

  const layout = layoutNotes(notes, props);

  const gracenoteX = (i: number) => layout[i].gracenote;
  const naturalX = (i: number) => layout[i].natural;
  const x = (i: number) => layout[i].x;
  const y = (i: number) => layout[i].y;

  const stemY = props.y + settings.lineHeightOf(4) + 3 * tailGap + beamThickness / 2;

  return m(
    'g[class=grouped-notes]',
    notes.map((note, index) => {
      setXY(note.id, gracenoteX(index), x(index) + noteHeadWidth, props.y);

      const previousNote = notes[index - 1] || props.previousNote;

      const pitchBoxX =
        index === 0
          ? props.boxToLast === 'lastnote'
            ? props.x + noteHeadWidth
            : props.boxToLast
          : x(index - 1) + noteHeadWidth;

      return m('g', { class: `grouped-note ${note.pitch()}` }, [
        props.state.inputtingNotes && !note.isPreview()
          ? pitchBoxes(
              pitchBoxX,
              props.y,
              x(index) + noteHeadWidth - pitchBoxX,
              (pitch) => props.dispatch(mouseOverPitch(pitch, note)),
              (pitch) => props.dispatch(addNoteBefore(pitch, note)),
              props.justAddedNote
            )
          : m('g'),

        shouldDrawTie(note, previousNote)
          ? drawTie(
              note,
              x(index),
              props.y,
              props.noteWidth,
              previousNote,
              props.endOfLastStave
            )
          : null,

        note.natural() ? drawNatural(note, naturalX(index), y(index)) : null,

        drawHead(note, x(index) + noteHeadRadius, y(index), props),

        shouldDrawTie(note, previousNote)
          ? null
          : drawGrace(note, {
              x: gracenoteX(index) + noteHeadRadius,
              y: props.y,
              thisNote: note.pitch(),
              preview: false,
              previousNote:
                previousNote?.pitch() || props.previousNote?.pitch() || null,
              state: props.gracenoteState,
              dispatch: props.dispatch,
            }),

        previousNote !== null &&
          index > 0 &&
          drawBeam(
            x(index - 1),
            x(index),
            stemY,
            previousNote.length().numTails(),
            note.length().numTails(),
            (notes[index - 2] && notes[index - 2].length().numTails()) || null,
            (notes[index + 1] && notes[index + 1].length().numTails()) || null,
            shortBeamDirection(notes, index - 1),
            shortBeamDirection(notes, index)
          ),
        note.length().hasStem()
          ? [
              notes.length === 1 && drawTails(note, x(index), y(index)),

              m('line', {
                x1: x(index),
                x2: x(index),
                y1: y(index) + stemYOffset,
                y2:
                  note.length().hasBeam() && notes.length > 1
                    ? stemY
                    : y(index) + normalStemHeight,
                stroke: colour(note),
                'stroke-width': stemThickness,
              }),
            ]
          : null,
      ]);
    })
  );
}
