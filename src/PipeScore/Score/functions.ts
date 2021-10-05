/*
  Score methods
  Copyright (C) 2021 Archie Maclean
*/

import { arrayflatten, replaceIndex } from '../global/utils';

import { ScoreModel } from './model';
import { Stave } from '../Stave/model';
import { TimeSignatureModel } from '../TimeSignature/model';

import TextBox from '../TextBox/functions';
import TimeSignature from '../TimeSignature/functions';

const bars = (score: ScoreModel) =>
  arrayflatten(score.staves.map((stave) => stave.allBars()));

const staves = (score: ScoreModel) => score.staves;

function addStave(
  score: ScoreModel,
  afterStave: Stave,
  before: boolean
): ScoreModel {
  // Appends a stave after afterStave

  const adjacentBar = before ? afterStave.firstBar() : afterStave.lastBar();
  const ts = adjacentBar && adjacentBar.timeSignature();
  const ind = score.staves.indexOf(afterStave);
  const newStave = new Stave(ts || TimeSignature.init());
  if (ind !== -1)
    return {
      ...score,
      staves: replaceIndex(before ? ind : ind + 1, 0, score.staves, newStave),
    };

  return score;
}

function deleteStave(score: ScoreModel, stave: Stave): ScoreModel {
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere

  const ind = score.staves.indexOf(stave);
  if (ind !== -1) score.staves.splice(ind, 1);
  return score;
}

const init = (
  name = 'My Tune',
  numberOfStaves = 2,
  timeSignature: TimeSignatureModel | undefined = undefined
): ScoreModel => ({
  name,
  width: 210 * 5,
  height: 297 * 5,
  staves: [...Array(numberOfStaves).keys()].map(() => new Stave(timeSignature)),
  textBoxes: [TextBox.init(name, true)],
  secondTimings: [],
});

export default {
  init,
  bars,
  staves,
  addStave,
  deleteStave,
};
