/*
  Play bars
  Copyright (C) 2021 Archie Maclean
*/
import { BarModel } from './model';
import Bar from './functions';

import { PlaybackElement } from '../Playback';
import { nmap } from '../global/utils';

import playNote from '../Note/play';

export default function play(
  bar: BarModel,
  previous: BarModel | null
): PlaybackElement[] {
  return bar.notes.flatMap((note, i) =>
    playNote(
      note,
      i === 0
        ? nmap(previous, (p) => Bar.lastPitch(p))
        : nmap(bar.notes[i - 1], (n) => n.lastPitch())
    )
  );
}
