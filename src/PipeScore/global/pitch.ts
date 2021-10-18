/*
  Pitch type and methods
  Copyright (C) 2021 macarc
*/
import { settings } from './settings';

export const enum Pitch {
  HA = 'HA',
  HG = 'HG',
  F = 'F',
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  G = 'G',
}
export function pitchToHeight(pitch: Pitch): number {
  // Finds the height of the pitch from the top of the stave, in lines

  switch (pitch) {
    case Pitch.HA:
      return -1;
    case Pitch.HG:
      return -0.5;
    case Pitch.F:
      return 0;
    case Pitch.E:
      return 0.5;
    case Pitch.D:
      return 1;
    case Pitch.C:
      return 1.5;
    case Pitch.B:
      return 2;
    case Pitch.A:
      return 2.5;
    case Pitch.G:
      return 3;
  }
}

export function pitchUp(pitch: Pitch): Pitch {
  switch (pitch) {
    case Pitch.G:
      return Pitch.A;
    case Pitch.A:
      return Pitch.B;
    case Pitch.B:
      return Pitch.C;
    case Pitch.C:
      return Pitch.D;
    case Pitch.D:
      return Pitch.E;
    case Pitch.E:
      return Pitch.F;
    case Pitch.F:
      return Pitch.HG;
    case Pitch.HG:
      return Pitch.HA;
    case Pitch.HA:
      return Pitch.HA;
  }
}
export function pitchDown(pitch: Pitch): Pitch {
  switch (pitch) {
    case Pitch.G:
      return Pitch.G;
    case Pitch.A:
      return Pitch.G;
    case Pitch.B:
      return Pitch.A;
    case Pitch.C:
      return Pitch.B;
    case Pitch.D:
      return Pitch.C;
    case Pitch.E:
      return Pitch.D;
    case Pitch.F:
      return Pitch.E;
    case Pitch.HG:
      return Pitch.F;
    case Pitch.HA:
      return Pitch.HG;
  }
}

// Calculate the difference from the top of the stave
// to the note
export const pitchOffset = (note: Pitch): number =>
  settings.lineHeightOf(pitchToHeight(note));

// Calculates the y value of given note
export const noteY = (staveY: number, note: Pitch): number =>
  staveY + pitchOffset(note);
