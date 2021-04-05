import { Pitch } from '../global/pitch';

import { NoteModel, TripletModel } from './model';
import Note from './functions';

import playGracenote from '../Gracenote/play';

import { PlaybackElement } from '../Playback';
import { flatten } from '../global/utils';

import playNote from '../Note/play';


export default function play(note: NoteModel | TripletModel, previous: Pitch | null): PlaybackElement[] {
  if (Note.isTriplet(note)) {
    const duration = 2/3 * Note.lengthToNumber(note.length);
    return [{ pitch: note.first.pitch, duration },{ pitch: note.second.pitch, duration },{ pitch: note.third.pitch, duration }];
  } else {
    return [ ...playGracenote(note.gracenote, note.pitch, previous), { pitch: note.pitch, duration: Note.lengthToNumber(note.length) }];
  }
}
