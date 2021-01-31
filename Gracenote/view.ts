/*
  Gracenote.ts - Gracenote implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Pitch, lineGap, noteY, Svg } from '../all';

import { GracenoteModel, Gracenote } from './model';
import { gracenotes, notesOf, isInvalid } from './functions';





const tailXOffset = 3;
// actually this is half of the head width
const gracenoteHeadWidth = 3.5;


function head(x: number,y: number, note: Pitch, beamY: number, isValid: boolean): Svg {
  const ledgerLeft = 5;
  const ledgerRight = 5.2;
  // todo: make ledger line the correct length
  const rotateText = "rotate(-30 " + x + " " + y + ")";
  return svg`<g class="gracenote-head">
    ${note === Pitch.HA ? svg`<line x1=${x - ledgerLeft} x2=${x + ledgerRight} y1=${y} y2=${y} stroke="black" />` : null}
    <ellipse cx=${x} cy=${y} rx=${gracenoteHeadWidth} ry="2.5" transform="${rotateText}" fill=${isValid ? "black" : "red"} pointer-events="none" />

    <line x1=${x + tailXOffset} y1=${y} x2=${x + tailXOffset} y2=${beamY} stroke="black" />
  </g>`;
}

const stemXOf = (x: number) => x + 3;
const stemYOf = (y: number) => y - 2;

function single(note: Pitch, x: number, staveY: number): Svg {
  const y = noteY(staveY, note);
  return svg`<g class="gracenote">
    ${head(x,y, note, y - 3 * lineGap, true)}

    <line x1=${stemXOf(x)} x2=${stemXOf(x)} y1=${stemYOf(y)} y2=${stemYOf(y) - 20} stroke="black" />

    ${[0,1,2].map(n => svg`<line x1=${stemXOf(x)} x2=${stemXOf(x) + 5} y1=${stemYOf(y) - 20 + 3 * n} y2=${stemYOf(y) - 16 + 3 * n} stroke="black" />`)}
  </g>`;
}

export interface GracenoteProps {
  thisNote: Pitch,
  previousNote: Pitch | null,
  y: number,
  x: number,
  gracenoteWidth: number,
}

export default function render(gracenote: GracenoteModel, props: GracenoteProps): Svg {
  if (gracenote.type === 'single') {
    return single(gracenote.note, props.x, props.y);
  } else if (gracenote.type === 'reactive') {
    // notes must be mapped to objects so that .indexOf will give
    // the right answer (so it will compare by reference
    // rather than by value)
    const grace = notesOf(gracenote, props.thisNote, props.previousNote);
    const uniqueNotes: { note: Pitch }[] = isInvalid(grace) ? grace.gracenote.map(note => ({ note })) : grace.map(note => ({ note }));

    const xOf = (noteObj: { note: Pitch}) => props.x + uniqueNotes.indexOf(noteObj) * props.gracenoteWidth + gracenoteHeadWidth;
    const y = (note: Pitch) => noteY(props.y, note);
    if (uniqueNotes.length === 1) {
      return single(uniqueNotes[0].note, xOf(uniqueNotes[0]), props.y);
    } else {
      return svg`<g class="reactive-gracenote">
        ${[0,2,4].map(i => svg`<line x1=${xOf(uniqueNotes[0]) + tailXOffset} x2=${xOf(uniqueNotes[uniqueNotes.length - 1]) + tailXOffset} y1=${props.y - 3.5 * lineGap + i} y2=${props.y - 3.5 * lineGap + i} stroke="black" />`
        )}
        ${uniqueNotes.map(
          noteObj => head(xOf(noteObj), y(noteObj.note), noteObj.note, props.y - 3.5 * lineGap, ! isInvalid(grace))
        )}
      </g>`;
    }
  } else if (gracenote.type === 'none') {
    return svg`<g class="no-gracenote"></g>`;
  } else {
    return gracenote;
  }
}

