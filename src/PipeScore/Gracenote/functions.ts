/*
  Gracenote methods
  Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { gracenotes } from './gracenotes';
export { gracenotes };

import {
  GracenoteModel,
  Gracenote,
  InvalidGracenote,
  ReactiveGracenote,
} from './model';

const isInvalid = (
  gracenote: Gracenote | InvalidGracenote
): gracenote is InvalidGracenote =>
  (gracenote as InvalidGracenote).gracenote != null;

function numberOfNotes(
  gracenote: GracenoteModel,
  thisNote: Pitch,
  previousNote: Pitch | null
): number {
  // Find the number of notes in the gracenote

  const grace = notesOf(gracenote, thisNote, previousNote);
  if (isInvalid(grace)) {
    if (grace.gracenote.length > 0) {
      return grace.gracenote.length + 1;
    } else {
      return 0;
    }
  } else {
    if (grace.length > 0) {
      return grace.length + 1;
    } else {
      return 0;
    }
  }
}

function notesOf(
  gracenote: GracenoteModel,
  thisNote: Pitch,
  previousNote: Pitch | null
): Pitch[] | InvalidGracenote {
  // Find the notes of a gracenote as an array

  if (gracenote.type === 'single') {
    return [gracenote.note];
  } else if (gracenote.type === 'reactive') {
    const notes = gracenotes.get(gracenote.name);
    if (notes) {
      return notes(thisNote, previousNote);
    }
    return [];
  } else if (gracenote.type === 'custom') {
    return gracenote.notes;
  } else if (gracenote.type === 'none') {
    return [];
  } else {
    // never
    return gracenote;
  }
}

function addSingle(
  g: GracenoteModel,
  s: Pitch,
  note: Pitch,
  prev: Pitch | null
): GracenoteModel {
  // Add a single to an existing gracenoted
  // Used for creating custom embellisments

  if (g.type === 'custom') {
    return initCustom([...g.notes, s]);
  } else if (g.type === 'single') {
    return initCustom([g.note, s]);
  } else if (g.type === 'reactive') {
    const notes = notesOf(g, note, prev);
    if (isInvalid(notes)) {
      return initCustom([...notes.gracenote, s]);
    } else {
      return initCustom([...notes, s]);
    }
  } else {
    return initSingle(s);
  }
}

const isReactive = (g: GracenoteModel): g is ReactiveGracenote =>
  g.type === 'reactive';

const initCustom = (notes: Pitch[]): GracenoteModel => ({
  type: 'custom',
  notes,
});
const init = (): GracenoteModel => ({
  type: 'none',
});

const initSingle = (note: Pitch): GracenoteModel => ({
  type: 'single',
  note,
});

// Convert from name to gracenote
const from = (name: string | null): GracenoteModel =>
  name === null
    ? {
        type: 'single',
        note: Pitch.HG,
      }
    : name === 'none'
    ? {
        type: 'none',
      }
    : {
        type: 'reactive',
        name,
      };

export default {
  init,
  initSingle,
  addSingle,
  from,
  isReactive,
  notesOf,
  numberOfNotes,
  isInvalid,
};
