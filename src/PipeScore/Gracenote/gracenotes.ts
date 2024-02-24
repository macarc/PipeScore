//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  The main export of this file is gracenotes: Map<string, GracenoteFn> -
//  this the set of all possible reactive gracenotes.

import { Pitch } from '../global/pitch';
export type GracenoteNoteList = Pitch[] & {
  invalid: boolean;
};

type GracenoteFn = (note: Pitch, prev: Pitch | null) => GracenoteNoteList;

// gracenotes is a map containing all the possible embellishments
// To get the notes of a reactive gracenote, do:
// gracenotes[reactiveGracenoteName](notePitch, previousNotePitch)
export const gracenotes: Map<string, GracenoteFn> = new Map();

export function noteList(list: Pitch[], valid = true): GracenoteNoteList {
  const noteList = list as GracenoteNoteList;
  noteList.invalid = !valid;
  return noteList;
}

const invalidateIf = (pred: boolean, gracenote: Pitch[]) =>
  noteList(gracenote, !pred);

// Where are monads when you need them
const invalidateIfBind = (
  prev: boolean,
  gracenote: GracenoteNoteList
): GracenoteNoteList => noteList(gracenote, !(prev || gracenote.invalid));

const invalid = (gracenote: Pitch[]) => noteList(gracenote, false);
const valid = (gracenote: Pitch[]) => noteList(gracenote, true);

gracenotes.set('throw-d', (note, prev) =>
  invalidateIf(
    note !== Pitch.D,
    prev === Pitch.G ? [Pitch.D, Pitch.C] : [Pitch.G, Pitch.D, Pitch.C]
  )
);

