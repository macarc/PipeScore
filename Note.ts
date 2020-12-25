import { svg } from 'uhtml';
import { Pitch, RestOrPitch, Svg, noteOffset, lineHeightOf, noteY } from './all';
import Gracenote, { GracenoteModel } from './Gracenote';
import { dispatch, isSelected } from './Controller';

import { log, unlog, log2, unlog2 } from './all';

export interface NoteModel {
  pitch: RestOrPitch,
  length: number,
  gracenote: GracenoteModel | null,
}

interface NonRestNoteModel {
  pitch: Pitch,
  length: number,
  gracenote: GracenoteModel | null,
}

export interface GroupNoteModel {
  notes: NoteModel[]
}


const selectedNotes: NoteModel[] = [];



const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;

const noteLengthToNumTails = (length: number) => Math.ceil(Math.log(1 / length) / Math.log(2));


const noteAndGracenoteWidth = (notes: NoteModel[], gracenoteRatio: number, prevNote: RestOrPitch='rest') =>
	notes.map((n,i) => 1 +
	(n.pitch === 'rest' || n.gracenote === null
		? 0
		: gracenoteRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch))
	).reduce((a,b) => a + b, 0);
    
const totalBeatWidth = (note: GroupNoteModel,previousNote: RestOrPitch) => noteAndGracenoteWidth(note.notes, gracenoteToNoteWidthRatio, previousNote);

const lastNoteOfWholeNote = (wholeNote: GroupNoteModel) => wholeNote.notes.length === 0 ? 'rest' : wholeNote.notes[wholeNote.notes.length - 1].pitch;

const numberOfNotes = (note: GroupNoteModel) => note.notes.length;

function beamFrom(x1: number,y1: number, x2: number,y2: number, tails1: number,tails2: number): Svg {
	// draw beams from note1 at x1,y1 with tails1 to note2 x2,y2 with tails2
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


	return svg`<g class="tails">
    ${sharedTails.map(
    i =>
      svg`<line
        x1=${xL}
        x2=${xR}
        y1=${yL - i * tailGap}
        y2=${yR - i * tailGap}
        stroke="black"
        stroke-width="2" />`
        )}
    ${diffTails.map(
    i =>
      svg`<line
        x1=${diffIsL ? xL : xR}
        x2=${diffIsL ? xL + shortTailLength : xR - shortTailLength}
        y1=${(diffIsL ? yL : yR) - i * tailGap}
        y2=${tailEndY - i * tailGap}
        stroke="black"
        stroke-width="2" />`
        )}
	</g>`;
};
  
function noteHead(x: number,y: number, note: NonRestNoteModel,noteIndex: number,selected: boolean, mousedown: (e: Event) => void): Svg {
    // Draw note head, ledger line and dot
    const noteWidth = 5;
    const noteHeight = 4;
    const rotation = 30;

    const clickableWidth = 14;
    const clickableHeight = 12;

    const hasDot = (Math.log(note.length) / Math.log(2)) % 1 !== 0;
    const dotYOffset = ([Pitch.G,Pitch.B,Pitch.D,Pitch.F,Pitch.HA].includes(note.pitch)) ? -3 : 0;
    const dotXOffset = 10;
    const dragged = isSelected(note);


    // pointer events must be set so that if it is being
    // dragged, it shouldn't get pointer events because
    // that interferes with the drag boxes (you can't
    // drag downwards a single box)
    const pointerEvents = dragged ? 'none' : 'visiblePainted';

    const filled = note.length < 1.5; // shorter than a dotted crotchet

    const rotateText = "rotate(30 " + Math.round(x) + " " + Math.round(y) + ")";

    const colour = selected ? "orange" : "black";

    return svg`<g class="note-head">
      <ellipse cx=${x} cy=${y} rx="5" ry="4" stroke=${colour} fill=${filled ? colour : "white"} transform=${rotateText} pointer-events=${pointerEvents} />

      ${hasDot ? svg`<circle cx=${x + dotXOffset} cy=${y + dotYOffset} r="1.5" fill=${colour} pointer-events="none" />` : null}

      ${(note.pitch === Pitch.HA) ? svg`<line class="ledger" x1=${x - 8} x2=${x + 8} y1=${y} y2=${y} stroke=${colour} pointer-events="none" />` : null}


      <rect x=${x - clickableWidth / 2} y=${y - clickableHeight / 2} width=${clickableWidth} height=${clickableHeight} onmousedown=${mousedown} pointer-events=${pointerEvents} opacity="0"/>
    </g>`;
};
function singleton(note: NonRestNoteModel,noteIndex: number,lastNote: RestOrPitch, x: number,y: number, noteWidth: number,numberOfTails: number, selectedNotes: NoteModel[]): Svg {
    const stemX = x - 5;
    const stemY = lineHeightOf(y) + 30;

    const gracenoteProps = ({
      x: x,
      y: y,
      gracenoteWidth: noteWidth * 0.6,
      thisNote: note.pitch,
      previousNote: lastNote
    })

    return svg`
      ${note.gracenote === null ? null : Gracenote.render(note.gracenote, gracenoteProps)}

      ${noteHead(x, noteY(y, note.pitch), note,noteIndex, selectedNotes.includes(note), () => dispatch({ name: 'note clicked', note }))}
      ${(note.length > 3) ? null : svg`<line
        x1=${stemX}
        x2=${stemX}
        y1=${y}
        y2=${stemY}
        stroke="black"
        />`}
      ${numberOfTails > 0 ? svg`<g class="tails">
        ${[...Array(numberOfTails).keys()].map(t => svg`<line x1=${stemX} x2=${stemX + 10} y1=${stemY - 5 * t} y2=${stemY - 5 * t - 10} stroke="black" />`)}
      </g>` : null}
    `;
};


