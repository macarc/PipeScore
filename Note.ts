import { svg } from 'uhtml';
import { Pitch, Svg, noteOffset, lineHeightOf, noteY, noteBoxes, flatten } from './all';
import { NoteLength, noteLengthToNumTails, hasStem, hasDot, isFilled, splitLength, mergeLengths, noteLengthToNumber, splitLengthNumber, numberToNoteLength } from './NoteLength';
import Gracenote, { GracenoteModel, GracenoteProps } from './Gracenote';
import { dispatch, isSelected, isBeingDragged } from './Controller';

import { log, unlog, log2, unlog2 } from './all';

export interface NoteModel {
  pitch: Pitch,
  length: NoteLength,
  gracenote: GracenoteModel | null,
}

export interface GroupNoteModel {
  notes: NoteModel[]
}

export function unGroupNotes(notes: GroupNoteModel[]): NoteModel[] {
  return flatten(notes.map(note => note.notes));
}

export function groupNotes(notes: NoteModel[], lengthOfGroup: number): GroupNoteModel[] {
  // todo - I'm not sure which file this should go in
  // I feel like it should go in NoteLengths.ts but then it is quite hard to convert back
  // from NoteLength[][] to GroupNote[] since some notelengths might be added
  const groupedNotes: GroupNoteModel[] = [];
  let currentGroup: GroupNoteModel = { notes: [] },
    currentLength = 0;
  notes.forEach(note => {
    const length = noteLengthToNumber(note.length);
    if (currentLength + length < lengthOfGroup) {
      currentGroup.notes.push(note);
      currentLength += length;
    } else if (currentLength + length === lengthOfGroup) {
      currentGroup.notes.push(note);
      groupedNotes.push(currentGroup);
      currentLength = 0;
      currentGroup = { notes: [] };
    } else {
      // currentLength + length > lengthOfGroup

      const splitLengths = splitLengthNumber(length, lengthOfGroup - currentLength);
      const splitNoteLengths = splitLengths.map(numberToNoteLength);
      const splitNotes = splitNoteLengths.map(length => {
        let x: NoteModel = {
          pitch: note.pitch,
          gracenote: null,
          length
        }
        return x;
      });
      splitNotes[0].gracenote = note.gracenote;
      currentGroup.notes.push(splitNotes[0]);
      groupedNotes.push(currentGroup);

      // TODO - check if it goes over another group
      currentLength = splitLengths.slice(1).reduce((a,b) => a + b);
      currentGroup = { notes: splitNotes.slice(1) };
    }
  });
  // pushes the last notes to the groupedNotes
  // this also ensures that the length will never be 0, even if there are 0 notes
  groupedNotes.push(currentGroup);
  return groupedNotes;
}

const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;
const noteHeadWidth = 5;

const noteAndGracenoteWidth = (notes: NoteModel[], gracenoteRatio: number, prevNote: Pitch | null) =>
	notes.map((n,i) => 1 +
	(n.gracenote === null
		? 0
		: gracenoteRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch))
	).reduce((a,b) => a + b, 0);
    
export const totalBeatWidth = (note: GroupNoteModel,previousNote: Pitch | null) => noteAndGracenoteWidth(note.notes, gracenoteToNoteWidthRatio, previousNote);

export const lastNoteOfWholeNote = (wholeNote: GroupNoteModel) => wholeNote.notes.length === 0 ? null : wholeNote.notes[wholeNote.notes.length - 1].pitch;

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
  
