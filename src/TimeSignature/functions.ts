import { TimeSignatureModel, Denominator } from './model';

export const timeSignatureWidth = 30;

function numberOfBeats(ts: TimeSignatureModel): number {
  switch (ts[1]) {
    case 4:
      return ts[0];
    case 8:
      return Math.ceil(ts[0] / 3);
  }
}

function beatDivision(ts: TimeSignatureModel): number {
  switch (ts[1]) {
    case 4:
      return 1;
    case 8:
      return 1.5;
  }
}

function parseDenominator(text: string): Denominator | null {
  switch (text) {
    case '4': return 4;
    case '8': return 8;
    default: return null;
  }
}

function equal(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}

const init = (): TimeSignatureModel => [2,4];

const from = (a: [number, Denominator]): TimeSignatureModel => a;

export default {
  init,
  from,
  numberOfBeats,
  beatDivision,
  parseDenominator,
  equal
}
