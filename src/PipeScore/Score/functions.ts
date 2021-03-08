/*
   Copyright (C) 2020 Archie Maclean
 */

import { flatten } from '../global/utils';

import { ScoreModel } from './model';
import { StaveModel } from '../Stave/model';
import { BarModel } from '../Bar/model';

import Stave from '../Stave/functions';


function bars(score: ScoreModel): BarModel[] {
  // Returns all bars in the score

  return flatten(score.staves.map(stave => Stave.bars(stave)));
}
function staves(score: ScoreModel): StaveModel[] {
  // Returns all the staves in the score

  return score.staves;
}

function addStave(score: ScoreModel, afterStave: StaveModel, before: boolean): void {
  // Appends a stave after afterStave

  const ind = score.staves.indexOf(afterStave);
  if (ind !== -1)
    score.staves.splice(before ? ind : ind + 1, 0, Stave.init());
}

function deleteStave(score: ScoreModel, stave: StaveModel): ScoreModel {
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere

  const newScore = { ...score };
  const ind = newScore.staves.indexOf(stave);
  if (ind !== -1)
    newScore.staves.splice(ind, 1);
  return newScore;
}


const init: () => ScoreModel = () => ({
  staves: [Stave.init(),Stave.init()],
  textBoxes: [],
  secondTimings: []
});


export default {
  init,
  bars,
  staves,
  addStave,
  deleteStave,
}
