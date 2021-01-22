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
  const height = 35;
  const mid = 20;
  if (start && middle && end) {
    return svg`<g class="second-timing">
      <line x1=${start.beforeX} y1=${start.y - height} x2=${middle.afterX} y2=${middle.y - height} stroke="black" />
      <line x1=${middle.afterX} y1=${middle.y - height} x2=${end.afterX} y2=${middle.y - height} stroke="black" />

      ${[[start.beforeX, start.y], [middle.afterX, middle.y], [end.afterX, end.y]].map(([x,y]) => svg`<line x1=${x} x2=${x} y1=${y - height} y2=${y - mid} stroke="black" />`)}
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
