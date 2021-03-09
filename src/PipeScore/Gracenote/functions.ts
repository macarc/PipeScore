/*
   Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';

import { GracenoteModel, Gracenote, InvalidGracenote, ReactiveGracenote } from './model';

function isInvalid(gracenote: Gracenote | InvalidGracenote): gracenote is InvalidGracenote {
  return (gracenote as InvalidGracenote).gracenote != null;
}
type GracenoteFn = (note: Pitch, prev: Pitch | null) => Gracenote | InvalidGracenote;

const invalidateIf = (pred: boolean, gracenote: Gracenote): Gracenote | InvalidGracenote => pred ? ({ gracenote }) : gracenote;
const invalid = (gracenote: Gracenote): InvalidGracenote => ({ gracenote });

// gracenotes is a map containing all the possible embellishments in the form of functions
// To get the notes of an embellishment, first get the gracenote type you want, e.g. gracenote["doubling"]
// Then call the resulting function with two arguments: pitch of the note it is on, and pitch of previous note (or null)
const gracenotes: Map<string, GracenoteFn> = new Map();

gracenotes.set('throw-d', note => invalidateIf(note !== Pitch.D, [Pitch.G,Pitch.D,Pitch.C]));
gracenotes.set('doubling', (note, prev) => {
  let pitches = [];
  if (note === Pitch.G || note === Pitch.A || note === Pitch.B || note === Pitch.C) {
    pitches = [Pitch.HG, note, Pitch.D];
  } else if (note === Pitch.D) {
    pitches = [Pitch.HG, note, Pitch.E];
  } else if (note === Pitch.E){
    pitches = [Pitch.HG, note, Pitch.F];
  } else if (note === Pitch.F) {
    pitches = [Pitch.HG, note, Pitch.HG];
  } else if (note === Pitch.HG) {
    // [HA, note, HA] or [HG,F] ?
    pitches = [Pitch.HA,note,Pitch.HA];
  } else if (note === Pitch.HA)  {
    pitches = [Pitch.HA, Pitch.HG];
  } else {
    return [];
  }

  if (prev === Pitch.HG && (note !== Pitch.HA && note !== Pitch.HG)) {
    pitches[0] = Pitch.HA;
  } else if (prev === Pitch.HA) {
    pitches = pitches.splice(1);

    if (note === Pitch.HG) pitches = [Pitch.HG,Pitch.F];
  }

  return pitches;
});
gracenotes.set('edre', (note, prev) => {
  if (prev === Pitch.G && (note === Pitch.E || note === Pitch.HG)) {
    return [Pitch.E,Pitch.G,Pitch.F,Pitch.G];
  } else if (prev === Pitch.F && note === Pitch.HG) {
    return [Pitch.E,Pitch.HG,Pitch.E,Pitch.F,Pitch.E];
  } else if (prev === Pitch.E && note === Pitch.HG) {
    return [Pitch.F,Pitch.E,Pitch.HG,Pitch.E,Pitch.F,Pitch.E];
  } else if (note === Pitch.E || note === Pitch.HG) {
    return [Pitch.E,Pitch.A,Pitch.F,Pitch.A];
  } else if (note === Pitch.F) {
    return [Pitch.F,Pitch.E,Pitch.HG,Pitch.E];
  } else {
    return invalid([Pitch.E,Pitch.A,Pitch.F,Pitch.A])
  }

});
gracenotes.set('grip', note => {
  if (note === Pitch.D) {
    return [Pitch.G, Pitch.B, Pitch.G];
  } else {
    return [Pitch.G, Pitch.D, Pitch.G];
  }
});
gracenotes.set('shake', (note, prev) => {
  let pitches = [];
  pitches = [Pitch.HG,note,Pitch.E,note,Pitch.G];

  if (note === Pitch.E) {
    pitches = [Pitch.HG,note,Pitch.F,note,Pitch.A];
  }
  // I'm not sure these are even gracenotes
  else if (note === Pitch.G) {
    pitches = [Pitch.HG,note,Pitch.D,note,Pitch.E];
  } else if (note === Pitch.F) {
    pitches = [Pitch.HG,note,Pitch.HG,note,Pitch.E];
  } else if (note === Pitch.HG) {
    pitches = [Pitch.HA,note,Pitch.HA,note,Pitch.F];
  } else if (note === Pitch.HA) {
    pitches = [Pitch.HA,Pitch.HG];
  }

  else {
    pitches = [Pitch.HG,note,Pitch.E,note,Pitch.G];
  }

  if (prev === Pitch.HA) {
    pitches.shift();
  } else if (prev === Pitch.HG) {
    pitches[0] = Pitch.HA;
  }

  return pitches;
});
gracenotes.set('toarluath', (note, prev) => {
  let pitches = [];
  if (prev === Pitch.D) {
    pitches = [Pitch.G, Pitch.B, Pitch.G, Pitch.E]
  } else {
    pitches = [Pitch.G, Pitch.D, Pitch.G, Pitch.E]
  }
  if (note === Pitch.E || note === Pitch.F || note === Pitch.HG || note === Pitch.HA) {
    pitches = pitches.slice(0,3);
  }
  return pitches;
});
gracenotes.set('crunluath', (note, prev) => {
  let pitches = []
  if (!prev) {
    return invalid([Pitch.G,Pitch.D,Pitch.G,Pitch.E,Pitch.A,Pitch.F,Pitch.A])
  } if (prev === Pitch.D) {
    pitches = [Pitch.G,Pitch.B,Pitch.G,Pitch.E,Pitch.A,Pitch.F,Pitch.A];
  } else if (prev === Pitch.G) {
    pitches = [Pitch.D,Pitch.A,Pitch.E,Pitch.A,Pitch.F,Pitch.A];
  } else {
    pitches = [Pitch.G,Pitch.D,Pitch.G,Pitch.E,Pitch.A,Pitch.F,Pitch.A];
  }
  return invalidateIf(note !== Pitch.E, pitches);
});
gracenotes.set('birl', (note, prev) => {
  return invalidateIf(note !== Pitch.A, prev === Pitch.A ? [Pitch.G, Pitch.A, Pitch.G] : [Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
});
gracenotes.set('g-gracenote-birl', (note, prev) => {
  if (prev === Pitch.HA) {
    return invalidateIf(note !== Pitch.A, [Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  } else if (prev === Pitch.HG) {
    return invalidateIf(note !== Pitch.A, [Pitch.HA, Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  } else {
    return invalidateIf(note !== Pitch.A, [Pitch.HG, Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  }
});


function numberOfNotes(gracenote: GracenoteModel, thisNote: Pitch, previousNote: Pitch | null): number {
  // Find the number of notes in the gracenote

  const grace = notesOf(gracenote,thisNote,previousNote);
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

function notesOf(gracenote: GracenoteModel, thisNote: Pitch, previousNote: Pitch | null): Pitch[] | InvalidGracenote {
  // Find the notes of a gracenote as an array

  if (gracenote.type === 'single') {
    return [gracenote.note];
  } else if (gracenote.type === 'reactive') {
    const notes = gracenotes.get(gracenote.name);
    if (notes) {
      return notes(thisNote,previousNote);
    }
    return [];
  } else if (gracenote.type === 'none') {
    return [];
  } else {
    // never
    return gracenote;
  }
}

const isReactive = (g: GracenoteModel): g is ReactiveGracenote => g.type === 'reactive';

const init = (): GracenoteModel => ({
  type: 'none'
});

const initSingle = (note: Pitch): GracenoteModel => ({
  type: 'single',
  note
});

// Convert from name to gracenote
const from = (name: string | null): GracenoteModel =>
  (name === null)
    ? ({
      type: 'single',
      note: Pitch.HG
    })
    : (name === 'none') ? ({
      type: 'none'
    }) : ({
      type: 'reactive',
      name
    });

export default {
  init,
  initSingle,
  from,
  isReactive,
  notesOf,
  numberOfNotes,
  isInvalid
}
