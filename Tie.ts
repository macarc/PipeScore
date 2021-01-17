import { svg } from 'uhtml';
import { Svg, Pitch, noteY } from './all';
import { NoteModel, PreviousNote } from './NoteModel';

export function render(display: DisplayTie): Svg {
  const path = `
M ${display.x0},${display.y0} S ${display.midx},${display.midhiy}, ${display.x1},${display.y1}
M ${display.x1},${display.y1} S ${display.midx},${display.midloy}, ${display.x0},${display.y0}
    `;
  return svg`<path d=${path} stroke="black">`;
}

export const shouldTie = (note: NoteModel, previous: PreviousNote | null): previous is PreviousNote => note.tied && (previous || false) && previous.pitch === note.pitch;

export interface DisplayTie {
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  midx: number,
  midloy: number,
  midhiy: number
}

function prerender(staveY: number, pitch: Pitch, x: number, previousNote: PreviousNote): DisplayTie {
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

  return ({
    x0,
    x1,
    y0,
    y1,
    midx,
    midloy,
    midhiy
  })
}


export default {
  prerender,
  render
}
