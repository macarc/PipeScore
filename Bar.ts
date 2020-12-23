import { svg } from 'uhtml';
import { lineHeightOf, lineGap, Svg, Pitch, pitchToHeight } from './all';
import Note, { GroupNoteModel } from './Note';


export interface BarModel {
  notes: GroupNoteModel[]
}


function dragBoxes(x: number,y: number,width: number,mouseDrag: (pitch: Pitch) => void): Svg {
  // Invisible rectangles that are used to detect note dragging
  const height = lineGap / 2;


  const pitches = [Pitch.G,Pitch.A,Pitch.B,Pitch.C,Pitch.D,Pitch.E,Pitch.F,Pitch.HG,Pitch.HA];

  return svg`<g class="drag-boxes">

    <rect x=${x} y=${y - 4 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseDrag(Pitch.HA)} opacity="0" />
    <rect x=${x} y=${y + 3.5 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseDrag(Pitch.G)} opacity="0" />

    ${pitches.map(n => [n,pitchToHeight(n)]).map(([note,boxY]) => 
      svg`<rect
        x=${x}
        y=${y + lineGap * boxY - lineGap / 2}
        width=${width}
        height=${height}
        onmouseover=${() => mouseDrag(note)}
        opacity="0"
        />`)}
  </g>`
};

interface BarProps {
  x: number,
  y: number,
  width: number,
  previousBar: BarModel | null,
  updateBar: (newBar: BarModel) => void
}
function render(bar: BarModel,props: BarProps): Svg {
  const staveY = props.y;


  const previousWholeNote = props.previousBar ? props.previousBar.notes[props.previousBar.notes.length - 1] : null;
  const previousNote = previousWholeNote ? Note.lastNote(previousWholeNote) : null;
  const previousNoteOf = (noteIndex: number) => noteIndex === 0
    ? previousNote
    : Note.lastNote(bar.notes[noteIndex - 1]) || null;
  
  const beats = bar.notes
    .reduce((nums, n, index) => {
      const previous = previousNoteOf(index);
      if (previous !== null) {
        return [...nums, nums[nums.length - 1] + Note.totalBeatWidth(n,previous)];
      } else {
        return nums
      }
    },
    [1]);
  
  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = props.width / totalNumberOfBeats;

  const getX = (noteIndex: number) => props.x + beatWidth * beats[noteIndex];

  const updateNote = (note: GroupNoteModel, index: number) => {
    bar.notes[index] = note;
    props.updateBar(bar);
  }

  const noteProps = (note: GroupNoteModel,index: number) => ({
    x: getX(index),
    y: staveY,
    noteWidth: beatWidth,
    previousNote: index === 0
      ? previousNote || 'rest'
      : bar.notes[index - 1] ? Note.lastNote(bar.notes[index - 1]) : 'rest',
    selectedNotes: [],
    updateNote
  })

  return svg`

    <g class="bar">
      ${dragBoxes(props.x,staveY, props.width, /* todo */() => null)}
      ${bar.notes.map(
        (note,idx) => svg.for(note)`${Note.render(note,noteProps(note,idx))}`
      )}

      <line x1=${props.x} x2=${props.x} y1=${staveY} y2=${lineHeightOf(4) + props.y} stroke="black" />
    </g>`;

}
const init = () => ({
  notes: [Note.init(),Note.init()]

})

export default {
  render,
  init
}