interface NoteProps {
  x: number,
  y: number,
  previousNote: RestOrPitch,
  noteWidth: number,
  selectedNotes: NoteModel[],
  draggedNote: NoteModel | null,
}

function isNonRest(note: NoteModel): note is NonRestNoteModel {
  return note.pitch !== 'rest';
}

function render(note: GroupNoteModel,props: NoteProps): Svg {

  if (note.notes.length === 0) {
    return svg`<g></g>`;
  } else {
    // takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations

    const lastNote: RestOrPitch = props.previousNote;
    const relativeIndexOfGracenote = (index: number) => noteAndGracenoteWidth(note.notes.slice().splice(0,index), gracenoteToNoteWidthRatio, lastNote);
    const relativeIndexOf = (shortNote: NoteModel,index: number) => relativeIndexOfGracenote(index) + gracenoteToNoteWidthRatio * (shortNote.gracenote === null ? 0 : Gracenote.numberOfNotes(shortNote.gracenote,shortNote.pitch, index === 0 ? lastNote : note.notes[index - 1].pitch));
    const xOf = (noteIndex: number) => props.x + relativeIndexOf(note.notes[noteIndex],noteIndex) * props.noteWidth;
    const yOf = (note: NonRestNoteModel) => noteY(props.y, note.pitch);

    const stemXOf = (index: number) => xOf(index) - 5;


    const firstNote = note.notes[0];
    if (numberOfNotes(note) === 1 && isNonRest(firstNote)) {
      const numberOfTails = Math.ceil(-1 * Math.log(firstNote.length) / Math.log(2));
      return singleton(firstNote,0,lastNote,props.x,props.y,props.noteWidth,numberOfTails, props.selectedNotes);
    } else if (numberOfNotes(note) === 1) {
          
      return svg`<g class="rest">
        <circle cx=${props.x} cy=${props.y} r="10" fill="red" />
      </g>`;

    } else {
      const firstNonRest_ = note.notes.reduce((last: null | [NonRestNoteModel, number],next: NoteModel, index: number) => {
        if (last !== null) {
          return last;
        } else if (isNonRest(next)) {
          return <[NonRestNoteModel, number]>[next, index];
        } else {
          return last;
        }
      }, <[NonRestNoteModel, number] | null>null);


      if (firstNonRest_ === null) {
        //todo
        return svg`<g></g>`;
      } else {
        const [firstNonRest, firstNonRestIndex] = firstNonRest_;

        const [lastNonRest, lastNonRestIndex] = note.notes.reduce((last: [NonRestNoteModel, number],next: NoteModel, index: number) => {
          if (index <= firstNonRestIndex) return last;
          if (isNonRest(next)) {
            return <[NonRestNoteModel, number]>[next, index];
          } else {
            return last;
          }
        }, [firstNonRest, firstNonRestIndex]);

        const cap = (n: number, cap: number) =>
          (n > cap) ? cap :
          (n < -cap) ? -cap :
          n;

        const diff = cap(
          // todo cap should be dependent on how many notes are in the group
          // difference between first and last notes in a group
          noteOffset(lastNonRest.pitch)
          - noteOffset(firstNonRest.pitch),
          10);


        

        let multiple = false;
        const [lowestNote,lowestNoteIndex]: [NonRestNoteModel,number] = note.notes.reduce((last,next, index) => {
          if (index <= firstNonRestIndex) return last;
          if (isNonRest(next)) {
            const [lowestNoteSoFar,lowestNoteIndexSoFar] = last;
            if (noteOffset(next.pitch) === noteOffset(lowestNoteSoFar.pitch)) {
              multiple = true;
              return last;
            } else if (noteOffset(next.pitch) > noteOffset(lowestNoteSoFar.pitch)) {
              multiple = false;
              return <[NonRestNoteModel, number]>[next,index];
            } else {
              return last;
            }
          } else {
            return last;
          }
        }, [firstNonRest,firstNonRestIndex]);

        const multipleLowest = multiple;

        const stemOffset = (note: NonRestNoteModel) => 
          noteOffset(lowestNote.pitch) - noteOffset(note.pitch);

        const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote,lowestNoteIndex) / totalBeatWidth(note,props.previousNote));


        const stemYOf = (shortNote: NoteModel, index: number) =>
          props.y
            + (multipleLowest
              // straight line if there is more than one lowest note
              ? 0
              // otherwise use a slant
              : diff * relativeIndexOf(shortNote,index) / totalBeatWidth(note,props.previousNote))
            // offset so that the lowest note is always a constant height
            + diffForLowest;
        // Intentional double equals (array out of bounds)
        const notANote = (note?: NoteModel) => note == null || note.pitch === 'rest';

        const isSingleton = (index: number) => !(notANote(note.notes[index - 1]) || notANote(note.notes[index + 1]));


        return svg`
          <g class="grouped-notes">
            ${note.notes.map(
              (shortNote,index) => {
                if (isNonRest(shortNote)) {
                  let previousNote = note.notes[index - 1];

                  const gracenoteProps = ({
                    x: props.x + props.noteWidth * relativeIndexOfGracenote(index),
                    y: props.y,
                    gracenoteWidth: props.noteWidth * 0.6,
                    thisNote: shortNote.pitch,
                    previousNote: previousNote ? previousNote.pitch : lastNote
                  });


                  return svg.for(shortNote)`<g class="grouped-note">
                      ${shortNote.gracenote === null ? null : Gracenote.render(shortNote.gracenote,gracenoteProps)}

                      ${noteHead(xOf(index), yOf(shortNote), shortNote,index, props.selectedNotes.includes(shortNote), () => dispatch({ name: 'note clicked', note: shortNote }))}

                      ${
                        previousNote ? beamFrom(stemXOf(index),stemYOf(shortNote, index), stemXOf(index - 1),stemYOf(previousNote, index - 1), noteLengthToNumTails(shortNote.length), noteLengthToNumTails(previousNote.length)) : null
                      }

                      <line
                        x1=${stemXOf(index)}
                        x2=${stemXOf(index)}
                        y1=${yOf(shortNote)}
                        y2=${stemYOf(shortNote, index)}
                        stroke="black"
                        />
                    </g>`
                } else {
                  // todo
                  return svg`<g></g>`;
                }
              }
            )}
          </g>`;
      }
    }
  }
};

const init: () => GroupNoteModel = () => ({
	notes: [
    { pitch: Pitch.A, length: 0.5, gracenote: Gracenote.init() },
    { pitch: Pitch.D, length: 0.25, gracenote: Gracenote.init() },
    { pitch: Pitch.HA, length: 0.25, gracenote: Gracenote.init() }
  ]
});

export default {
  render,
  init,
  totalBeatWidth,
  lastNote: lastNoteOfWholeNote,
};
