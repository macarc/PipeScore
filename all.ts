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

export const enum Pitch {
  HA, HG, F, E, D, C, B, A, G
}
export type RestOrPitch = Pitch | 'rest';

export function pitchToHeight(pitch: Pitch): number {
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
// Return the difference from the top of the stave
// to the note
export const noteOffset = (note: Pitch) => lineHeightOf(pitchToHeight(note));

// return the y value of given note
export const noteY = (staveY: number, note: Pitch) => staveY + noteOffset(note);


export type Svg = Hole;
export type Html = Hole;
