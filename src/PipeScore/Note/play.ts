import { NoteModel, TripletModel } from './model';
import Note from './functions';

import { PlaybackElement } from '../Playback';
import { flatten } from '../global/utils';

import playNote from '../Note/play';


export default function play(note: NoteModel | TripletModel): PlaybackElement[] {
  if (Note.isTriplet(note)) {
    return [];
  } else {
    return [{ pitch: note.pitch, duration: Note.lengthToNumber(note.length) }];
  }
}