function noteHead(x: number, y: number, note: NoteModel, mousedown: (e: MouseEvent) => void, opacity: number = 1): Svg {
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

function singleton(note: NoteModel, x: number,y: number, gracenoteProps: GracenoteProps): Svg {
  // todo this is complected with stemXOf in `render`
  const stemX = x - noteHeadWidth;
  const stemY = noteY(y,note.pitch) + 30;
  const numberOfTails = noteLengthToNumTails(note.length);


  return svg`
    ${note.gracenote === null ? null : Gracenote.render(note.gracenote, gracenoteProps)}

    ${noteHead(x, noteY(y, note.pitch), note, (event: MouseEvent) => dispatch({ name: 'note clicked', note, event }))}
    ${hasStem(note.length) ? svg`<line
      x1=${stemX}
      x2=${stemX}
      y1=${noteY(y,note.pitch)}
      y2=${stemY}
      stroke="black"
      />` : null}
    ${numberOfTails > 0 ? svg`<g class="tails">
      ${[...Array(numberOfTails).keys()].map(t => svg`<line x1=${stemX} x2=${stemX + 10} y1=${stemY - 5 * t} y2=${stemY - 5 * t - 10} stroke="black" stroke-width="2" />`)}
    </g>` : null}
  `;
};



interface NoteProps {
  x: number,
  y: number,
  previousNote: Pitch | null,
  noteWidth: number,
}


function render(note: GroupNoteModel,props: NoteProps): Svg {

  if (note.notes.length === 0) {
    return svg`<g></g>`;
  } else {
    // takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations

    const relativeIndexOfGracenote = (index: number) => noteAndGracenoteWidth(note.notes.slice().splice(0,index), gracenoteToNoteWidthRatio, props.previousNote);
    const relativeIndexOf = (shortNote: NoteModel,index: number) => relativeIndexOfGracenote(index) + gracenoteToNoteWidthRatio * (shortNote.gracenote === null ? 0 : Gracenote.numberOfNotes(shortNote.gracenote,shortNote.pitch, index === 0 ? props.previousNote : note.notes[index - 1].pitch));
    const xOf = (noteIndex: number) => props.x + relativeIndexOf(note.notes[noteIndex],noteIndex) * props.noteWidth;
    const yOf = (note: NoteModel) => noteY(props.y, note.pitch);

    const stemXOf = (index: number) => xOf(index) - noteHeadWidth;


    const firstNote: NoteModel = note.notes[0];
    const lastNote: NoteModel = note.notes[note.notes.length - 1];

    if (numberOfNotes(note) === 1) {
      const gracenoteProps = ({
        // can just be props.x since it is the first note
        x: props.x,
        y: props.y,
        gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
        thisNote: firstNote.pitch,
        previousNote: props.previousNote
      });

      return singleton(firstNote,xOf(0),props.y,gracenoteProps);
    } else {

      const cap = (n: number, cap: number) =>
        (n > cap) ? cap :
        (n < -cap) ? -cap :
        n;

      const diff = cap(
        // todo cap should be dependent on how many notes are in the group
        // difference between first and last notes in a group
        noteOffset(lastNote.pitch)
        - noteOffset(firstNote.pitch),
        30 / note.notes.length);


      

      const [lowestNote,lowestNoteIndex,multipleLowest]: [NoteModel,number,boolean] = note.notes.reduce((last,next, index) => {
        if (index === 0) {
          return last;
        }
        const [lowestNoteSoFar,lowestNoteIndexSoFar,_] = last;
        if (noteOffset(next.pitch) === noteOffset(lowestNoteSoFar.pitch)) {
          return [lowestNoteSoFar, lowestNoteIndexSoFar, true];
        } else if (noteOffset(next.pitch) > noteOffset(lowestNoteSoFar.pitch)) {
          return [next,index, false];
        } else {
          return last;
        }
      }, <[NoteModel,number,boolean]>[firstNote,0, false]);



      const stemOffset = (note: NoteModel) => 
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
      const notANote = (note?: NoteModel) => note == null;

      const isSingleton = (index: number) => notANote(note.notes[index - 1]) && notANote(note.notes[index + 1]);


      return svg`
        <g class="grouped-notes">
          ${note.notes.map(
            (shortNote,index) => {
              let previousNote = note.notes[index - 1];

              const gracenoteProps = ({
                x: props.x + props.noteWidth * relativeIndexOfGracenote(index),
                y: props.y,
                gracenoteWidth: props.noteWidth * 0.6,
                thisNote: shortNote.pitch,
                previousNote: previousNote ? previousNote.pitch : props.previousNote
              });

              if (isSingleton(index)) {
                return singleton(shortNote, xOf(index), props.y, gracenoteProps);
              } else {
              return svg.for(shortNote)`<g class="grouped-note">
                  ${shortNote.gracenote === null ? null : Gracenote.render(shortNote.gracenote,gracenoteProps)}

                  ${noteHead(xOf(index), yOf(shortNote), shortNote, (event: MouseEvent) => dispatch({ name: 'note clicked', note: shortNote, event }))}

                  ${
                    (previousNote !== null && index > 0) ? beamFrom(stemXOf(index),stemYOf(shortNote, index), stemXOf(index - 1),stemYOf(previousNote, index - 1), noteLengthToNumTails(shortNote.length), noteLengthToNumTails(previousNote.length)) : null
                  }

                  ${noteBoxes(xOf(index) + noteHeadWidth, props.y, props.noteWidth, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'note added', pitch, index: index + 1, note: note }))}

                  <line
                    x1=${stemXOf(index)}
                    x2=${stemXOf(index)}
                    y1=${yOf(shortNote)}
                    y2=${stemYOf(shortNote, index)}
                    stroke="black"
                    />
                </g>`
              }
            }
          )}
      </g>`;
    }
  }
};

const init: () => GroupNoteModel = () => ({
	notes: [
    { pitch: Pitch.A, length: NoteLength.Quaver, gracenote: Gracenote.init() },
    { pitch: Pitch.HG, length: NoteLength.SemiQuaver, gracenote: Gracenote.init() },
    { pitch: Pitch.HA, length: NoteLength.SemiQuaver, gracenote: Gracenote.init() }
  ]
});

export default {
  render,
  init,
};
