/*
  Gracenote/view.ts - Gracenote implementation for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';
import { Pitch, noteY } from '../global/pitch';
import { lineGap } from '../global/constants';
import { nlast } from '../global/utils';
import width, { Width } from '../global/width';

import { Dispatch } from '../Controllers/Controller';
import { clickGracenote } from '../Controllers/Gracenote';
import { GracenoteModel } from './model';
import { GracenoteState } from './state';

import Gracenote from './functions';

const tailXOffset = 3;
// actually this is half of the head width
const gracenoteHeadRadius = 3.5;
const gracenoteHeadWidth = 2 * gracenoteHeadRadius;
const gracenoteToNoteWidthRatio = 0.6;

export function gracenoteWidth(
  gracenote: GracenoteModel,
  thisNote: Pitch,
  previousNote: Pitch | null
): Width {
  const notes = Gracenote.notesOf(gracenote, thisNote, previousNote);
  const length = Gracenote.isInvalid(notes)
    ? notes.gracenote.length
    : notes.length;
  return width.init(
    2 * gracenoteHeadRadius * length,
    gracenoteToNoteWidthRatio * length
  );
}

const colourOf = (selected: boolean) => (selected ? 'orange' : 'black');

function head(
  dispatch: Dispatch,
  gracenote: GracenoteModel,
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
      { mousedown: () => dispatch(clickGracenote(gracenote)) }
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

// Offsets from the centre of the gracenote head to the point where the stem touches it
const stemXOf = (x: number) => x + 3;
const stemYOf = (y: number) => y - 2;

function single(
  note: Pitch,
  isValid: boolean,
  x: number,
  staveY: number,
  dispatch: Dispatch,
  gracenote: GracenoteModel,
  selected: boolean
): V {
  // Draws a single gracenote

  const y = noteY(staveY, note);

  const colour = colourOf(selected);

  return svg('g', { class: 'gracenote' }, [
    head(dispatch, gracenote, x, y, note, y - 3 * lineGap, isValid, selected),

    //svg('line', { x1: stemXOf(x), x2: stemXOf(x), y1: stemYOf(y), y2: stemYOf(y) - 20, stroke: 'black' }),

    ...[0, 1, 2].map((n) =>
      svg('line', {
        x1: stemXOf(x),
        x2: stemXOf(x) + 5,
        y1: stemYOf(y) - 20 + 3 * n,
        y2: stemYOf(y) - 16 + 3 * n,
        stroke: colour,
      })
    ),
  ]);
}

export interface GracenoteProps {
  thisNote: Pitch;
  previousNote: Pitch | null;
  y: number;
  x: number;
  noteWidth: number;
  dispatch: Dispatch;
  state: GracenoteState;
}

export default function render(
  gracenote: GracenoteModel,
  props: GracenoteProps
): V {
  const selected =
    props.state.dragged === gracenote || props.state.selected === gracenote;
  if (gracenote.type === 'single') {
    return single(
      gracenote.note,
      true,
      props.x,
      props.y,
      props.dispatch,
      gracenote,
      selected
    );
  } else if (gracenote.type === 'reactive' || gracenote.type === 'custom') {
    // notes must be mapped to objects so that .indexOf will give
    // the right answer (so it will compare by reference
    // rather than by value)
    const grace = Gracenote.notesOf(
      gracenote,
      props.thisNote,
      props.previousNote
    );
    const uniqueNotes: { note: Pitch }[] = Gracenote.isInvalid(grace)
      ? grace.gracenote.map((note) => ({ note }))
      : grace.map((note) => ({ note }));

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
      return single(
        uniqueNotes[0].note,
        !Gracenote.isInvalid(grace),
        xOf(uniqueNotes[0]),
        props.y,
        props.dispatch,
        gracenote,
        selected
      );
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
          head(
            props.dispatch,
            gracenote,
            xOf(noteObj),
            y(noteObj.note),
            noteObj.note,
            props.y - 3.5 * lineGap,
            !Gracenote.isInvalid(grace),
            selected
          )
        ),
      ]);
    }
  } else if (gracenote.type === 'none') {
    return svg('g', { class: 'no-gracenote' });
  } else {
    return gracenote;
  }
}
