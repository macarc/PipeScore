/*
  Note/view.ts - Note implementation for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';

import { noteBoxes } from '../global/noteboxes';
import { Pitch, noteOffset, noteY } from '../global/pitch';
import { setXY } from '../global/xy';
import { nlast, nmap } from '../global/utils';

import { NoteModel, TripletModel, BaseNote, PreviousNote } from './model';
import { Dispatch } from '../Event';

import Note from './functions';
import Gracenote from '../Gracenote/functions';

import renderGracenote, { GracenoteProps, GracenoteState } from '../Gracenote/view';

const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;
// note that this is actually *half* the width
const noteHeadWidth = 5;

// Finds the width of the note in beat widths
export const widthOfNote = (note: BaseNote | NoteModel | TripletModel, prevNote: Pitch | null): number => Note.isTriplet(note) ?
  3 + [{ n: note.first, p: prevNote }, { n: note.second, p: note.first.pitch }, { n: note.third, p: note.second.pitch }].reduce((acc, { n, p }) => acc + gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, p), 0)
 : 1 +
  ((Note.isNoteModel(note) && note.tied)
    ?  0
    : (gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(note.gracenote, note.pitch, prevNote)));

// Finds the total width of the note array in beat widths
export const totalWidth = (notes: NoteModel[], prevNote: Pitch | null): number =>
  notes.map((n,i) => widthOfNote(n, i === 0 ? prevNote : notes[i - 1].pitch)).reduce((a,b) => a + b, 0);

// Finds the offset that the note head has due to its gracenote
export const noteHeadOffset = (beatWidth: number, note: BaseNote, previousPitch: Pitch | null): number => beatWidth * gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(note.gracenote, note.pitch, previousPitch);

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

function noteHead(x: number, y: number, note: NoteModel, mousedown: (e: MouseEvent) => void, draggedNote: BaseNote | null, opacity = 1): V {
  // Draws note head, ledger line and dot, as well as mouse event box

  const noteWidth = 5;
  const noteHeight = 4;
  const rotation = Note.hasStem(note) ? -30 : 0;
  const maskRotation = Note.hasStem(note) ? 0: rotation + 60;

  const maskrx = Note.hasStem(note) ? 5 : 4;
  const maskry = 2;

  const clickableWidth = 30;
  const clickableHeight = 12;

  const dotted = Note.hasDot(note.length);
  const dotYOffset = ([Pitch.G,Pitch.B,Pitch.D,Pitch.F,Pitch.HA].includes(note.pitch)) ? -3 : 0;
  const dotXOffset = 10;
  // This must use id since note and draggedNote could be different objects (e.g. in triplets, note is generated)
  const dragged = draggedNote && note.id === draggedNote.id;

  const selected = false;


  // pointer events must be set so that if it is being
  // dragged, it shouldn't get pointer events because
  // that interferes with the drag boxes (you can't
  // drag downwards a single box)
  const pointerEvents = dragged ? 'none' : 'visiblePainted';

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

    svg('rect', { x: x - clickableWidth / 2, y: y - clickableHeight / 2, width: clickableWidth, height: clickableHeight, 'pointer-events': pointerEvents, opacity: 0 }, { mousedown: mousedown as (e: Event) => void })
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
  const stemX = x - noteHeadWidth;
  const stemY = y + 30;
  const numberOfTails = Note.lengthToNumTails(note.length);

  return svg('g', { class: 'singleton' }, [
    shouldTie(note, previousNote) ? tie(staveY, note.pitch, x, noteWidth, previousNote, lastStaveX) : null,
    shouldTie(note, previousNote) ?  null : renderGracenote(note.gracenote, gracenoteProps),

    noteHead(x, y, note, (event: MouseEvent) => dispatch({ name: 'note clicked', note, event }), draggedNote),
    Note.hasStem(note) ? svg('line', { x1: stemX, x2: stemX, y1: y, y2: stemY, stroke: 'black' }) : null,

    (numberOfTails > 0)
      ? svg('g', { class: 'tails' },
            [...Array(numberOfTails).keys()].map(t => svg('line', { x1: stemX, x2: stemX + 10, y1: stemY - 5 * t, y2: stemY - 5 * t - 10, stroke: 'black', 'stroke-width': 2 })))
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
  state: NoteState,
  gracenoteState: GracenoteState,
}

function renderTriplet(triplet: TripletModel, props: NoteProps): V {
  // Draws a triplet

  // This is mostly just repetitive, but there's enough different that it isn't worth trying to reuse code
  const notes = Note.tripletNoteModels(triplet);
  const firstGracenoteX = props.x;
  const firstX = firstGracenoteX + props.noteWidth * gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(triplet.first.gracenote, triplet.first.pitch, nmap(props.previousNote, n => n.pitch));
  const secondGracenoteX = firstX + props.noteWidth;
  const secondX = secondGracenoteX + props.noteWidth * (gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(triplet.second.gracenote, triplet.second.pitch, triplet.first.pitch));
  const thirdGracenoteX = secondX + props.noteWidth;
  const thirdX = thirdGracenoteX + props.noteWidth * (gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(triplet.third.gracenote, triplet.third.pitch, triplet.second.pitch));


  const firstY = noteY(props.y, triplet.first.pitch);
  const secondY = noteY(props.y, triplet.second.pitch);
  const thirdY = noteY(props.y, triplet.third.pitch);

  const defaultHeight = (pitch: Pitch) => noteY(props.y, pitch) + 30;
  const firstStemY = Note.hasBeam(triplet.length) ? Math.max(defaultHeight(triplet.first.pitch), secondY + 20) : defaultHeight(triplet.first.pitch);
  const thirdStemY = Note.hasBeam(triplet.length) ? Math.max(defaultHeight(triplet.third.pitch), secondY + 20) : defaultHeight(triplet.third.pitch);
  const secondStemY = Note.hasBeam(triplet.length) ? (secondX - firstX) / (thirdX - firstX) * (thirdStemY - firstStemY) + firstStemY : defaultHeight(triplet.second.pitch);

  setXY(triplet.first.id, firstGracenoteX - noteHeadWidth, firstX + noteHeadWidth, props.y);
  setXY(triplet.second.id, secondGracenoteX - noteHeadWidth, secondX + noteHeadWidth, props.y);
  setXY(triplet.third.id, thirdGracenoteX - noteHeadWidth, thirdX + noteHeadWidth, props.y);

  const firstGracenoteProps = ({
    x: firstGracenoteX, y: props.y,
    gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
    thisNote: triplet.first.pitch, previousNote: props.previousNote && props.previousNote.pitch,
    dispatch: props.dispatch, state: props.gracenoteState
  });
  const secondGracenoteProps = ({
    x: secondGracenoteX, y: props.y,
    gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
    thisNote: triplet.second.pitch, previousNote: triplet.first.pitch,
    dispatch: props.dispatch, state: props.gracenoteState
  });
  const thirdGracenoteProps = ({
    x: thirdGracenoteX, y: props.y,
    gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
    thisNote: triplet.third.pitch, previousNote: triplet.second.pitch,
    dispatch: props.dispatch, state: props.gracenoteState
  });
  return svg('g', { class: 'triplet' }, [
    svg('g', { class: 'first' }, [
      noteHead(firstX, firstY, notes[0], (event) => props.dispatch({ name: 'note clicked', note: triplet.first, event }), props.state.dragged),
      renderGracenote(triplet.first.gracenote, firstGracenoteProps),
      svg('line', { x1: firstX - noteHeadWidth, x2: firstX - noteHeadWidth, y1: firstY, y2: firstStemY, stroke: 'black' }),
    ]),
    props.state.inputtingNotes ? noteBoxes(firstX + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'add gracenote to triplet', pitch, which: 'second', triplet })) : svg('g'),
    svg('g', { class: 'second' }, [
      noteHead(secondX, secondY, notes[1], (event) => props.dispatch({ name: 'note clicked', note: triplet.second, event }), props.state.dragged),
      renderGracenote(triplet.second.gracenote, secondGracenoteProps),
      svg('line', { x1: secondX - noteHeadWidth, x2: secondX - noteHeadWidth, y1: secondY, y2: secondStemY, stroke: 'black' }),
      beamFrom(firstX - noteHeadWidth, firstStemY, secondX - noteHeadWidth, secondStemY, Note.lengthToNumTails(triplet.length), Note.lengthToNumTails(triplet.length))
    ]),
    props.state.inputtingNotes ? noteBoxes(secondX + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'add gracenote to triplet', pitch, which: 'third', triplet })) : svg('g'),
    svg('g', { class: 'first' }, [
      noteHead(thirdX, thirdY, notes[2], (event) => props.dispatch({ name: 'note clicked', note: triplet.third, event }), props.state.dragged),
      renderGracenote(triplet.third.gracenote, thirdGracenoteProps),
      svg('line', { x1: thirdX - noteHeadWidth, x2: thirdX - noteHeadWidth, y1: thirdY, y2: thirdStemY, stroke: 'black' }),
      beamFrom(secondX - noteHeadWidth, secondStemY, thirdX - noteHeadWidth, thirdStemY, Note.lengthToNumTails(triplet.length), Note.lengthToNumTails(triplet.length))
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
      // relativeIndex takes a note and returns not the actual index, but the index including
      // gracenoteToNoteWidthRatio * all the gracenotes up to it
      // useful for x calculations

      const relativeIndexOfGracenote = (index: number) => totalWidth(group.slice(0,index), previousPitch);
      const relativeIndexOf = (note: NoteModel,index: number) => relativeIndexOfGracenote(index) + (note.tied ? 0 : gracenoteToNoteWidthRatio * (Gracenote.numberOfNotes(note.gracenote,note.pitch, index === 0 ? previousPitch : group[index - 1].pitch)));
      const xOf = (noteIndex: number) => props.x + relativeIndexOf(group[noteIndex],noteIndex) * props.noteWidth;
      const yOf = (note: NoteModel) => noteY(props.y, note.pitch);
      const stemXOf = (index: number) => xOf(index) - noteHeadWidth;

      const firstNote: NoteModel = group[0];
      const lastNote: NoteModel = nlast(group);

      const gracenoteX = (index: number) => props.x + props.noteWidth * relativeIndexOfGracenote(index);
      const setNoteXY = (note: NoteModel, index: number) => setXY(note.id, gracenoteX(index) - noteHeadWidth, xOf(index) + noteHeadWidth, props.y);

      if (Note.numberOfNotes(group) === 1) {
        setNoteXY(firstNote, 0);
        const gracenoteProps = ({
          // can just be props.x since it is the first note
          x: props.x,
          y: props.y,
          gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
          thisNote: firstNote.pitch,
          previousNote: previousPitch,
          dispatch: props.dispatch,
          state: props.gracenoteState
        });

        const nb = () => props.state.inputtingNotes ? noteBoxes(xOf(0) + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'note added', pitch, noteBefore: firstNote })) : svg('g');

        return singleton(firstNote,xOf(0),props.y,props.noteWidth, gracenoteProps, props.previousNote, props.endOfLastStave, nb, props.state.dragged, props.dispatch);
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

        const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote,lowestNoteIndex) / totalWidth(group,previousPitch));

        const stemYOf = (note: NoteModel, index: number) =>
          (Note.hasBeam(note.length) ?
          props.y
          + (multipleLowest
             // straight line if there is more than one lowest note
               ? 0
               // otherwise use a slant
                 : diff * relativeIndexOf(note,index) / totalWidth(group,previousPitch))
                 // offset so that the lowest note is always a constant height
                 + diffForLowest
                 : noteY(props.y, note.pitch) + 30)
         // ${(group.length === 3) ? triplet(props.y,xOf(0), xOf(2), yOf(firstNote), yOf(lastNote)) : null}
        return svg('g', { class: 'grouped-notes' },
                   group.map((note, index) => {
                     setNoteXY(note, index);
                     const previousNote = group[index - 1] || null;
                     const gracenoteProps = ({
                       x: gracenoteX(index),
                       y: props.y,
                       gracenoteWidth: props.noteWidth * 0.6,
                       thisNote: note.pitch,
                       previousNote: nmap(previousNote, p => p.pitch),
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

                       (previousNote !== null && index > 0) ? beamFrom(stemXOf(index),stemYOf(note, index), stemXOf(index - 1),stemYOf(previousNote, index - 1), Note.lengthToNumTails(note.length), Note.lengthToNumTails(previousNote.length)) : null,

                       noteHead(xOf(index), yOf(note), note, (event: MouseEvent) => props.dispatch({ name: 'note clicked', note, event }), props.state.dragged),

                       props.state.inputtingNotes ? noteBoxes(xOf(index) + noteHeadWidth, props.y, props.noteWidth, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'note added', pitch, noteBefore: note })) : svg('g'),

                       svg('line', { x1: stemXOf(index), x2: stemXOf(index), y1: yOf(note), y2: stemYOf(note, index), stroke: 'black' })
                     ])
                   }));
      }
    }
  }
}
