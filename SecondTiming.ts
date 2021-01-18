import { svg } from 'uhtml';
<<<<<<< HEAD
import { Svg, ID } from './all';
import { NoteModel } from './Note';
import { getXY } from './Controller';
=======
import { Svg } from './all';
import { NoteModel } from './NoteModel';
>>>>>>> 630626b (Continue refactor)



export interface SecondTimingModel {
  start: ID,
  middle: ID,
  end: ID
}



function render(secondTiming: SecondTimingModel): Svg {
  const start = getXY(secondTiming.start);
  const middle = getXY(secondTiming.middle);
  const end = getXY(secondTiming.end);
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


const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  render,
  init
}
