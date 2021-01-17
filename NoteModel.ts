import { svg } from 'uhtml';
import Gracenote, { GracenoteModel } from './Gracenote';
import { Pitch, Svg, noteY } from './all';
import { NoteLength, isFilled, hasDot, hasStem } from './NoteLength';
import { isSelected, isBeingDragged } from './Controller';

export const gracenoteToNoteWidthRatio = 0.6;
export const tailGap = 5;
export const shortTailLength = 10;
export const noteHeadWidth = 5;

export interface NoteModel {
  pitch: Pitch,
  length: NoteLength,
  gracenote: GracenoteModel,
  tied: boolean
}

export interface PreviousNote {
  pitch: Pitch,
  x: number,
  y: number
}

export interface NoteProps {
  x: number,
  y: number,
  previousNote: PreviousNote | null,
  noteWidth: number,
}

export function tie(staveY: number, pitch: Pitch, x: number, previousNote: PreviousNote): Svg {
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
  const path = `
M ${x0},${y0} S ${midx},${midhiy}, ${x1},${y1}
M ${x1},${y1} S ${midx},${midloy}, ${x0},${y0}
    `;
  return svg`<path d=${path} stroke="black">`;
}

export const shouldTie = (note: NoteModel, previous: PreviousNote | null): previous is PreviousNote => note.tied && (previous || false) && previous.pitch === note.pitch;


export function noteHead(x: number, y: number, note: NoteModel, mousedown: (e: MouseEvent) => void, opacity: number = 1): Svg {
    // Draw note head, ledger line and dot
    const noteWidth = 5;
    const noteHeight = 4;
    const rotation = 30;

    const clickableWidth = 14;
    const clickableHeight = 12;

    const dotted = hasDot(note.length);
    const dotYOffset = ([Pitch.G,Pitch.B,Pitch.D,Pitch.F,Pitch.HA].includes(note.pitch)) ? -3 : 0;
    const dotXOffset = 10;
    const dragged = isBeingDragged(note);
    const selected = isSelected(note);


    // pointer events must be set so that if it is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)
    const pointerEvents = dragged ? 'none' : 'visiblePainted';

    const filled = isFilled(note.length);

    const rotateText = "rotate(30 " + Math.round(x) + " " + Math.round(y) + ")";

    const colour = selected ? "orange" : "black";

    return svg`<g class="note-head">
      <ellipse cx=${x} cy=${y} rx="5" ry="4" stroke=${colour} fill=${filled ? colour : "white"} transform=${rotateText} pointer-events=${pointerEvents} opacity=${opacity} />

      ${dotted ? svg`<circle cx=${x + dotXOffset} cy=${y + dotYOffset} r="1.5" fill=${colour} pointer-events="none" opacity=${opacity} />` : null}

      ${(note.pitch === Pitch.HA) ? svg`<line class="ledger" x1=${x - 8} x2=${x + 8} y1=${y} y2=${y} stroke=${colour} pointer-events="none" opacity=${opacity} />` : null}


      <rect x=${x - clickableWidth / 2} y=${y - clickableHeight / 2} width=${clickableWidth} height=${clickableHeight} onmousedown=${mousedown} pointer-events=${pointerEvents} opacity="0"/>
    </g>`;
};

export const noteAndGracenoteWidth = (notes: NoteModel[], prevNote: Pitch | null) =>
	notes.map((n,i) => 1 + (n.tied ? 0 :
	  (gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch)))
	).reduce((a,b) => a + b, 0);
    
export const initNoteModel = (pitch: Pitch, length: NoteLength, tied: boolean = false) => ({
  pitch,
  length,
  gracenote: Gracenote.init(),
  tied
});

