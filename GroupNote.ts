import { svg } from 'uhtml';
import { Svg, Pitch, lineGap, noteBoxes, noteOffset, noteY, flatten, removeNull } from './all';
import { NoteModel, NoteProps, PreviousNote, noteHeadWidth, gracenoteToNoteWidthRatio, noteAndGracenoteWidth, noteHead, tailGap, shortTailLength, initNoteModel } from './NoteModel';
import Tie, { DisplayTie, shouldTie } from './Tie';
import Gracenote, { DisplayGracenote } from './Gracenote';
import { NoteLength, noteLengthToNumTails, noteLengthToNumber, numberToNoteLength, splitLengthNumber } from './NoteLength';
import { dispatch } from './Controller';

export interface GroupNoteModel {
  notes: NoteModel[]
}

export function unGroupNotes(notes: GroupNoteModel[]): NoteModel[] {
  return flatten(notes.map(note => note.notes));
}

export function groupNotes(notes: NoteModel[], lengthOfGroup: number): GroupNoteModel[] {
  let currentGroup: GroupNoteModel = { notes: [] },
  groupedNotes: GroupNoteModel[] = [],
  currentLength = 0,
  previousLength = 0;
  const pushNote = (currentGroup: GroupNoteModel, note: NoteModel, length: number, previousLength: number): number => {
    // add a note to the end - also merges notes if it can and they are tied
    if (note.tied && previousLength !== 0) {
        const newLength = length + previousLength;
        const newNoteLength = numberToNoteLength(newLength);
        if (newNoteLength === null) {
          currentGroup.notes.push(note);
          return length;
        } else {
          currentGroup.notes[currentGroup.notes.length - 1].length = newNoteLength;
          return newLength;
        }
      } else {
        currentGroup.notes.push(note);
        return length;
      }
    };
  notes.forEach(note => {
    const length = noteLengthToNumber(note.length);
    if (currentLength + length < lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length, previousLength);
      currentLength += length;
    } else if (currentLength + length === lengthOfGroup) {
      pushNote(currentGroup, note, length, previousLength);
      groupedNotes.push(currentGroup);
      currentLength = 0;
      currentGroup = { notes: [] };
      previousLength = 0;
    } else {
      // TODO maybe this shouldn't be doing all this work
      const splitLengths = splitLengthNumber(length, lengthOfGroup - currentLength);
      const splitNoteLengths = splitLengths.map(numberToNoteLength);
      const splitNotes = splitNoteLengths.filter(removeNull).map(length => initNoteModel(note.pitch, length, true));
      splitNotes[0].gracenote = note.gracenote;
      // It is set to be true, so override with the correct value
      splitNotes[0].tied = note.tied;
      pushNote(currentGroup, splitNotes[0], noteLengthToNumber(splitNotes[0].length), previousLength);
      groupedNotes.push(currentGroup);
      previousLength = 0;

      currentLength = splitLengths.splice(1).reduce((a,b) => a + b);

      // If it goes over multiple groups, then add all the groups and use the last one
      if (currentLength >= lengthOfGroup) {
        console.log(splitNotes.slice(1))
        const currentNotesGroup = groupNotes(splitNotes.slice(1), lengthOfGroup);
        groupedNotes = groupedNotes.concat(currentNotesGroup.slice(0, currentNotesGroup.length - 1));
        currentGroup = currentNotesGroup[currentNotesGroup.length - 1];
        currentLength = currentGroup.notes.reduce((a,b) => a + noteLengthToNumber(b.length), 0);
      } else {
        currentGroup = { notes: [] };
        if (splitNotes.length > 1) {
          splitNotes.slice(1).forEach(n => {
            const current = noteLengthToNumber(n.length);
            previousLength = pushNote(currentGroup, n, current, previousLength);
          });
        }
      }
    }
  });
  // pushes the last notes to the groupedNotes
  // this also ensures that the length will never be 0, even if there are 0 notes
  groupedNotes.push(currentGroup);
  return groupedNotes;
}


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


const totalBeatWidth = (groupNote: GroupNoteModel, previousPitch: Pitch | null) => noteAndGracenoteWidth(groupNote.notes, previousPitch);

const lastNoteOfGroupNote = (groupNote: GroupNoteModel) => (groupNote.notes.length === 0) ? null : groupNote.notes[groupNote.notes.length - 1].pitch;

const lastNoteXOffset = (beatWidth: number, note: GroupNoteModel, previousPitch: Pitch | null) => beatWidth * noteAndGracenoteWidth(note.notes.slice(0, note.notes.length - 1), previousPitch);

interface DisplayShortNote {
  x: number,
  y: number,
  prevStemX: number,
  prevStemY: number,
  stemX: number,
  stemY: number,
  length: NoteLength,
  prevLength: NoteLength,
  gracenote: DisplayGracenote | null,
  onClick: (event: MouseEvent) => void,
  tie: DisplayTie | null,
  numberOfTails: number,
  noteBoxes: () => Svg,
  shouldBeam: boolean,
  note: NoteModel
}

