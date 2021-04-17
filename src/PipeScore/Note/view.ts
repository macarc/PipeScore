/*
  Note/view.ts - Note implementation for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';

import { noteBoxes } from '../global/noteboxes';
import { Pitch, noteOffset, noteY } from '../global/pitch';
import { setXY } from '../global/xy';
import { nlast, nmap } from '../global/utils';
import width, { Width } from '../global/width';

import { NoteModel, TripletModel, BaseNote, PreviousNote } from './model';
import { Dispatch } from '../Event';

import Note from './functions';
import Gracenote from '../Gracenote/functions';

import renderGracenote, { GracenoteProps, GracenoteState, gracenoteWidth } from '../Gracenote/view';

const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;
// note that this is half the width of the note, note the actual radius
// (it will actually be slightly larger since it's slanted slightly)
const noteHeadRadius = 4;
const noteHeadWidth = 2 * noteHeadRadius;

const widthOfGracenote = (note: BaseNote | NoteModel, prevNote: Pitch | null) => (Note.isNoteModel(note) && note.tied)
  ? width.init(0,0)
  : gracenoteWidth(note.gracenote, note.pitch, prevNote);

export const widthOfNote = (note: NoteModel | TripletModel, prevNote: Pitch | null): Width => Note.isTriplet(note) ?
    [{ n: note.first, tied: note.tied, p: prevNote },
     { n: note.second, p: note.first.pitch },
     { n: note.third, p: note.second.pitch }]
    .reduce((acc, { n, p }) => width.add(acc, widthOfGracenote(n, p)), width.init(3 * noteHeadWidth, 3))
 : width.add(width.init(noteHeadWidth, 1), Note.hasDot(note.length) ? width.init(5, 0) : width.init(0, 0), widthOfGracenote(note, prevNote));

// Finds the total width of the note array in beat widths
const totalWidth = (notes: NoteModel[], prevNote: Pitch | null): Width =>
  notes.map((n,i) => widthOfNote(n, i === 0 ? prevNote : notes[i - 1].pitch)).reduce((a,b) => width.add(a, b), width.zero());

// Finds the offset that the note head has due to its gracenote
export const noteHeadOffset = (beatWidth: number, note: BaseNote, previousPitch: Pitch | null): number => width.reify(gracenoteWidth(note.gracenote, note.pitch, previousPitch), beatWidth);

function beamFrom(x1: number,y1: number, x2: number,y2: number, tails1: number,tails2: number): V {
  // Draws beams from note1 at x1,y1 with tails1 to note2 x2,y2 with tails2

  const leftIs1 = x1 < x2;
  const leftTails = leftIs1 ? tails1 : tails2;
  const rightTails = leftIs1 ? tails2 : tails1;
  const xL = leftIs1 ? x1 : x2;
  const xR = leftIs1 ? x2 : x1;
  const yL = leftIs1 ? y1 : y2;
  const yR = leftIs1 ? y2 : y1;


  const diffIsL = leftTails > rightTails;

  // tails shared by both notes
  const sharedTails = diffIsL ? [...Array(rightTails).keys()] : [...Array(leftTails).keys()];
  // tails extra tails for one note
  const diffTails = diffIsL ? [...Array(leftTails).keys()].splice(rightTails) : [...Array(rightTails).keys()].splice(leftTails);

  const tailEndY =
    diffIsL
  // because similar triangles
    ? yL + shortTailLength / (xR - xL) * (yR - yL)
    : yR - shortTailLength / (xR - xL) * (yR - yL);


    return svg('g', { class: 'tails' }, [
      ...sharedTails.map(i =>
        svg('line',
          { x1: xL,
            x2: xR,
            y1: yL - i * tailGap,
            y2: yR - i * tailGap,
            stroke: 'black',
            'stroke-width': 2
          })),
      ...diffTails.map(i =>
        svg('line',
          { x1: diffIsL ? xL : xR,
            x2: diffIsL ? xL + shortTailLength : xR - shortTailLength,
            y1: (diffIsL ? yL : yR) - i * tailGap,
            y2: tailEndY - i * tailGap,
            stroke: 'black',
            'stroke-width': 2
          }))
        ]);
}

function noteHead(beforeX: number, y: number, note: NoteModel, mousedown: (e: MouseEvent) => void, draggedNote: BaseNote | null, gracenoteBeingDragged: boolean, dispatch: Dispatch, opacity = 1): V {
  // Draws note head, ledger line and dot, as well as mouse event box

  const rotation = Note.hasStem(note) ? -35 : 0;
  const noteWidth = Math.abs(noteHeadRadius / Math.cos(2 * Math.PI * rotation / 360));
  const noteHeight = 3.5;
  const maskRotation = Note.hasStem(note) ? 0: rotation + 60;

  const x = beforeX + noteHeadRadius;

  const maskrx = Note.hasStem(note) ? 5 : 4;
  const maskry = 2;

  const clickableWidth = 30;
  const clickableHeight = 12;

  const dotted = Note.hasDot(note.length);
  const dotYOffset = ([Pitch.G,Pitch.B,Pitch.D,Pitch.F,Pitch.HA].includes(note.pitch)) ? -3 : 0;
  const dotXOffset = 10;

  const selected = false;


  // pointer events must be set so that if any note is being
  // dragged, it shouldn't get pointer events because
  // that interferes with the drag boxes (you can't
  // drag downwards a single box)
  const pointerEvents = (draggedNote || gracenoteBeingDragged) ? 'none' : 'visiblePainted';

  const filled = Note.isFilled(note);

  const rotateText = `rotate(${rotation} ${x} ${y})`;
  const maskRotateText = `rotate(${maskRotation} ${x} ${y})`;

  const colour = selected ? "orange" : "black";
  const maskId = Math.random();
  const mask = `url(#${maskId})`;
  return svg('g', { class: 'note-head' }, [
    svg('mask', { id: maskId }, [
      svg('rect', { x: x - 10, y: y - 10, width: 20, height: 20, fill: 'white' }),
      svg('ellipse', { cx: x, cy: y, rx: maskrx, ry: maskry, 'stroke-width': 0, fill: 'black', transform: maskRotateText }),
    ]),
    svg('ellipse', { cx: x, cy: y, rx: noteWidth, ry: noteHeight, stroke: colour, fill: colour, transform: rotateText, 'pointer-events': pointerEvents, opacity, mask: filled ? '' : mask }),
    dotted ? svg('circle', { cx: x + dotXOffset, cy: y + dotYOffset, r: 1.5, fill: colour, 'pointer-events': 'none', opacity }) : null,
    (note.pitch === Pitch.HA) ? svg('line', { class: 'ledger', x1: x - 8, x2: x + 8, y1: y, y2: y, stroke: colour, 'pointer-events': pointerEvents, opacity }) : null,

    svg('rect', { x: x - clickableWidth / 2, y: y - clickableHeight / 2, width: clickableWidth, height: clickableHeight, 'pointer-events': pointerEvents, opacity: 0 }, { mousedown: mousedown as (e: Event) => void, mouseover: () => dispatch({ name: 'mouse over pitch', pitch: note.pitch }) })
  ]);
}

function tie(staveY: number, pitch: Pitch, x: number, noteWidth: number, previousNote: PreviousNote, lastStaveX: number): V {
  // Draws a tie to previousNote

  const tieOffsetY = 10;
  const tieHeight = 15;
  const tieWidth = 8;
  const y = noteY(staveY, pitch);
  const x0 = x - 1;
  const y0 = y - tieOffsetY;
  const x1 = previousNote.x + 1;
  const y1 = previousNote.y - tieOffsetY;
  const midx = previousNote.x + (x - previousNote.x) / 2.0;
  const midy = y0 + (y1 - y0) / 2.0;
  const midloy = midy - tieHeight;
  const midhiy = midy - tieHeight - tieWidth;
  const path = (y0 === y1) ? `
M ${x0},${y0} S ${midx},${midhiy}, ${x1},${y1}
M ${x1},${y1} S ${midx},${midloy}, ${x0},${y0}
    `
    : `
M ${x0},${y0} S ${x0 - (noteWidth / 2)},${y0 - tieHeight - tieWidth}, ${x0 - noteWidth},${y0}
M ${x0 - noteWidth},${y0} S ${x0 - (noteWidth / 2)},${y0 - tieHeight}, ${x0},${y0}

M ${x1},${y1} S ${(lastStaveX - x1) / 2 + x1},${y1- tieHeight - tieWidth}, ${lastStaveX},${y1}
M ${lastStaveX},${y1} S ${(lastStaveX - x1) / 2 + x1},${y1 - tieHeight}, ${x1},${y1}
    `;
  return svg('path', { class: 'note-tie', d: path, stroke: 'black' });
}

function tripletLine(staveY: number, x1: number, x2: number, y1: number, y2: number): V {
  // Draws a triplet marking from x1,y1 to x2,y2

  const midx = x1 + (x2 - x1) / 2;
  const height = 40;
  const midy = staveY - height;
  const gap = 15;
  const path = `
M ${x1},${y1 - gap} Q ${midx},${midy},${x2},${y2 - gap}
`
  return svg('g', { class: 'triplet' }, [
    svg('text', { x: midx, y: midy + 10, 'text-anchor': 'center' }, ['3']),
    svg('path', { d: path, stroke: 'black', fill: 'none' })
  ]);
}

const shouldTie = (note: NoteModel, previous: PreviousNote | null): previous is PreviousNote => note.tied && (previous || false) && previous.pitch === note.pitch;

function singleton(note: NoteModel, x: number, staveY: number, noteWidth: number, gracenoteProps: GracenoteProps, previousNote: PreviousNote | null, lastStaveX: number, drawNoteBoxes: () => V, draggedNote: BaseNote | null, dispatch: Dispatch): V {
  // Draws a single note

  const y = noteY(staveY, note.pitch);
  const stemY = y + 30;
  const numberOfTails = Note.lengthToNumTails(note.length);

  return svg('g', { class: 'singleton' }, [
    shouldTie(note, previousNote) ? tie(staveY, note.pitch, x, noteWidth, previousNote, lastStaveX) : null,
    shouldTie(note, previousNote) ?  null : renderGracenote(note.gracenote, gracenoteProps),

    noteHead(x, y, note, (event: MouseEvent) => dispatch({ name: 'note clicked', note, event }), draggedNote, gracenoteProps.state.dragged !== null, dispatch),
    Note.hasStem(note) ? svg('line', { x1: x, x2: x, y1: y, y2: stemY, stroke: 'black' }) : null,

    (numberOfTails > 0)
      ? svg('g', { class: 'tails' },
            [...Array(numberOfTails).keys()].map(t => svg('line', { x1: x, x2: x + 10, y1: stemY - 5 * t, y2: stemY - 5 * t - 10, stroke: 'black', 'stroke-width': 2 })))
      : null,

    drawNoteBoxes()
  ]);
}

export interface NoteState {
  dragged: BaseNote | null,
  inputtingNotes: boolean
}

interface NoteProps {
  x: number,
  y: number,
  previousNote: PreviousNote | null,
  noteWidth: number,
  endOfLastStave: number
  dispatch: Dispatch,
  onlyNoteInBar: boolean,
  state: NoteState,
  gracenoteState: GracenoteState,
}

function renderTriplet(triplet: TripletModel, props: NoteProps): V {
  // Draws a triplet

  // This is mostly just repetitive, but there's enough different that it isn't worth trying to reuse code
  const notes = Note.tripletNoteModels(triplet);
  const firstGracenoteWidth = width.reify(gracenoteWidth(triplet.first.gracenote, triplet.first.pitch, nmap(props.previousNote, n => n.pitch)), props.noteWidth);
  const secondGracenoteWidth = width.reify(gracenoteWidth(triplet.second.gracenote, triplet.second.pitch, triplet.first.pitch), props.noteWidth);
  const thirdGracenoteWidth = width.reify(gracenoteWidth(triplet.third.gracenote, triplet.third.pitch, triplet.second.pitch), props.noteWidth);

  const firstGracenoteX = props.x;
  const firstX = firstGracenoteX + firstGracenoteWidth;
  const secondGracenoteX = firstX + props.noteWidth;
  const secondX = secondGracenoteX + secondGracenoteWidth;
  const thirdGracenoteX = secondX + props.noteWidth;
  const thirdX = thirdGracenoteX + thirdGracenoteWidth;


  const firstY = noteY(props.y, triplet.first.pitch);
  const secondY = noteY(props.y, triplet.second.pitch);
  const thirdY = noteY(props.y, triplet.third.pitch);

  const defaultHeight = (pitch: Pitch) => noteY(props.y, pitch) + 30;
  const firstStemY = Note.hasBeam(triplet.length) ? Math.max(defaultHeight(triplet.first.pitch), secondY + 20) : defaultHeight(triplet.first.pitch);
  const thirdStemY = Note.hasBeam(triplet.length) ? Math.max(defaultHeight(triplet.third.pitch), secondY + 20) : defaultHeight(triplet.third.pitch);
  const secondStemY = Note.hasBeam(triplet.length) ? (secondX - firstX) / (thirdX - firstX) * (thirdStemY - firstStemY) + firstStemY : defaultHeight(triplet.second.pitch);

  setXY(triplet.first.id, firstGracenoteX, firstX + noteHeadWidth, props.y);
  setXY(triplet.second.id, secondGracenoteX, secondX + noteHeadWidth, props.y);
  setXY(triplet.third.id, thirdGracenoteX, thirdX + noteHeadWidth, props.y);

  const firstGracenoteProps = ({
    x: firstGracenoteX, y: props.y,
    noteWidth: props.noteWidth,
    thisNote: triplet.first.pitch, previousNote: props.previousNote && props.previousNote.pitch,
    dispatch: props.dispatch, state: props.gracenoteState
  });
  const secondGracenoteProps = ({
    x: secondGracenoteX, y: props.y,
    noteWidth: props.noteWidth,
    thisNote: triplet.second.pitch, previousNote: triplet.first.pitch,
    dispatch: props.dispatch, state: props.gracenoteState
  });
  const thirdGracenoteProps = ({
    x: thirdGracenoteX, y: props.y,
    noteWidth: props.noteWidth,
    thisNote: triplet.third.pitch, previousNote: triplet.second.pitch,
    dispatch: props.dispatch, state: props.gracenoteState
  });
  return svg('g', { class: 'triplet' }, [
    (triplet.tied && props.previousNote) ? tie(props.y, triplet.first.pitch, firstX, props.noteWidth, props.previousNote, props.endOfLastStave) : null,
    svg('g', { class: 'first' }, [
      noteHead(firstX, firstY, notes[0], (event) => props.dispatch({ name: 'note clicked', note: triplet.first, event }), props.state.dragged, props.gracenoteState.dragged !== null, props.dispatch),
      renderGracenote(triplet.first.gracenote, firstGracenoteProps),
      svg('line', { x1: firstX, x2: firstX, y1: firstY, y2: firstStemY, stroke: 'black' }),
    ]),
    props.state.inputtingNotes ? noteBoxes(firstX + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'add gracenote to triplet', pitch, which: 'second', triplet })) : svg('g'),
    svg('g', { class: 'second' }, [
      noteHead(secondX, secondY, notes[1], (event) => props.dispatch({ name: 'note clicked', note: triplet.second, event }), props.state.dragged, props.gracenoteState.dragged !== null, props.dispatch),
      renderGracenote(triplet.second.gracenote, secondGracenoteProps),
      svg('line', { x1: secondX, x2: secondX, y1: secondY, y2: secondStemY, stroke: 'black' }),
      beamFrom(firstX, firstStemY, secondX, secondStemY, Note.lengthToNumTails(triplet.length), Note.lengthToNumTails(triplet.length))
    ]),
    props.state.inputtingNotes ? noteBoxes(secondX + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'add gracenote to triplet', pitch, which: 'third', triplet })) : svg('g'),
    svg('g', { class: 'first' }, [
      noteHead(thirdX, thirdY, notes[2], (event) => props.dispatch({ name: 'note clicked', note: triplet.third, event }), props.state.dragged, props.gracenoteState.dragged !== null, props.dispatch),
      renderGracenote(triplet.third.gracenote, thirdGracenoteProps),
      svg('line', { x1: thirdX, x2: thirdX, y1: thirdY, y2: thirdStemY, stroke: 'black' }),
      beamFrom(secondX, secondStemY, thirdX, thirdStemY, Note.lengthToNumTails(triplet.length), Note.lengthToNumTails(triplet.length))
    ]),
    tripletLine(props.y, firstX, thirdX, firstY, thirdY),
    props.state.inputtingNotes ? noteBoxes(thirdX + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'note added', pitch, noteBefore: triplet })) : svg('g')
  ]);
}


export default function render(group: (NoteModel[] | TripletModel), props: NoteProps): V {
  if (Note.isTriplet(group)) {
    return renderTriplet(group, props);
  } else {
    const previousPitch = props.previousNote && props.previousNote.pitch;

    if (group.length === 0) {
      return svg('g')
    } else {
      const xOfGracenote = (noteIndex: number) => props.x + width.reify(totalWidth(group.slice(0, noteIndex), previousPitch), props.noteWidth);
      const xOf = (noteIndex: number) => {
          const note = group[noteIndex];
          return xOfGracenote(noteIndex) + width.reify(gracenoteWidth(note.gracenote,note.pitch,noteIndex === 0 ? previousPitch : group[noteIndex - 1].pitch), props.noteWidth);
      }
      const yOf = (note: NoteModel) => noteY(props.y, note.pitch);

      const totalXWidth = width.reify(totalWidth(group, previousPitch), props.noteWidth);

      const firstNote: NoteModel = group[0];
      const lastNote: NoteModel = nlast(group);

      const setNoteXY = (note: NoteModel, index: number) => setXY(note.id, xOfGracenote(index), xOf(index) + noteHeadWidth, props.y);

      if (Note.numberOfNotes(group) === 1) {
        const xOffset = (props.onlyNoteInBar) ? -props.noteWidth / 2.0 : 0;
        setXY(firstNote.id, xOfGracenote(0) + xOffset, xOf(0) + noteHeadWidth + xOffset, props.y);
        const gracenoteProps = ({
          // can just be props.x since it is the first note
          x: props.x + xOffset,
          y: props.y,
          noteWidth: props.noteWidth,
          thisNote: firstNote.pitch,
          previousNote: previousPitch,
          dispatch: props.dispatch,
          state: props.gracenoteState
        });

        const nb = () => props.state.inputtingNotes ? noteBoxes(xOf(0) + noteHeadWidth + xOffset, props.y, props.noteWidth - xOffset, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'note added', pitch, noteBefore: firstNote })) : svg('g');

        return singleton(firstNote,xOf(0) + xOffset,props.y,props.noteWidth, gracenoteProps, props.previousNote, props.endOfLastStave, nb, props.state.dragged, props.dispatch);
      } else {

        const cap = (n: number, max: number) =>
          (n > max) ? max :
          (n < -max) ? -max :
          n;

        const diff = cap(
          // todo cap should be dependent on how many notes are in the group
          // difference between first and last notes in a group
          noteOffset(lastNote.pitch)
          - noteOffset(firstNote.pitch),
          30 / group.length);

        const [lowestNote,lowestNoteIndex,multipleLowest]: [NoteModel,number,boolean] = group.reduce((last,next, index) => {
          if (index === 0) {
            return last;
          }
          const [lowestNoteSoFar,lowestNoteIndexSoFar] = last;
          if (noteOffset(next.pitch) === noteOffset(lowestNoteSoFar.pitch)) {
            return [lowestNoteSoFar, lowestNoteIndexSoFar, true];
          } else if (noteOffset(next.pitch) > noteOffset(lowestNoteSoFar.pitch)) {
            return [next,index, false];
          } else {
            return last;
          }
        }, [firstNote,0, false] as [NoteModel,number,boolean]);

        const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * xOf(lowestNoteIndex) / totalXWidth);

        const stemYOf = (note: NoteModel, index: number) =>
          (Note.hasBeam(note.length) ?
          props.y
          + (multipleLowest
             // straight line if there is more than one lowest note
               ? 0
               // otherwise use a slant
                 : diff * xOf(index) / totalXWidth)
                 // offset so that the lowest note is always a constant height
                 + diffForLowest
                 : noteY(props.y, note.pitch) + 30)

        return svg('g', { class: 'grouped-notes' },
                   group.map((note, index) => {
                     setNoteXY(note, index);
                     // Can't just do || props.previousNote here, since when defining previousNoteObj
                     // we need to do yOf(previousNote) which won't work for props.previousNote
                     const previousNote = group[index - 1] || null;
                     const gracenoteProps = ({
                       x: xOfGracenote(index),
                       y: props.y,
                       noteWidth: props.noteWidth,
                       thisNote: note.pitch,
                       previousNote: nmap(previousNote, p => p.pitch) || nmap(props.previousNote, p => p.pitch),
                       dispatch: props.dispatch,
                       state: props.gracenoteState
                     });
                     const previousNoteObj = nmap(previousNote, p => ({
                       pitch: p.pitch,
                       x: xOf(index - 1),
                       y: yOf(p)
                     })) || props.previousNote;

                     return svg('g', { class: `grouped-note ${note.pitch}` }, [
                       shouldTie(note, previousNoteObj) ? tie(props.y, note.pitch, xOf(index), props.noteWidth, previousNoteObj, props.endOfLastStave) : null,
                       shouldTie(note, previousNoteObj) ? null : renderGracenote(note.gracenote,gracenoteProps),

                       (previousNote !== null && index > 0) ? beamFrom(xOf(index),stemYOf(note, index), xOf(index - 1),stemYOf(previousNote, index - 1), Note.lengthToNumTails(note.length), Note.lengthToNumTails(previousNote.length)) : null,

                       noteHead(xOf(index), yOf(note), note, (event: MouseEvent) => props.dispatch({ name: 'note clicked', note, event }), props.state.dragged, props.gracenoteState.dragged !== null, props.dispatch),

                       props.state.inputtingNotes ? noteBoxes(xOf(index) + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'note added', pitch, noteBefore: note })) : svg('g'),

                       svg('line', { x1: xOf(index), x2: xOf(index), y1: yOf(note), y2: stemYOf(note, index), stroke: 'black' })
                     ])
                   }));
      }
    }
  }
}
