import { svg } from 'uhtml';
import { lineHeightOf, lineGap, Svg, Pitch, pitchToHeight, noteBoxes } from './all';
import { log, log2, unlog, unlog2 } from './all';
import Note, { GroupNoteModel, NoteModel, lastNoteOfWholeNote, totalBeatWidth } from './Note';
import { TimeSignature } from './TimeSignature';
import { dispatch } from './Controller';


export interface BarModel {
  timeSignature: TimeSignature,
  notes: GroupNoteModel[]
}

interface BarProps {
  x: number,
  y: number,
  width: number,
  previousBar: BarModel | null,
  draggedNote: NoteModel | null,
  dragNote: (note: NoteModel) => void,
}


function groupNotes(bar: BarModel) {
  return bar.notes;
}

function render(bar: BarModel,props: BarProps): Svg {
  const staveY = props.y;


  const previousWholeNote = props.previousBar ? props.previousBar.notes[props.previousBar.notes.length - 1] : null;
  const previousNote = previousWholeNote ? lastNoteOfWholeNote(previousWholeNote) : null;
  const previousNoteOf = (noteIndex: number) => noteIndex === 0
    ? previousNote
    : lastNoteOfWholeNote(bar.notes[noteIndex - 1]) || null;
  
  const beats = bar.notes
    .reduce((nums, n, index) => {
      const previous = previousNoteOf(index);
      return [...nums, nums[nums.length - 1] + totalBeatWidth(n,previous || null)];
    },
    [1]);
  
  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = props.width / totalNumberOfBeats;

  const getX = (noteIndex: number) => props.x + beatWidth * beats[noteIndex];


  const noteProps = (note: GroupNoteModel,index: number) => ({
    x: getX(index),
    y: staveY,
    noteWidth: beatWidth,
    previousNote: index === 0
      ? previousNote || null
      : bar.notes[index - 1] ? lastNoteOfWholeNote(bar.notes[index - 1]) : null,
    selectedNotes: [],
    draggedNote: props.draggedNote,
  });


  return svg`
    <g class="bar">
      ${noteBoxes(props.x,staveY, props.width, (pitch: Pitch) => dispatch({ name: 'mouse over pitch', pitch }))}
      ${bar.notes.map(
        (note,idx) => svg.for(note)`${Note.render(note,noteProps(note,idx))}`
      )}

      <line x1=${props.x} x2=${props.x} y1=${staveY} y2=${lineHeightOf(4) + props.y} stroke="black" />
    </g>`;

}
const init: () => BarModel = () => ({
  timeSignature: [2, 4],
  notes: [Note.init(),Note.init()]
})

export default {
  render,
  init,
  groupNotes
}
