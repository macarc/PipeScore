import { svg } from 'uhtml';
import { Svg } from './all';
import { NoteModel } from './Note';



export interface SecondTimingModel {
  start: NoteModel,
  middle: NoteModel,
  end: NoteModel
}





function render(secondTiming: SecondTimingModel): Svg {
  return svg`<g></g>`
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
