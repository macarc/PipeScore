import { ScoreModel } from './model';

import { flatten } from '../all';

import Stave from '../Stave/functions';
import { StaveModel } from '../Stave/model';
import TextBox from '../TextBox/functions';
import { BarModel } from '../Bar/model';
import { GroupNoteModel } from '../Note/model';


function groupNotes(score: ScoreModel): GroupNoteModel[] {
  return flatten(score.staves.map(stave => Stave.groupNotes(stave)));
}
function bars(score: ScoreModel): BarModel[] {
  return flatten(score.staves.map(stave => Stave.bars(stave)));
}
function staves(score: ScoreModel): StaveModel[] {
  return score.staves;
}

function addStave(score: ScoreModel, afterStave: StaveModel): void {
  const ind = score.staves.indexOf(afterStave);
  if (ind !== -1)
    score.staves.splice(ind + 1, 0, Stave.init());
}

function deleteStave(score: ScoreModel, stave: StaveModel): void {
  const ind = score.staves.indexOf(stave);
  if (ind !== -1)
    score.staves.splice(ind, 1);
}



const init: () => ScoreModel = () => ({
  staves: [Stave.init(),Stave.init()],
  textBoxes: [TextBox.init()],
  secondTimings: []
});


export default {
  init,
  bars,
  staves,
  addStave,
  deleteStave,
  groupNotes,
}