import { GracenoteModel, Gracenote, InvalidGracenote } from './model';
import { Pitch } from '../all';

export function isInvalid(gracenote: Gracenote | InvalidGracenote): gracenote is InvalidGracenote {
  return (gracenote as InvalidGracenote).gracenote != null;
}
type GracenoteFn = (note: Pitch, prev: Pitch | null) => Gracenote | InvalidGracenote;

const invalidateIf = (pred: boolean, gracenote: Gracenote): Gracenote | InvalidGracenote => pred ? ({ gracenote }) : gracenote;

export const gracenotes: Map<string, GracenoteFn> = new Map();

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
gracenotes.set('grip', note => {
  if (note === Pitch.D) {
    return [Pitch.G, Pitch.B, Pitch.G];
  } else {
    return [Pitch.G, Pitch.D, Pitch.G];
  }
})
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


export function numberOfNotes(gracenote: GracenoteModel, thisNote: Pitch, previousNote: Pitch | null): number {
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

export function notesOf(gracenote: GracenoteModel, thisNote: Pitch, previousNote: Pitch | null): Pitch[] | InvalidGracenote {
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

export const init = (): GracenoteModel => ({
  type: 'none',
});

export default {
  init,
  notesOf,
  numberOfNotes
}
