import { svg } from 'uhtml';
import { Svg, Pitch } from './all';
import { NoteModel } from './NoteModel';
import { hasDot, isFilled } from './NoteLength';
import { isBeingDragged, isSelected } from './Controller';

export const noteHeadWidth = 5;

export function noteHead(x: number, y: number, note: NoteModel, mousedown: (e: MouseEvent) => void, opacity: number = 1): Svg {
    // Draw note head, ledger line and dot
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
      <ellipse cx=${x} cy=${y} rx=${noteHeadWidth} ry=${noteHeight} stroke=${colour} fill=${filled ? colour : "white"} transform=${rotateText} pointer-events=${pointerEvents} opacity=${opacity} />

      ${dotted ? svg`<circle cx=${x + dotXOffset} cy=${y + dotYOffset} r="1.5" fill=${colour} pointer-events="none" opacity=${opacity} />` : null}

      ${(note.pitch === Pitch.HA) ? svg`<line class="ledger" x1=${x - 8} x2=${x + 8} y1=${y} y2=${y} stroke=${colour} pointer-events="none" opacity=${opacity} />` : null}


      <rect x=${x - clickableWidth / 2} y=${y - clickableHeight / 2} width=${clickableWidth} height=${clickableHeight} onmousedown=${mousedown} pointer-events=${pointerEvents} opacity="0"/>
    </g>`;
};
