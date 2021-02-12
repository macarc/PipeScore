import { flatten } from '../global/utils';

import { StaveModel } from './model';
import { BarModel } from '../Bar/model';
import { GroupNoteModel } from '../Note/model';

import Bar from '../Bar/functions';

function groupNotes(stave: StaveModel): GroupNoteModel[] {
  return flatten(stave.bars.map(b => Bar.groupNotes(b)));
}

function bars(stave: StaveModel): BarModel[] {
  return stave.bars;
}

function addBar(stave: StaveModel, bar: BarModel): void {
  const ind = stave.bars.indexOf(bar);
  if (ind !== -1)
    stave.bars.splice(ind + 1, 0, Bar.init());
}
function deleteBar(stave: StaveModel, bar: BarModel): void {
  const ind = stave.bars.indexOf(bar);
  if (ind !== -1)
    stave.bars.splice(ind, 1);
}

const init: () => StaveModel = () => ({
  bars: [Bar.init(),Bar.init(),Bar.init(),Bar.init()]
})

export default {
  init,
  groupNotes,
  bars,
  addBar,
  deleteBar
}
