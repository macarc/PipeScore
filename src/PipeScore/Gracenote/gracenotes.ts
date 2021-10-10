/*
  All the gracenotes (reactive embellishments) possible with PipeScore
  Copyright (C) 2021 Archie Maclean
 */
import { Pitch, pitchUp } from '../global/pitch';
import { MaybeGracenote } from '.';
import { GracenoteSelection } from '../Selection';

type GracenoteFn = (note: Pitch, prev: Pitch | null) => MaybeGracenote;

const invalidateIf = (pred: boolean, gracenote: Pitch[]): MaybeGracenote =>
  new MaybeGracenote(gracenote, !pred);

// Where are monads when you need them
const invalidateIfBind = (
  prev: boolean,
  gracenote: MaybeGracenote
): MaybeGracenote =>
  new MaybeGracenote(gracenote.notes(), !(prev || !gracenote.isValid()));

const invalid = (gracenote: Pitch[]) => new MaybeGracenote(gracenote, false);
const valid = (gracenote: Pitch[]) => new MaybeGracenote(gracenote, true);

// gracenotes is a map containing all the possible embellishments in the form of functions
// To get the notes of an embellishment, first get the gracenote type you want, e.g. gracenote["doubling"]
// Then call the resulting function with two arguments: pitch of the note it is on, and pitch of previous note (or null)
export const gracenotes: Map<string, GracenoteFn> = new Map();

gracenotes.set('throw-d', (note) =>
  invalidateIf(note !== Pitch.D, [Pitch.G, Pitch.D, Pitch.C])
);
gracenotes.set('doubling', (note, prev) => {
  let pitches = [];
  if (
    note === Pitch.G ||
    note === Pitch.A ||
    note === Pitch.B ||
    note === Pitch.C
  ) {
    pitches = [Pitch.HG, note, Pitch.D];
  } else if (note === Pitch.D) {
    pitches = [Pitch.HG, note, Pitch.E];
  } else if (note === Pitch.E) {
    pitches = [Pitch.HG, note, Pitch.F];
  } else if (note === Pitch.F) {
    pitches = [Pitch.HG, note, Pitch.HG];
  } else if (note === Pitch.HG) {
    // [HA, note, HA] or [HG,F] ?
    pitches = [Pitch.HA, note, Pitch.HA];
  } else if (note === Pitch.HA) {
    pitches = [Pitch.HA, Pitch.HG];
  } else {
    return valid([]);
  }

  if (prev === Pitch.HG && note !== Pitch.HA && note !== Pitch.HG) {
    pitches[0] = Pitch.HA;
  } else if (prev === Pitch.HA) {
    pitches = pitches.splice(1);

    if (note === Pitch.HG) pitches = [Pitch.HG, Pitch.F];
  }

  return valid(pitches);
});
gracenotes.set('half-doubling', (note, prev) => {
  if (note === Pitch.HA) return invalid([Pitch.HG]);

  const dbl = gracenotes.get('doubling');
  if (dbl) return invalidateIfBind(note == prev, dbl(note, Pitch.HA));
  else return invalid([]);
});

gracenotes.set('g-strike', (note, prev) => {
  const setFirst = (pitches: Pitch[]) => {
    if (prev === Pitch.HA) {
      return valid(pitches);
    } else if (prev === Pitch.HG) {
      return valid([Pitch.HA, ...pitches]);
    } else {
      return valid([Pitch.HG, ...pitches]);
    }
  };
  if (note === Pitch.G || note === Pitch.HA) {
    return invalid([Pitch.HG]);
  } else if (note === Pitch.E) {
    return setFirst([note, Pitch.A]);
  } else if (note === Pitch.F) {
    return setFirst([note, Pitch.E]);
  } else if (note === Pitch.HG) {
    if (prev === Pitch.HA) {
      return valid([note, Pitch.F]);
    } else {
      return valid([Pitch.HA, note, Pitch.F]);
    }
  } else {
    return setFirst([note, Pitch.G]);
  }
});

