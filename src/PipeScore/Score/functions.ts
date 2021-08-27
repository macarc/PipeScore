/*
  Score methods
  Copyright (C) 2021 Archie Maclean
*/

import { flatten, replaceIndex } from '../global/utils';

import { ScoreModel } from './model';
import { StaveModel } from '../Stave/model';
import { BarModel } from '../Bar/model';
import { TimeSignatureModel } from '../TimeSignature/model';

import Stave from '../Stave/functions';
import TextBox from '../TextBox/functions';

function bars(score: ScoreModel): BarModel[] {
  // Returns all bars in the score

  return flatten(score.staves.map((stave) => Stave.bars(stave)));
}
function staves(score: ScoreModel): StaveModel[] {
  // Returns all the staves in the score

  return score.staves;
}

function addStave(
  score: ScoreModel,
  afterStave: StaveModel,
  before: boolean
): ScoreModel {
  // Appends a stave after afterStave

  const ind = score.staves.indexOf(afterStave);
  const newStave = Stave.init(
    afterStave.bars[0] ? afterStave.bars[0].timeSignature : undefined
  );
  if (ind !== -1)
    return {
      ...score,
      staves: replaceIndex(before ? ind : ind + 1, 0, score.staves, newStave),
    };

  return score;
}

function deleteStave(score: ScoreModel, stave: StaveModel): ScoreModel {
  // Deletes the stave from the score
  // Does not worry about purging notes/bars; that should be handled elsewhere

  const newScore = { ...score };
  const ind = newScore.staves.indexOf(stave);
  if (ind !== -1) newScore.staves.splice(ind, 1);
  return newScore;
}

const init = (
  name = 'My Tune',
  numberOfStaves = 2,
  timeSignature: TimeSignatureModel | undefined = undefined
): ScoreModel => ({
  name,
  width: 210 * 5,
  height: 297 * 5,
  staves: [...Array(numberOfStaves).keys()].map(() =>
    Stave.init(timeSignature)
  ),
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
