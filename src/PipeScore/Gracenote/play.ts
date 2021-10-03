/*
  Play gracenotes
  Copyright (C) 2021 Archie Maclean
*/
import { Gracenote } from './model';
import { Pitch } from '../global/pitch';

import { PlaybackElement } from '../Playback';

export default function play(
  gracenote: Gracenote,
  note: Pitch,
  previous: Pitch | null
): PlaybackElement[] {
  const notes = gracenote.notes(note, previous);
  if (notes.isValid()) {
    return notes.notes().map((pitch) => ({ pitch, tied: false, duration: 0 }));
  } else {
    return [];
  }
}
