/*
   Copyright (C) 2021 Archie Maclean
 */
import { TimeSignatureModel, Denominator } from './model';

import { deepcopy } from '../global/utils';

export const timeSignatureWidth = 30;

function numberOfBeats(ts: TimeSignatureModel): number {
  // The number of beats per bar
  switch (ts.ts) {
    case 'cut time':
      return 2;
    default:
      switch (bottom(ts)) {
        case 2:
          return 2;
        case 4:
          return top(ts);
        case 8:
          return Math.ceil(top(ts) / 3);
      }
  }
}

function beatDivision(ts: TimeSignatureModel): (i: number) => number {
  // The number of beats in a group

  return (i: number) => {
    if (i < ts.breaks.length) {
      return ts.breaks[i] / 2.0;
    }
    switch (ts.ts) {
      case 'cut time':
        return 2;
      default:
        switch (bottom(ts)) {
          case 2:
            return 2;
          case 4:
            return 1;
          case 8:
            return 1.5;
        }
      }
  }
}

function parseDenominator(text: string): Denominator | null {
  // Turns a string into a Denominator

  switch (text) {
    case '2': return 2;
    case '4': return 4;
    case '8': return 8;
    default: return null;
  }
}

function equal(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  // Check if two time signatures are equal

  return top(ts0) === top(ts1) && bottom(ts0) === bottom(ts1);
}

const top = (ts: TimeSignatureModel): number => {
  const t = ts.ts;
  return (t === 'cut time') ? 2 : t[0];
}
const bottom = (ts: TimeSignatureModel): Denominator => {
  const t = ts.ts;
  return (t === 'cut time') ? 2 : t[1];
}

const init = (): TimeSignatureModel => ({
  ts: [2,4],
  breaks: []
});

// This is needed because TypeScript tends to assume that
// [1 :: number, 3 :: Denominator] is (number | Denominator)[] rather than [number, Denominator]
const from = (ts: [number, Denominator] | 'cut time'): TimeSignatureModel => ({
  ts,
  breaks: []
});

const copy = (ts: TimeSignatureModel): TimeSignatureModel => deepcopy(ts);

export default {
  init,
  from,
  copy,
  top,
  bottom,
  numberOfBeats,
  beatDivision,
  parseDenominator,
  equal
}
