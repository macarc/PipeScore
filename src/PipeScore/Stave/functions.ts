/*
  Stave methods
  Copyright (C) 2021 Archie Maclean
 */
import { replaceIndex } from '../global/utils';

import { StaveModel } from './model';
import { Anacrusis, Bar } from '../Bar/model';
import TimeSignature from '../TimeSignature/functions';

import { last } from '../global/utils';

function bars(stave: StaveModel): Bar[] {
  // Returns all the bars in the stave

  return stave.bars;
}

function deleteBar(stave: StaveModel, bar: Bar): StaveModel {
  // Deletes the bar from the stave
  // Doesn't worry about purging the notes; that should be dealt with elsewhere

  const newStave = { ...stave };
  const ind = newStave.bars.indexOf(bar);
  if (ind !== -1) newStave.bars.splice(ind, 1);
  return newStave;
}

function lastBar(stave: StaveModel): Bar | null {
  return last(stave.bars);
}

const init = (timeSignature = TimeSignature.init()): StaveModel => ({
  bars: [
    new Bar(timeSignature),
    new Bar(timeSignature),
    new Bar(timeSignature),
    new Bar(timeSignature),
  ],
});

export default {
  init,
  bars,
  deleteBar,
  lastBar,
};
