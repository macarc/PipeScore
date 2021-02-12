/*
  Bar/functions.ts - Defines functions that transform Bars
  Copyright (C) 2020 Archie Maclean
*/
import { Pitch } from '../global/pitch';
import { genId } from '../global/utils';
import { BarModel, Barline } from './model';

import { GroupNoteModel } from '../Note/model';

import Note from '../Note/functions';
import TimeSignature from '../TimeSignature/functions';

const groupNotes = (bar: BarModel):  GroupNoteModel[] => bar.notes;

function lastNoteIndex(bar: BarModel): number {
  let index = bar.notes.length - 1;
  if (Note.numberOfNotes(bar.notes[bar.notes.length - 1]) === 0) index = bar.notes.length - 2;
  return index;
}

function lastNote(bar: BarModel): Pitch | null {
  const lastGroupNote = bar.notes[lastNoteIndex(bar)] || null;
  if (lastGroupNote !== null) {
    return Note.lastNoteOfGroupNote(lastGroupNote);
  } else {
    return null;
  }
}

function numberOfGroupNotes(bar: BarModel): number {
  return lastNoteIndex(bar) + 1;
}

const init = (isAnacrusis = false): BarModel => ({
  timeSignature: TimeSignature.init(),
  notes: [Note.init(),Note.init()],
  frontBarline: Barline.Normal,
  backBarline: Barline.Normal,
  isAnacrusis,
  id: genId()
});

export default {
  init,
  groupNotes,
  numberOfGroupNotes,
  lastNote,
  lastNoteIndex
}

