/*
   Copyright (C) 2020 Archie Maclean
 */
import { StaveModel } from './model';
import { BarModel } from '../Bar/model';

import Bar from '../Bar/functions';

function bars(stave: StaveModel): BarModel[] {
  // Returns all the bars in the stave

  return stave.bars;
}

function addBar(stave: StaveModel, bar: BarModel): void {
  // Adds a new bar after the bar given

  const ind = stave.bars.indexOf(bar);
  if (ind !== -1)
    stave.bars.splice(ind + 1, 0, Bar.init());
}
function deleteBar(stave: StaveModel, bar: BarModel): StaveModel {
  // Deletes the bar from the stave
  // Doesn't worry about purging the notes; that should be dealt with elsewhere

  const newStave = { ...stave };
  const ind = newStave.bars.indexOf(bar);
  if (ind !== -1)
    newStave.bars.splice(ind, 1);
  return newStave;
}

const init: () => StaveModel = () => ({
  bars: [Bar.initAnacrusis(),Bar.init(),Bar.init(),Bar.init()]
})

export default {
  init,
  bars,
  addBar,
  deleteBar
}
