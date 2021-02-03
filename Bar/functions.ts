import { BarModel, Barline } from './model';
import { Pitch, genId } from '../all';
import { GroupNoteModel } from '../Note/model';

import Note from '../Note/functions';
import TimeSignature from '../TimeSignature/functions';

export const groupNotes = (bar: BarModel):  GroupNoteModel[] => bar.notes;

export function lastNoteIndexOfBar(bar: BarModel): number {
  let lastNoteIndex = bar.notes.length - 1;
  if (Note.numberOfNotes(bar.notes[bar.notes.length - 1]) === 0) lastNoteIndex = bar.notes.length - 2;
  return lastNoteIndex;
}

export function lastNoteOfBar(bar: BarModel): Pitch | null {
  const lastGroupNote = bar.notes[lastNoteIndexOfBar(bar)] || null;
  if (lastGroupNote !== null) {
    return Note.lastNoteOfGroupNote(lastGroupNote);
  } else {
    return null;
  }
}

export function numberOfGroupNotes(bar: BarModel): number {
  return lastNoteIndexOfBar(bar) + 1;
}

export const init = (isAnacrusis = false): BarModel => ({
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
  lastNoteOfBar,
  lastNoteIndexOfBar
}

