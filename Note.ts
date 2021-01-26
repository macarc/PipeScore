/*
  Note.ts - Note implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
<<<<<<< HEAD
import { Svg } from './all';
import Gracenote, { GracenoteModel, GracenoteProps } from './Gracenote';
import { NoteProps } from './NoteModel';
import Singleton, { SingletonModel, DisplaySingleton } from './Singleton';
import GroupNote, { GroupNoteModel, DisplayGroupNote } from './GroupNote';
=======
import { Pitch, Svg, noteOffset, lineHeightOf, noteY, noteBoxes, flatten, removeNull, ID, genId, deepcopy } from './all';
import { NoteLength, noteLengthToNumTails, hasStem, hasDot, hasBeam, isFilled, splitLength, mergeLengths, noteLengthToNumber, splitLengthNumber, numberToNoteLength } from './NoteLength';
import Gracenote, { GracenoteModel, GracenoteProps } from './Gracenote';
import { dispatch, isSelected, isBeingDragged, setXY } from './Controller';
>>>>>>> before-refactor


<<<<<<< HEAD
/* MODEL */
const init: () => GroupNoteModel = () => ({
	notes: [ ]
});

=======
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
  let currentGroup: GroupNoteModel = { notes: [] },
  groupedNotes: GroupNoteModel[] = [],
  currentLength = 0,
  previousLength = 0;
  const pushNote = (currentGroup: GroupNoteModel, note: NoteModel, length: number, previousLength: number): number => {
    // add a note to the end - also merges notes if it can and they are tied
    const push = (note: NoteModel) => {
      if (hasBeam(note.length)) {
        currentGroup.notes.push(note);
      } else {
        // Push the note as its own group. This won't modify the currentLength,
        // which means that other groupings will still be correct
        groupedNotes.push(deepcopy(currentGroup));
        currentGroup.notes = [note];
        groupedNotes.push(deepcopy(currentGroup));
        currentGroup.notes = [];

      }
    };
    if (note.tied && previousLength !== 0) {
        const newLength = length + previousLength;
        const newNoteLength = numberToNoteLength(newLength);
        if (newNoteLength === null) {
          push(note);
          return length;
        } else {
          currentGroup.notes[currentGroup.notes.length - 1].length = newNoteLength;
          return newLength;
        }
      } else {
        push(note);
        return length;
      }
    };
  notes.forEach(note => {
    const length = noteLengthToNumber(note.length);
    if (currentLength + length < lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length, previousLength);
      currentLength += length;
    } else if (currentLength + length === lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length, previousLength);
      groupedNotes.push(currentGroup);
      currentLength = 0;
      currentGroup = { notes: [] };
      previousLength = 0;
    } else {
      groupedNotes.push(currentGroup);
      currentGroup = { notes: [] };
      previousLength = pushNote(currentGroup, note, length, previousLength);
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
>>>>>>> before-refactor

/* CONSTANTS */
const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;
// note that this is actually *half* the width
const noteHeadWidth = 5;

/* FUNCTIONS */
export function numberOfNotes(note: GroupNoteModel): number {
  return note.notes.length;
}

<<<<<<< HEAD
/* PRERENDER */
function prerender(note: GroupNoteModel, props: NoteProps): DisplayNote {
  if (note.notes.length === 0) {
    return {
      type: 'display none'
    }
  } else if (note.notes.length === 1) {
    return {
      type: 'display singleton',
      display: Singleton.prerender(note.notes[0], props)
    };
  } else {
    return {
      type: 'display group',
      display: GroupNote.prerender(note, props)
    };
  }
=======
const shouldTie = (note: NoteModel, previous: PreviousNote | null): previous is PreviousNote => note.tied && (previous || false) && previous.pitch === note.pitch;

function singleton(note: NoteModel, x: number,y: number, gracenoteProps: GracenoteProps, previousNote: PreviousNote | null, noteBoxes: () => Svg): Svg {
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

    ${noteBoxes()}
  </g>`;
};



export interface PreviousNote {
  pitch: Pitch,
  x: number,
  y: number
>>>>>>> before-refactor
}

/* RENDER */
interface SingletonDisplay {
  type: 'display singleton',
  display: DisplaySingleton
}
interface GroupDisplay {
  type: 'display group',
  display: DisplayGroupNote
}
interface DisplayNone {
  type: 'display none'
}

function isDisplaySingleton(note: DisplayNote): note is SingletonDisplay {
  return note.type === 'display singleton';
}
function isDisplayGroup(note: DisplayNote): note is GroupDisplay {
  return note.type === 'display group';
}
function isDisplayNone(note: DisplayNote): note is DisplayNone {
  return note.type === 'display none';
}

export type DisplayNote = SingletonDisplay | GroupDisplay | DisplayNone;

function render(display: DisplayNote): Svg {
  if (isDisplayNone(display)) {
    return svg`<g></g>`;
  } else if (isDisplaySingleton(display)) {
      return Singleton.render(display.display);
  } else if (isDisplayGroup(display)) {
    return GroupNote.render(display.display);
  } else {
<<<<<<< HEAD
    // never
    return display;
  }
};

=======
    // relativeIndex takes a note and returns not the actual index, but the index including
    // gracenoteToNoteWidthRatio * all the gracenotes up to it
    // useful for x calculations

    const relativeIndexOfGracenote = (index: number) => noteAndGracenoteWidth(note.notes.slice().splice(0,index), previousPitch);
    const relativeIndexOf = (shortNote: NoteModel,index: number) => relativeIndexOfGracenote(index) + (shortNote.tied ? 0 : gracenoteToNoteWidthRatio * (Gracenote.numberOfNotes(shortNote.gracenote,shortNote.pitch, index === 0 ? previousPitch : note.notes[index - 1].pitch)));
    const xOf = (noteIndex: number) => props.x + relativeIndexOf(note.notes[noteIndex],noteIndex) * props.noteWidth;
    const yOf = (note: NoteModel) => noteY(props.y, note.pitch);

    const stemXOf = (index: number) => xOf(index) - noteHeadWidth;


    const firstNote: NoteModel = note.notes[0];
    const lastNote: NoteModel = note.notes[note.notes.length - 1];

    const gracenoteX = (index: number) => props.x + props.noteWidth * relativeIndexOfGracenote(index);
    const setNoteXY = (note: NoteModel, index: number) => setXY(note.id, gracenoteX(index), xOf(index) + noteHeadWidth, props.y);

    if (numberOfNotes(note) === 1) {
      setNoteXY(firstNote, 0);
      const gracenoteProps = ({
        // can just be props.x since it is the first note
        x: props.x,
        y: props.y,
        gracenoteWidth: props.noteWidth * gracenoteToNoteWidthRatio,
        thisNote: firstNote.pitch,
        previousNote: previousPitch
      });

      const nb = () => noteBoxes(xOf(0) + noteHeadWidth, props.y, props.noteWidth, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'note added', pitch, index: 1, note: note }))

      return singleton(firstNote,xOf(0),props.y,gracenoteProps, props.previousNote, nb);
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

      const diffForLowest = 30 + noteOffset(lowestNote.pitch) - (multipleLowest ? 0 : diff * relativeIndexOf(lowestNote,lowestNoteIndex) / totalBeatWidth(note,previousPitch));


      const stemYOf = (shortNote: NoteModel, index: number) =>
        props.y
          + (multipleLowest
            // straight line if there is more than one lowest note
            ? 0
            // otherwise use a slant
            : diff * relativeIndexOf(shortNote,index) / totalBeatWidth(note,previousPitch))
          // offset so that the lowest note is always a constant height
          + diffForLowest;

      return svg`
        <g class="grouped-notes">
          ${note.notes.map(
            (shortNote,index) => {
              setNoteXY(shortNote, index);
              let previousNote: NoteModel | null = note.notes[index - 1] || null;

              const gracenoteProps = ({
                x: gracenoteX(index),
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

              return svg.for(shortNote)`<g class="grouped-note">
                ${shouldTie(shortNote, previousNoteObj) ? tie(props.y, shortNote.pitch, xOf(index), previousNoteObj) : null}
                ${shouldTie(shortNote, previousNoteObj) ? null : Gracenote.render(shortNote.gracenote,gracenoteProps)}

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
          )}
      </g>`;
    }
  }
};

export const initNoteModel = (pitch: Pitch, length: NoteLength, tied: boolean = false) => ({
  pitch,
  length,
  gracenote: Gracenote.init(),
  tied,
  id: genId()
});
>>>>>>> before-refactor


/* EXPORTS */
export default {
  prerender,
  render,
  init,
};
