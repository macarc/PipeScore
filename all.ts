import { render, html, svg, Hole } from 'uhtml';
export const log = (a: any) => {
  console.log(a);
  return a;
}
export const log2 = (a: any,b: any) => {
  console.log(a);
  return b;
}
export const logf = (a: any) => {
  console.log(a());
  return a;
}

export const unlog = (a: any) => a;
export const unlogf = (a: any) => a;
export const unlog2 = (a: any,b: any) => b;

export const lineGap = 7;
export const lineHeightOf = (n: number) => n * lineGap;
export const gracenoteToNoteWidthRatio = 0.4;

export const enum Pitch {
  HA, HG, F, E, D, C, B, A, G
}
export type RestOrPitch = Pitch | 'rest';

export const pitchToHeight = (pitch: Pitch) => {
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
export const noteOffset = (note: Pitch) => {
  // Return the difference from the top of the stave
  // to the note
  return lineHeightOf(pitchToHeight(note));
}

export const noteY = (staveY: number, note: Pitch) => {
  // return the y value of given note
  return staveY + noteOffset(note);
}


export type Svg = Hole;
export type Html = Hole;