gracenotes.set('edre', (note, prev) => {
  if (prev === Pitch.G && (note === Pitch.E || note === Pitch.HG)) {
    return valid([Pitch.E, Pitch.G, Pitch.F, Pitch.G]);
  } else if (prev === Pitch.F && note === Pitch.HG) {
    return valid([Pitch.E, Pitch.HG, Pitch.E, Pitch.F, Pitch.E]);
  } else if (prev === Pitch.E && note === Pitch.HG) {
    return valid([Pitch.F, Pitch.E, Pitch.HG, Pitch.E, Pitch.F, Pitch.E]);
  } else if (note === Pitch.E || note === Pitch.HG) {
    return valid([Pitch.E, Pitch.A, Pitch.F, Pitch.A]);
  } else if (note === Pitch.F) {
    return valid([Pitch.F, Pitch.E, Pitch.HG, Pitch.E]);
  } else if (prev === Pitch.G && note === Pitch.B) {
    return valid([Pitch.D, Pitch.G, Pitch.C, Pitch.G]);
  } else if (note === Pitch.B) {
    return valid([Pitch.G, Pitch.D, Pitch.G, Pitch.C, Pitch.G]);
  } else {
    return invalid([Pitch.E, Pitch.A, Pitch.F, Pitch.A]);
  }
});
gracenotes.set('grip', (note) => {
  if (note === Pitch.D) {
    return valid([Pitch.G, Pitch.B, Pitch.G]);
  } else {
    return valid([Pitch.G, Pitch.D, Pitch.G]);
  }
});
gracenotes.set('shake', (note, prev) => {
  let pitches = [];
  pitches = [Pitch.HG, note, Pitch.E, note, Pitch.G];

  if (note === Pitch.E) {
    pitches = [Pitch.HG, note, Pitch.F, note, Pitch.A];
  }
  // I'm not sure these are even gracenotes
  else if (note === Pitch.G) {
    pitches = [Pitch.HG, note, Pitch.D, note, Pitch.E];
  } else if (note === Pitch.F) {
    pitches = [Pitch.HG, note, Pitch.HG, note, Pitch.E];
  } else if (note === Pitch.HG) {
    pitches = [Pitch.HA, note, Pitch.HA, note, Pitch.F];
  } else if (note === Pitch.HA) {
    pitches = [Pitch.HA, Pitch.HG];
  } else {
    pitches = [Pitch.HG, note, Pitch.E, note, Pitch.G];
  }

  if (prev === Pitch.HA) {
    pitches.shift();
  } else if (prev === Pitch.HG) {
    pitches[0] = Pitch.HA;
  }

  return valid(pitches);
});
gracenotes.set('toarluath', (note, prev) => {
  let pitches = [];
  if (prev === Pitch.D) {
    pitches = [Pitch.G, Pitch.B, Pitch.G, Pitch.E];
  } else {
    pitches = [Pitch.G, Pitch.D, Pitch.G, Pitch.E];
  }
  if (
    note === Pitch.E ||
    note === Pitch.F ||
    note === Pitch.HG ||
    note === Pitch.HA
  ) {
    pitches = pitches.slice(0, 3);
  }
  return valid(pitches);
});
gracenotes.set('crunluath', (note, prev) => {
  let pitches = [];
  if (!prev) {
    return invalid([
      Pitch.G,
      Pitch.D,
      Pitch.G,
      Pitch.E,
      Pitch.A,
      Pitch.F,
      Pitch.A,
    ]);
  }
  if (prev === Pitch.D) {
    pitches = [Pitch.G, Pitch.B, Pitch.G, Pitch.E, Pitch.A, Pitch.F, Pitch.A];
  } else if (prev === Pitch.G) {
    pitches = [Pitch.D, Pitch.A, Pitch.E, Pitch.A, Pitch.F, Pitch.A];
  } else {
    pitches = [Pitch.G, Pitch.D, Pitch.G, Pitch.E, Pitch.A, Pitch.F, Pitch.A];
  }
  return invalidateIf(note !== Pitch.E, pitches);
});
gracenotes.set('birl', (note, prev) => {
  return invalidateIf(
    note !== Pitch.A,
    prev === Pitch.A
      ? [Pitch.G, Pitch.A, Pitch.G]
      : [Pitch.A, Pitch.G, Pitch.A, Pitch.G]
  );
});
gracenotes.set('g-gracenote-birl', (note, prev) => {
  if (prev === Pitch.HA) {
    return invalidateIf(note !== Pitch.A, [Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  } else if (prev === Pitch.HG) {
    return invalidateIf(note !== Pitch.A, [
      Pitch.HA,
      Pitch.A,
      Pitch.G,
      Pitch.A,
      Pitch.G,
    ]);
  } else {
    return invalidateIf(note !== Pitch.A, [
      Pitch.HG,
      Pitch.A,
      Pitch.G,
      Pitch.A,
      Pitch.G,
    ]);
  }
});
