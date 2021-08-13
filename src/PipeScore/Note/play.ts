import { Pitch } from '../global/pitch';

import { NoteModel, TripletModel } from './model';
import Note from './functions';

import playGracenote from '../Gracenote/play';

import { PlaybackElement } from '../Playback';

export default function play(
  note: NoteModel | TripletModel,
  previous: Pitch | null
): PlaybackElement[] {
  if (Note.isTriplet(note)) {
    const duration = (2 / 3) * Note.lengthToNumber(note.length);
    return [
      ...playGracenote(note.first.gracenote, note.first.pitch, previous),
      { pitch: note.first.pitch, tied: note.tied, duration },
      ...playGracenote(
        note.second.gracenote,
        note.second.pitch,
        note.first.pitch
      ),
      { pitch: note.second.pitch, tied: false, duration },
      ...playGracenote(
        note.third.gracenote,
        note.third.pitch,
        note.second.pitch
      ),
      { pitch: note.third.pitch, tied: false, duration },
    ];
  } else {
    return [
      ...playGracenote(note.gracenote, note.pitch, previous),
      {
        pitch: note.pitch,
        tied: note.tied,
        duration: Note.lengthToNumber(note.length),
      },
    ];
  }
}