gracenotes.set('doubling', (note, prev) => {
  let pitches = [];
  if (note === Pitch.G || note === Pitch.A || note === Pitch.B || note === Pitch.C) {
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
  if (dbl) return invalidateIfBind(note === prev, dbl(note, Pitch.HA));
  return invalid([]);
});

gracenotes.set('g-strike', (note, prev) => {
  const setFirst = (pitches: Pitch[]) => {
    switch (prev) {
      case Pitch.HA:
        return valid(pitches);
      case Pitch.HG:
        return valid([Pitch.HA, ...pitches]);
      default:
        return valid([Pitch.HG, ...pitches]);
    }
  };
  switch (note) {
    case Pitch.G:
    case Pitch.HA:
      return invalid([Pitch.HG]);
    case Pitch.E:
      return setFirst([note, Pitch.A]);
    case Pitch.F:
      return setFirst([note, Pitch.E]);
    case Pitch.HG:
      return prev === Pitch.HA
        ? valid([note, Pitch.F])
        : valid([Pitch.HA, note, Pitch.F]);
    default:
      return setFirst([note, Pitch.G]);
  }
});

gracenotes.set('edre', (note, prev) => {
  if (prev === Pitch.G && (note === Pitch.E || note === Pitch.HG)) {
    return valid([Pitch.E, Pitch.G, Pitch.F, Pitch.G]);
  }
  if (prev === Pitch.F && note === Pitch.HG) {
    return valid([Pitch.E, Pitch.HG, Pitch.E, Pitch.F, Pitch.E]);
  }
  if (prev === Pitch.E && note === Pitch.HG) {
    return valid([Pitch.F, Pitch.E, Pitch.HG, Pitch.E, Pitch.F, Pitch.E]);
  }
  if (note === Pitch.E || note === Pitch.HG) {
    return valid([Pitch.E, Pitch.A, Pitch.F, Pitch.A]);
  }
  if (note === Pitch.F) {
    return valid([Pitch.F, Pitch.E, Pitch.HG, Pitch.E]);
  }
  if (prev === Pitch.G && note === Pitch.D) {
    return valid([Pitch.D, Pitch.G, Pitch.C]);
  }
  if (note === Pitch.D) {
    return valid([Pitch.G, Pitch.D, Pitch.G, Pitch.C]);
  }
  if (prev === Pitch.G && note === Pitch.B) {
    return valid([Pitch.D, Pitch.G, Pitch.C, Pitch.G]);
  }
  if (note === Pitch.B) {
    return valid([Pitch.G, Pitch.D, Pitch.G, Pitch.C, Pitch.G]);
  }
  return invalid([Pitch.E, Pitch.A, Pitch.F, Pitch.A]);
});

gracenotes.set('grip', (note, prev) => {
  return note === Pitch.D || prev === Pitch.D
    ? valid([Pitch.G, Pitch.B, Pitch.G])
    : valid([Pitch.G, Pitch.D, Pitch.G]);
});

gracenotes.set('shake', (note, prev) => {
  let pitches: Pitch[];

  switch (note) {
    case Pitch.E:
      pitches = [Pitch.HG, note, Pitch.F, note, Pitch.A];
      break;
    // I'm not sure these are even gracenotes
    case Pitch.G:
      pitches = [Pitch.HG, note, Pitch.D, note, Pitch.E];
      break;
    case Pitch.F:
      pitches = [Pitch.HG, note, Pitch.HG, note, Pitch.E];
      break;
    case Pitch.HG:
      pitches = [Pitch.HA, note, Pitch.HA, note, Pitch.F];
      break;
    case Pitch.HA:
      pitches = [Pitch.HA, Pitch.HG];
      break;
    default:
      pitches = [Pitch.HG, note, Pitch.E, note, Pitch.G];
  }

  if (prev === Pitch.HA) {
    pitches.shift();
  } else if (prev === Pitch.HG) {
    pitches[0] = Pitch.HA;
  }

  return valid(pitches);
});

gracenotes.set('c-shake', (note, prev) => {
  const pitches = [Pitch.HG, note, Pitch.E, note, Pitch.C];
  if (prev === Pitch.HA) {
    pitches.shift();
  } else if (prev === Pitch.HG) {
    pitches[0] = Pitch.HA;
  }
  return invalidateIf(note !== Pitch.D, pitches);
});

gracenotes.set('taorluath', (note, prev) => {
  const pitches =
    prev === Pitch.D
      ? [Pitch.G, Pitch.B, Pitch.G, Pitch.E]
      : [Pitch.G, Pitch.D, Pitch.G, Pitch.E];

  if (
    note === Pitch.E ||
    note === Pitch.F ||
    note === Pitch.HG ||
    note === Pitch.HA
  ) {
    return valid(pitches.slice(0, 3));
  }
  return valid(pitches);
});

gracenotes.set('crunluath', (note, prev) => {
  let pitches: Pitch[];
  switch (prev) {
    case null:
      return invalid([
        Pitch.G,
        Pitch.D,
        Pitch.G,
        Pitch.E,
        Pitch.A,
        Pitch.F,
        Pitch.A,
      ]);
    case Pitch.D:
      pitches = [Pitch.G, Pitch.B, Pitch.G, Pitch.E, Pitch.A, Pitch.F, Pitch.A];
      break;
    case Pitch.G:
      pitches = [Pitch.D, Pitch.A, Pitch.E, Pitch.A, Pitch.F, Pitch.A];
      break;
    default:
      pitches = [Pitch.G, Pitch.D, Pitch.G, Pitch.E, Pitch.A, Pitch.F, Pitch.A];
      break;
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
  switch (prev) {
    case Pitch.HA:
      return invalidateIf(note !== Pitch.A, [Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
    case Pitch.HG:
      return invalidateIf(note !== Pitch.A, [
        Pitch.HA,
        Pitch.A,
        Pitch.G,
        Pitch.A,
        Pitch.G,
      ]);
    default:
      return invalidateIf(note !== Pitch.A, [
        Pitch.HG,
        Pitch.A,
        Pitch.G,
        Pitch.A,
        Pitch.G,
      ]);
  }
});

gracenotes.set('bubbly', (note, prev) => {
  if (note === Pitch.D) {
    return valid(
      prev === Pitch.G
        ? [Pitch.D, Pitch.G, Pitch.C]
        : [Pitch.G, Pitch.D, Pitch.G, Pitch.C]
    );
  }
  return invalidateIf(
    note !== Pitch.B,
    prev === Pitch.G
      ? [Pitch.D, Pitch.G, Pitch.C, Pitch.G]
      : [Pitch.G, Pitch.D, Pitch.G, Pitch.C, Pitch.G]
  );
});
