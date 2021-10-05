/*
  Play whole score
  Copyright (C) 2021 Archie Maclean
*/
import { Score } from './model';
import { PlaybackElement } from '../Playback';

export default function play(score: Score): PlaybackElement[] {
  return score.play();
}
