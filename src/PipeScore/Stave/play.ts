/*
  Play a line of music
  Copyright (C) 2021 Archie Maclean
*/
import { StaveModel } from './model';
import Stave from './functions';

import { PlaybackElement } from '../Playback';
import { arrayflatten, nmap } from '../global/utils';

import playBar from '../Bar/play';

export default function play(
  stave: StaveModel,
  previous: StaveModel | null
): PlaybackElement[] {
  return arrayflatten(
    stave.bars.map((b, i) =>
      playBar(
        b,
        i === 0 ? nmap(previous, (p) => Stave.lastBar(p)) : stave.bars[i - 1]
      )
    )
  );
}
