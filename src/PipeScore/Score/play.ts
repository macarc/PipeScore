/*
  Play whole score
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreModel } from './model';
import { PlaybackElement } from '../Playback';
import { arrayflatten } from '../global/utils';

import playStave from '../Stave/play';

export default function play(score: ScoreModel): PlaybackElement[] {
  return arrayflatten(
    score.staves.map((st, i) =>
      playStave(st, i === 0 ? null : score.staves[i - 1])
    )
  );
}
