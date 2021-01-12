import { svg } from 'uhtml';
import { lineHeightOf, lineGap, Svg, Pitch, pitchToHeight, noteBoxes, noteY } from './all';
import { log, log2, unlog, unlog2 } from './all';
import Note, { GroupNoteModel, NoteModel, PreviousNote, lastNoteOfGroupNote, totalBeatWidth, lastNoteXOffset, numberOfNotes } from './Note';
import TimeSignature, { TimeSignatureModel, timeSignatureWidth } from './TimeSignature';
import { dispatch } from './Controller';


export interface BarModel {
  timeSignature: TimeSignatureModel,
  notes: GroupNoteModel[]
}

interface BarProps {
  x: number,
  y: number,
  width: number,
  previousBar: BarModel | null,
  lastNoteX: number | null
}

const beatsOf = (bar: BarModel, previousNote: Pitch | null) => bar.notes
    .reduce((nums, n, index) => {
      const previous = index === 0 ? previousNote : lastNoteOfGroupNote(bar.notes[index - 1]);
      return [...nums, nums[nums.length - 1] + totalBeatWidth(n,previous || null)];
    },
    [1]);

function groupNotes(bar: BarModel) {
  return bar.notes;
}

export function xOffsetOfLastNote(bar: BarModel, width: number): number {
  const beats = beatsOf(bar, null)
  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = width / totalNumberOfBeats;
  let index = bar.notes.length - 1;
  if (numberOfNotes(bar.notes[bar.notes.length - 1]) === 0) index = bar.notes.length - 2;
  if (index >= 0) {
    return beatWidth * beats[index] + lastNoteXOffset(beatWidth, bar.notes[index], lastNoteOfGroupNote(bar.notes[index - 1]) || null);
  } else {
    return 0;
  }
}

function render(bar: BarModel,props: BarProps): Svg {
  const staveY = props.y;
  const hasTimeSignature = props.previousBar !== null ? props.previousBar.timeSignature === bar.timeSignature : true;
  const width = props.width - (hasTimeSignature ? timeSignatureWidth : 0);
  const xAfterTimeSignature = props.x + (hasTimeSignature ? timeSignatureWidth : 0);



  const previousWholeNote = props.previousBar ? (() => {
    const last = props.previousBar.notes[props.previousBar.notes.length - 1];
    if (numberOfNotes(last) === 0) {
      // if all the notes add up to an even number, then the final note in the bar will have 0 length
      // so in that case, return the second last note
      return props.previousBar.notes[props.previousBar.notes.length - 2];
    } else {
      return last;
    }
  })() : null;
  const previousNote = previousWholeNote ? lastNoteOfGroupNote(previousWholeNote) : null;
  const previousNoteOf = (noteIndex: number) => noteIndex === 0
    ? previousNote
    : lastNoteOfGroupNote(bar.notes[noteIndex - 1]) || null;

  const beats = beatsOf(bar, previousNote);
  
  
  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = width / totalNumberOfBeats;

  const getX = (noteIndex: number) => xAfterTimeSignature + beatWidth * beats[noteIndex];


  function previousNoteData(index: number): PreviousNote | null {
    const lastNote = (index > 0 || null) && lastNoteOfGroupNote(bar.notes[index - 1]);
    if (index === 0) {
      if (previousNote !== null && props.lastNoteX !== null) {
        return ({
          pitch: previousNote,
          x: props.lastNoteX,
          y: noteY(props.y, previousNote)
        });
      } else {
        return null;
      }
    } else if (lastNote !== null) {
      const noteBeforeThat = (index < 2) ? null : lastNoteOfGroupNote(bar.notes[index - 2]);
      return ({
        pitch: lastNote,
        x: getX(index - 1) + lastNoteXOffset(beatWidth, bar.notes[index - 1], noteBeforeThat),
        y: noteY(props.y, lastNote)
      })
    } else {
      return null;
    }
  }

  const noteProps = (note: GroupNoteModel,index: number) => ({
    x: getX(index),
    y: staveY,
    noteWidth: beatWidth,
    previousNote: previousNoteData(index),
    selectedNotes: [],
  });


  return svg`
    <g class="bar">
      ${noteBoxes(xAfterTimeSignature,staveY, width, pitch => dispatch({ name: 'mouse over pitch', pitch }))}
      ${noteBoxes(xAfterTimeSignature, staveY, beatWidth, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'note added', index: 0, pitch, note: bar.notes[0] }))}
      ${bar.notes.map(
        (note,idx) => svg.for(note)`${Note.render(note,noteProps(note,idx))}`
      )}

      <line x1=${props.x} x2=${props.x} y1=${staveY} y2=${lineHeightOf(4) + props.y} stroke="black" />
      ${hasTimeSignature ? TimeSignature.render(bar.timeSignature, { x: props.x + 10, y: props.y }) : null}
    </g>`;

}
const init: () => BarModel = () => ({
  timeSignature: TimeSignature.init(),
  notes: [Note.init(),Note.init()]
})

export default {
  render,
  init,
  groupNotes
}
