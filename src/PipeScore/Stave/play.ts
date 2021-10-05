/*
  Play a line of music
  Copyright (C) 2021 Archie Maclean
*/
import { Stave } from './model';
import { PlaybackElement } from '../Playback';

export default function play(
  stave: Stave,
  previous: Stave | null
): PlaybackElement[] {
  return stave.play(previous);
}
