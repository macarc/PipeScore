/*
  This just has some useful things each of which are too small to have their own module,
  but don't really fit anywhere else.
*/


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
  HA = 'HA', HG = 'HG', F = 'F', E = 'E', D = 'D', C = 'C', B = 'B', A = 'A', G = 'G'
}
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

export function flatten(array: any[]): any[] {
  return [].concat.apply([], array);
}

export function noteBoxes(x: number,y: number,width: number, mouseOver: (pitch: Pitch) => void = () => null, mouseDown: (pitch: Pitch) => void = () => null): Svg {
  // Invisible rectangles that are used to detect note dragging
  const height = lineGap / 2;

  const pitches = [Pitch.G,Pitch.A,Pitch.B,Pitch.C,Pitch.D,Pitch.E,Pitch.F,Pitch.HG,Pitch.HA];

  return svg`<g class="drag-boxes">
    <rect x=${x} y=${y - 4 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseOver(Pitch.HA)} onmousedown=${() => mouseDown(Pitch.HA)} opacity="0" />
    <rect x=${x} y=${y + 3 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseOver(Pitch.G)} onmousedown=${() => mouseDown(Pitch.G)} opacity="0" />

    ${pitches.map(n => <[Pitch,number]>[n,pitchToHeight(n)]).map(([note,boxY]) => 
      svg`<rect
        x=${x}
        y=${y + lineGap * boxY - lineGap / 2}
        width=${width}
        height=${height}
        onmouseover=${() => mouseOver(note)}
        onmousedown=${() => mouseDown(note)}
        opacity="0"
        />`)}
  </g>`
};
