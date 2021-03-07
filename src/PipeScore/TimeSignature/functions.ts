/*
   Copyright (C) 2020 Archie Maclean
 */
import { TimeSignatureModel, Denominator } from './model';

export const timeSignatureWidth = 30;

function numberOfBeats(ts: TimeSignatureModel): number {
  // The number of beats per bar

  switch (ts[1]) {
    case 4:
      return ts[0];
    case 8:
      return Math.ceil(ts[0] / 3);
  }
}

function beatDivision(ts: TimeSignatureModel): number {
  // The number of beats in a group

  switch (ts[1]) {
    case 4:
      return 1;
    case 8:
      return 1.5;
  }
}

function parseDenominator(text: string): Denominator | null {
  // Turns a string into a Denominator

  switch (text) {
    case '4': return 4;
    case '8': return 8;
    default: return null;
  }
}

function equal(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  // Check if two time signatures are equal

  return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}

const init = (): TimeSignatureModel => [2,4];

// This is needed because TypeScript tends to assume that
// [1 :: number, 3 :: Denominator] is (number | Denominator)[] rather than [number, Denominator]
const from = (a: [number, Denominator]): TimeSignatureModel => a;

export default {
  init,
  from,
  numberOfBeats,
  beatDivision,
  parseDenominator,
  equal
}
