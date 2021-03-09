/*
   Copyright (C) 2021 Archie Maclean
 */
import { lineHeightOf } from './constants';

export const enum Pitch {
  HA = 'HA', HG = 'HG', F = 'F', E = 'E', D = 'D', C = 'C', B = 'B', A = 'A', G = 'G'
}
export function pitchToHeight(pitch: Pitch): number {
  // Finds the height of the pitch from the top of the stave, in lines

  switch (pitch) {
    case Pitch.HA: return -1;
    case Pitch.HG: return -0.5;
    case Pitch.F: return 0;
    case Pitch.E: return 0.5;
    case Pitch.D: return 1;
    case Pitch.C: return 1.5;
    case Pitch.B: return 2;
    case Pitch.A: return 2.5;
    case Pitch.G: return 3;
  }
}

// Calculate the difference from the top of the stave
// to the note
export const noteOffset = (note: Pitch): number => lineHeightOf(pitchToHeight(note));

// Calculates the y value of given note
export const noteY = (staveY: number, note: Pitch): number => staveY + noteOffset(note);
