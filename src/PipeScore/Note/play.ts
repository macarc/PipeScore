/*
  Play notes
  Copyright (C) 2021 Archie Maclean
*/
import { Pitch } from '../global/pitch';
import { Note } from './model';
import { PlaybackElement } from '../Playback';

export default function play(
  note: Note,
  previous: Pitch | null
): PlaybackElement[] {
  return note.play(previous);
}
