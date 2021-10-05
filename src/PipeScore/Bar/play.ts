/*
  Play bars
  Copyright (C) 2021 Archie Maclean
*/
import { Bar } from './model';

import { PlaybackElement } from '../Playback';

export default function play(
  bar: Bar,
  previous: Bar | null
): PlaybackElement[] {
  return bar.play(previous);
}
