/*
  Note.ts - Note implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Pitch, Svg, noteOffset, noteY, noteBoxes, flatten, ID, genId } from './all';
import { NoteLength, noteLengthToNumTails, hasStem, hasDot, hasBeam, isFilled, noteLengthToNumber, numberToNoteLength } from './NoteLength';
import Gracenote, { GracenoteModel, GracenoteProps } from './Gracenote';
import { dispatch, isSelected, isBeingDragged, setXY } from './Controller';

export interface NoteModel {
  pitch: Pitch,
  length: NoteLength,
  gracenote: GracenoteModel,
  tied: boolean,
  id: ID
}

export interface GroupNoteModel {
  notes: NoteModel[]
}

export function unGroupNotes(notes: GroupNoteModel[]): NoteModel[] {
  return flatten(notes.map(note => note.notes));
}

export function groupNotes(notes: NoteModel[], lengthOfGroup: number): GroupNoteModel[] {
  const pushNote = (group: GroupNoteModel, note: NoteModel, length: number): number => {
    // add a note to the end - also merges notes if it can and they are tied
    const push = (noteToPush: NoteModel) => {
      if (hasBeam(noteToPush.length)) {
        group.notes.push(noteToPush);
      } else {
        // Push the note as its own group. This won't modify the currentLength,
        // which means that other groupings will still be correct
        if (group.notes.length > 0) groupedNotes.push({ ...group });
        group.notes = [noteToPush];
        groupedNotes.push({ ...group });
        group.notes = [];
      }
    };
    if (note.tied && previousLength !== 0) {
        const newLength = length + previousLength;
        const newNoteLength = numberToNoteLength(newLength);
        if (newNoteLength === null) {
          push(note);
          return length;
        } else {
          group.notes[group.notes.length - 1].length = newNoteLength;
          return newLength;
        }
      } else {
        push(note);
        return length;
      }
    };
  let currentGroup: GroupNoteModel = { notes: [] };
  const groupedNotes: GroupNoteModel[] = [];
  let currentLength = 0;
  let previousLength = 0;
  notes.forEach(note => {
    const length = noteLengthToNumber(note.length);
    if (currentLength + length < lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length);
      currentLength += length;
    } else if (currentLength + length === lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length);
      // this check is needed since pushNote could end up setting currentGroup to have no notes in it
      if (currentGroup.notes.length > 0) groupedNotes.push(currentGroup);
      currentLength = 0;
      currentGroup = { notes: [] };
      previousLength = 0;
    } else {
      groupedNotes.push(currentGroup);
      currentGroup = { notes: [] };
      previousLength = pushNote(currentGroup, note, length);
      currentLength = length;
      if (currentLength >= lengthOfGroup) {
        groupedNotes.push(currentGroup);
        currentGroup = { notes: [] };
        currentLength = 0;
        previousLength = 0;
      }
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
// note that this is actually *half* the width
const noteHeadWidth = 5;

const noteAndGracenoteWidth = (notes: NoteModel[], prevNote: Pitch | null): number =>
  notes.map((n,i) => 1 + (n.tied ? 0 :
                          (gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch)))
           ).reduce((a,b) => a + b, 0);

export const totalBeatWidth = (note: GroupNoteModel,previousPitch: Pitch | null): number => noteAndGracenoteWidth(note.notes, previousPitch);

export const lastNoteOfGroupNote = (groupNote: GroupNoteModel): Pitch | null => (groupNote.notes.length === 0) ? null : groupNote.notes[groupNote.notes.length - 1].pitch;

export const lastNoteXOffset = (beatWidth: number, note: GroupNoteModel, previousPitch: Pitch | null): number => beatWidth * noteAndGracenoteWidth(note.notes.slice().splice(0, note.notes.length), previousPitch) - beatWidth;

export const numberOfNotes = (note: GroupNoteModel): number => note.notes.length;

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
}

function noteHead(x: number, y: number, note: NoteModel, mousedown: (e: MouseEvent) => void, opacity = 1): Svg {
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

    const rotateText = `rotate(${rotation} ${Math.round(x)} ${Math.round(y)})`;

    const colour = selected ? "orange" : "black";

    return svg`<g class="note-head">
      <ellipse cx=${x} cy=${y} rx=${noteWidth} ry=${noteHeight} stroke=${colour} fill=${filled ? colour : "white"} transform=${rotateText} pointer-events=${pointerEvents} opacity=${opacity} />

      ${dotted ? svg`<circle cx=${x + dotXOffset} cy=${y + dotYOffset} r="1.5" fill=${colour} pointer-events="none" opacity=${opacity} />` : null}

      ${(note.pitch === Pitch.HA) ? svg`<line class="ledger" x1=${x - 8} x2=${x + 8} y1=${y} y2=${y} stroke=${colour} pointer-events="none" opacity=${opacity} />` : null}


      <rect x=${x - clickableWidth / 2} y=${y - clickableHeight / 2} width=${clickableWidth} height=${clickableHeight} onmousedown=${mousedown} pointer-events=${pointerEvents} opacity="0"/>
    </g>`;
}

function tie(staveY: number, pitch: Pitch, x: number, previousNote: PreviousNote): Svg {
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

const shouldTie = (note: NoteModel, previous: PreviousNote | null): previous is PreviousNote => note.tied && (previous || false) && previous.pitch === note.pitch;

function singleton(note: NoteModel, x: number,y: number, gracenoteProps: GracenoteProps, previousNote: PreviousNote | null, drawNoteBoxes: () => Svg): Svg {
  // todo this is complected with stemXOf in `render`
  const stemX = x - noteHeadWidth;
  const stemY = noteY(y,note.pitch) + 30;
  const numberOfTails = noteLengthToNumTails(note.length);


  return svg`<g class="singleton">
    ${shouldTie(note, previousNote) ? tie(y, note.pitch, x, previousNote) : null}
    ${shouldTie(note, previousNote) ?  null : Gracenote.render(note.gracenote, gracenoteProps)}

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

    ${drawNoteBoxes()}
  </g>`;
}



export interface PreviousNote {
  pitch: Pitch,
  x: number,
  y: number
}

interface NoteProps {
  x: number,
  y: number,
  previousNote: PreviousNote | null,
  noteWidth: number,
}


function render(groupNote: GroupNoteModel,props: NoteProps): Svg {

  const previousPitch = props.previousNote && props.previousNote.pitch;

  if (groupNote.notes.length === 0) {
    return svg`<g></g>`;
  } else {
    // relativeIndex takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations

    const relativeIndexOfGracenote = (index: number) => noteAndGracenoteWidth(groupNote.notes.slice().splice(0,index), previousPitch);
    const relativeIndexOf = (note: NoteModel,index: number) => relativeIndexOfGracenote(index) + (note.tied ? 0 : gracenoteToNoteWidthRatio * (Gracenote.numberOfNotes(note.gracenote,note.pitch, index === 0 ? previousPitch : groupNote.notes[index - 1].pitch)));
    const xOf = (noteIndex: number) => props.x + relativeIndexOf(groupNote.notes[noteIndex],noteIndex) * props.noteWidth;
    const yOf = (note: NoteModel) => noteY(props.y, note.pitch);

    const stemXOf = (index: number) => xOf(index) - noteHeadWidth;


    const firstNote: NoteModel = groupNote.notes[0];
    const lastNote: NoteModel = groupNote.notes[groupNote.notes.length - 1];

    const gracenoteX = (index: number) => props.x + props.noteWidth * relativeIndexOfGracenote(index);
    const setNoteXY = (note: NoteModel, index: number) => setXY(note.id, gracenoteX(index) - noteHeadWidth, xOf(index) + noteHeadWidth, props.y);

    if (numberOfNotes(groupNote) === 1) {
      setNoteXY(firstNote, 0);
      const gracenoteProps = ({
        // can just be props.x since it is the first note
        x: props.x,
        y: props.y,
        gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
        thisNote: firstNote.pitch,
        previousNote: previousPitch
      });

      const nb = () => noteBoxes(xOf(0) + noteHeadWidth, props.y, props.noteWidth, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'note added', pitch, index: 1, note: groupNote }))

      return singleton(firstNote,xOf(0),props.y,gracenoteProps, props.previousNote, nb);
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
        30 / groupNote.notes.length);




      const [lowestNote,lowestNoteIndex,multipleLowest]: [NoteModel,number,boolean] = groupNote.notes.reduce((last,next, index) => {
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



      const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote,lowestNoteIndex) / totalBeatWidth(groupNote,previousPitch));


      const stemYOf = (note: NoteModel, index: number) =>
        props.y
          + (multipleLowest
            // straight line if there is more than one lowest note
            ? 0
            // otherwise use a slant
            : diff * relativeIndexOf(note,index) / totalBeatWidth(groupNote,previousPitch))
          // offset so that the lowest note is always a constant height
          + diffForLowest;

      return svg`
        <g class="grouped-notes">
          ${groupNote.notes.map(
            (note,index) => {
              setNoteXY(note, index);
              const previousNote: NoteModel | null = groupNote.notes[index - 1] || null;

              const gracenoteProps = ({
                x: gracenoteX(index),
                y: props.y,
                gracenoteWidth: props.noteWidth * 0.6,
                thisNote: note.pitch,
                previousNote: previousNote ? previousNote.pitch : previousPitch
              });

              const previousNoteObj: PreviousNote | null = (() => {
                if (previousNote !== null)
                  return ({
                    pitch: previousNote.pitch,
                    x: xOf(index - 1),
                    y: yOf(previousNote)
                  })
                else
                  return props.previousNote
              })()

              return svg.for(note)`<g class="grouped-note">
                ${shouldTie(note, previousNoteObj) ? tie(props.y, note.pitch, xOf(index), previousNoteObj) : null}
                ${shouldTie(note, previousNoteObj) ? null : Gracenote.render(note.gracenote,gracenoteProps)}

                ${noteHead(xOf(index), yOf(note), note, (event: MouseEvent) => dispatch({ name: 'note clicked', note, event }))}

                ${
                  (previousNote !== null && index > 0) ? beamFrom(stemXOf(index),stemYOf(note, index), stemXOf(index - 1),stemYOf(previousNote, index - 1), noteLengthToNumTails(note.length), noteLengthToNumTails(previousNote.length)) : null
                }

                ${noteBoxes(xOf(index) + noteHeadWidth, props.y, props.noteWidth, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'note added', pitch, index: index + 1, note: groupNote }))}

                <line
                  x1=${stemXOf(index)}
                  x2=${stemXOf(index)}
                  y1=${yOf(note)}
                  y2=${stemYOf(note, index)}
                  stroke="black"
                  />
              </g>`
            }
          )}
      </g>`;
    }
  }
}

export const initNoteModel = (pitch: Pitch, length: NoteLength, tied = false): NoteModel => ({
  pitch,
  length,
  gracenote: Gracenote.init(),
  tied,
  id: genId()
});

const init: () => GroupNoteModel = () => ({
	notes: [ ]
});

export default {
  render,
  init,
};
