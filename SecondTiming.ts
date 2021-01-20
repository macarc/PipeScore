import { svg } from 'uhtml';
import { Svg } from './all';
import { NoteModel } from './Note';
import { getNoteXY } from './Controller';



export interface SecondTimingModel {
  start: NoteModel,
  middle: NoteModel,
  end: NoteModel
}



function render(secondTiming: SecondTimingModel): Svg {
  const start = getNoteXY(secondTiming.start);
  const middle = getNoteXY(secondTiming.middle);
  const end = getNoteXY(secondTiming.end);
  if (start && middle && end) {
    return svg`<g class="second-timing">
      <line x1=${start[0]} y1=${start[1] - 10} x2=${middle[0]} y2=${middle[1] - 10} stroke="black" />
      <line x1=${middle[0]} y1=${middle[1] - 10} x2=${end[0]} y2=${end[1] - 10} stroke="black" />

      ${[start, middle, end].map(([x,y]) =>
        svg`<line x1=${x} x2=${x} y1=${y - 10} y2=${y - 5} stroke="black" />`
      )}
    </g>`
  } else {
    console.error('invalid second timing!');
    return svg`<g></g>`;
  }
}


const init = (start: NoteModel, middle: NoteModel, end: NoteModel): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  render,
  init
}
