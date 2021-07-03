import { Pitch } from '../global/pitch';

import { GracenoteModel } from './model';
import Gracenote from './functions';

import { PlaybackElement } from '../Playback';

export default function play(gracenote: GracenoteModel, note: Pitch, previous: Pitch | null): PlaybackElement[] {
  const notes = Gracenote.notesOf(gracenote, note, previous)
  if (Gracenote.isInvalid(notes)) {
    return [];
  } else {
    return notes.map(pitch => ({ pitch, duration: 0 }));
  }
}
