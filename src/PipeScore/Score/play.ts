import { ScoreModel } from './model';
import { PlaybackElement } from '../Playback';
import { flatten } from '../global/utils';

import playStave from '../Stave/play';


export default function play(score: ScoreModel): PlaybackElement[] {
  return flatten(score.staves.map((st, i) => playStave(st, i === 0 ? null : score.staves[i - 1])));
}