function renderNote(display: DisplayShortNote): Svg {
  return svg`<g class="grouped-note">
    ${display.tie ? Tie.render(display.tie) : null}
    ${display.gracenote ? Gracenote.render(display.gracenote) : null}

    ${noteHead(display.x, display.y, display.note, (event: MouseEvent) => dispatch({ name: 'note clicked', note: display.note, event }))}

    ${
      (display.shouldBeam) ? beamFrom(display.stemX,display.stemY, display.prevStemX,display.prevStemY, noteLengthToNumTails(display.length), noteLengthToNumTails(display.prevLength)) : null
    }

    ${display.noteBoxes()}

    <line
      x1=${display.stemX}
      x2=${display.stemX}
      y1=${display.y}
      y2=${display.stemY}
      stroke="black"
      />
  </g>`;
}

export interface DisplayGroupNote {
  notes: DisplayShortNote[]
}

function prerender(groupNote: GroupNoteModel, props: NoteProps): DisplayGroupNote {
  const previousPitch = props.previousNote && props.previousNote.pitch;
  // relativeIndex takes a note and returns not the actual index, but the index including
  // gracenoteToNoteWidthRatio * all the gracenotes up to it
  // useful for x calculations

  const relativeIndexOfGracenote = (index: number) => noteAndGracenoteWidth(groupNote.notes.slice().splice(0,index), previousPitch);
  const relativeIndexOf = (shortNote: NoteModel,index: number) => relativeIndexOfGracenote(index) + (shortNote.tied ? 0 : gracenoteToNoteWidthRatio * (Gracenote.numberOfNotes(shortNote.gracenote,shortNote.pitch, index === 0 ? previousPitch : groupNote.notes[index - 1].pitch)));
  const xOf = (noteIndex: number) => props.x + relativeIndexOf(groupNote.notes[noteIndex],noteIndex) * props.noteWidth;
  const yOf = (note: NoteModel) => noteY(props.y, note.pitch);

  const stemXOf = (index: number) => xOf(index) - noteHeadWidth;


  const firstNote: NoteModel = groupNote.notes[0];
  const lastNote: NoteModel = groupNote.notes[groupNote.notes.length - 1];

  const cap = (n: number, cap: number) =>
    (n > cap) ? cap :
    (n < -cap) ? -cap :
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

  const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote,lowestNoteIndex) / totalBeatWidth(groupNote,previousPitch));


  const stemYOf = (shortNote: NoteModel, index: number) =>
    props.y
      + (multipleLowest
        // straight line if there is more than one lowest note
        ? 0
        // otherwise use a slant
        : diff * relativeIndexOf(shortNote,index) / totalBeatWidth(groupNote,previousPitch))
      // offset so that the lowest note is always a constant height
      + diffForLowest;
  return ({
    notes: groupNote.notes.map(
      (shortNote,index) => {
        let previousNote: NoteModel | null = groupNote.notes[index - 1] || null;

        const gracenoteProps = ({
          x: props.x + props.noteWidth * relativeIndexOfGracenote(index),
          y: props.y,
          gracenoteWidth: props.noteWidth * 0.6,
          thisNote: shortNote.pitch,
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

        const hasTie = props.previousNote && shouldTie(shortNote, previousNoteObj);
        return ({
          // have to check for previousNote again because TypeScript is bad at inference :(
          tie: (props.previousNote && hasTie) ? Tie.prerender(props.y, shortNote.pitch, xOf(index), props.previousNote) : null,
          x: xOf(index),
          y: yOf(shortNote),
          shouldBeam: index !== 0,
          length: shortNote.length,
          // todo all these 'prev' attributes should ideally go in a single nullable object
          prevLength: index === 0 ?  NoteLength.Crotchet : groupNote.notes[index - 1].length,
          prevStemX: index === 0 ? 0 : stemXOf(index - 1),
          prevStemY: index === 0 ? 0 : stemYOf(groupNote.notes[index - 1], index - 1),
          stemX: stemXOf(index),
          stemY: stemYOf(shortNote, index),
          gracenote: (shortNote.gracenote !== null && (!hasTie)) ? Gracenote.prerender(shortNote.gracenote, gracenoteProps) : null,
          onClick: (a: any) => null,
          numberOfTails: 0,
          noteBoxes: () => noteBoxes(xOf(index) + noteHeadWidth, props.y, props.noteWidth, (pitch: Pitch) => dispatch({ name: 'mouse over pitch', pitch }), (pitch: Pitch) => dispatch({ name: 'note added', pitch, index: index + 1, note: groupNote })),
          note: shortNote
        })
      })
  });
}

function render(display: DisplayGroupNote): Svg {
  return svg`
    <g class="grouped-notes">
      ${display.notes.map(
        (shortNote) => renderNote(shortNote)
      )}
  </g>`;
}
  

export default {
  prerender,
  render,
  totalBeatWidth,
  lastNoteOfGroupNote,
  lastNoteXOffset
}

