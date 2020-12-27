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


export const enum NoteLength {
  Semibreve = 'sb',
  DottedMinim = 'dm', Minim = 'm',
  DottedCrotchet = 'dc', Crotchet = 'c',
  DottedQuaver = 'dq', Quaver = 'q',
  DottedSemiQuaver = 'dsq', SemiQuaver = 'sq',
  DottedDemiSemiQuaver = 'dssq', DemiSemiQuaver = 'ssq',
  DottedHemiDemiSemiQuaver = 'dhdsq', HemiDemiSemiQuaver = 'hdsq'
}

export function hasStem(length: NoteLength): boolean {
  return length !== NoteLength.Semibreve;
}

export function hasDot(length: NoteLength): boolean {
  return ([NoteLength.DottedMinim, NoteLength.DottedCrotchet, NoteLength.DottedQuaver, NoteLength.DottedSemiQuaver, NoteLength.DottedDemiSemiQuaver, NoteLength.DottedHemiDemiSemiQuaver].includes(length));
}

export function isFilled(length: NoteLength): boolean {
  return noteLengthToNumber(length) < 2;
}

function noteLengthToNumber(length: NoteLength): number {
  switch (length) {
    case NoteLength.Semibreve: return 4;
    case NoteLength.DottedMinim: return 3;
    case NoteLength.Minim: return 2;
    case NoteLength.DottedCrotchet: return 1.5;
    case NoteLength.Crotchet: return 1;
    case NoteLength.DottedQuaver: return 0.75;
    case NoteLength.Quaver: return 0.5;
    case NoteLength.DottedSemiQuaver: return 0.375;
    case NoteLength.SemiQuaver: return 0.25;
    case NoteLength.DottedDemiSemiQuaver: return 0.1875;
    case NoteLength.DemiSemiQuaver: return 0.125;
    case NoteLength.DottedHemiDemiSemiQuaver: return 0.9375;
    case NoteLength.HemiDemiSemiQuaver: return 0.0625
  }
}

export function numberToNoteLength(length: number): NoteLength {
  switch (length) {
    case 4: return NoteLength.Semibreve;
    case 3: return NoteLength.DottedMinim;
    case 2: return NoteLength.Minim;
    case 1.5: return NoteLength.DottedCrotchet;
    case 1: return NoteLength.Crotchet;
    case 0.75: return NoteLength.DottedQuaver;
    case 0.5: return NoteLength.Quaver;
    case 0.375: return NoteLength.DottedSemiQuaver;
    case 0.25: return NoteLength.SemiQuaver;
    case 0.1875: return NoteLength.DottedDemiSemiQuaver;
    case 0.125: return NoteLength.DemiSemiQuaver;
    case 0.9375: return NoteLength.DottedHemiDemiSemiQuaver;
    case 0.0625: return NoteLength.HemiDemiSemiQuaver;
    default: return NoteLength.Crotchet;
  }
}

function splitLengthNumber(longLength: number, splitInto: number): number[] {
  if (splitInto > longLength) {
    return [longLength];
  } else {
    const remainderLength = longLength - splitInto;
    if (remainderLength === 0) {
      return [splitInto];
    } else {
      const rest = splitLengthNumber(remainderLength, splitInto);
      rest.unshift(splitInto);
      return rest;
    }
  }
}

export function splitLength(longLength: NoteLength, splitInto: NoteLength): NoteLength[] {
  return splitLengthNumber(noteLengthToNumber(longLength), noteLengthToNumber(splitInto)).map(numberToNoteLength)
}

export function noteLengthToNumTails(length: NoteLength): number {
  switch (length) {
    case NoteLength.Semibreve:
    case NoteLength.DottedMinim:
    case NoteLength.Minim:
    case NoteLength.DottedCrotchet:
    case NoteLength.Crotchet:
      return 0
    case NoteLength.DottedQuaver:
    case NoteLength.Quaver:
      return 1;
    case NoteLength.DottedSemiQuaver:
    case NoteLength.SemiQuaver:
      return 2;
    case NoteLength.DottedDemiSemiQuaver:
    case NoteLength.DemiSemiQuaver:
      return 3;
    case NoteLength.DottedHemiDemiSemiQuaver:
    case NoteLength.HemiDemiSemiQuaver:
      return 4;
  }
}


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
