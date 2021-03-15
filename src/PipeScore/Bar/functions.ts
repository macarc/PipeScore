/*
   Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { genId, last } from '../global/utils';

import { BarModel, Barline } from './model';
import { NoteModel, TripletModel } from '../Note/model';

import Note from '../Note/functions';
import TimeSignature from '../TimeSignature/functions';

const numberOfNotes = (bar: BarModel): number => bar.notes.length;

function lastPitch(bar: BarModel): Pitch | null {
  const lastNote = bar.notes[bar.notes.length - 1];
  if (! lastNote) {
    return null;
  } else if (Note.isTriplet(lastNote)) {
    return lastNote.third.pitch;
  } else {
    return lastNote.pitch;
  }
}

function lastNote(bar: BarModel): NoteModel | TripletModel | null {
  return last(bar.notes);
}

const init = (timeSignature = TimeSignature.init()): BarModel => ({
  timeSignature: TimeSignature.copy(timeSignature),
  notes: [],
  frontBarline: Barline.Normal,
  backBarline: Barline.Normal,
  isAnacrusis: false,
  id: genId()
});

const initAnacrusis = (timeSignature = TimeSignature.init()): BarModel => ({
  timeSignature: TimeSignature.copy(timeSignature),
  notes: [],
  frontBarline: Barline.Normal,
  backBarline: Barline.Normal,
  isAnacrusis: true,
  id: genId()
});

export default {
  init,
  initAnacrusis,
  lastPitch,
  lastNote,
  numberOfNotes,
}

