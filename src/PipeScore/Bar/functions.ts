/*
  Bar methods
  Copyright (C) 2021 Archie Maclean
*/
import { Pitch } from '../global/pitch';
import { last } from '../global/utils';

import { BarModel } from './model';
import { Note } from '../Note/model';

const numberOfNotes = (bar: BarModel): number => bar.notes.length;

function lastPitch(bar: BarModel): Pitch | null {
  const lastNote = bar.notes[bar.notes.length - 1];
  if (!lastNote) {
    return null;
  } else {
    return lastNote.lastPitch();
  }
}

function lastNote(bar: BarModel): Note | null {
  return last(bar.notes);
}

export default {
  lastPitch,
  lastNote,
  numberOfNotes,
};
