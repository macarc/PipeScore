/*
   Copyright (C) 2021 Archie Maclean
 */
import { TimeSignatureModel, Denominator } from './model';

import dialogueBox from '../global/dialogueBox';
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
      return ts.breaks[i];
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
    case '4': return 4;
    case '8': return 8;
    default: return null;
  }
}

function equal(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  // Check if two time signatures are equal

  return top(ts0) === top(ts1) && bottom(ts0) === bottom(ts1);
}

function edit(timeSignature: TimeSignatureModel): Promise<TimeSignatureModel> {
  // Makes a dialogue box for the user to edit the text, then updates the text

  const isCutTime = timeSignature.ts === 'cut time';
  const oldTop = isCutTime ? 2 : top(timeSignature);
  const oldBottom = isCutTime ? 4 : bottom(timeSignature);

  return new Promise((res, _) => dialogueBox(`<input type="number" name="numerator" min="1" value="${oldTop}" /><br /><select name="denominator"><option value="4" name="denominator" ${(oldBottom === 4) ? 'selected' : ''}>4</option><option value="8" name="denominator" ${(oldBottom === 8) ? 'selected' : ''}>8</option></select><label>Cut time <input type="checkbox" ${isCutTime ? 'checked' : ''}/></label><label>Custom breaks (comma separated numbers): <input type="text" name="breaks" pattern="^((([1-9][0-9]*(\.[0-9+])?)(,[1-9][0-9]*(\.[0-9+])?)*)|())$" value="${timeSignature.breaks}" /></label>`, form => {
    const numElement = form.querySelector('input[name = "numerator"]');
    const denomElement = form.querySelector('select');
    const isCutTime = form.querySelector('input[type="checkbox"]');
    const breaksElement = form.querySelector('input[name="breaks"]');
    const breaks = (breaksElement && breaksElement instanceof HTMLInputElement) ?
      // map(parseInt) passes in the index as a radix :)
      // glad I new that already and didn't have to debug...
      breaksElement.value.split(',').map(i => parseInt(i))
    : timeSignature.breaks;
    if (isCutTime && isCutTime instanceof HTMLInputElement && isCutTime.checked) {
      return { ...from('cut time'), breaks };
    } else if (numElement && denomElement && numElement instanceof HTMLInputElement && denomElement instanceof HTMLSelectElement) {
      const num = parseInt(numElement.value);
      const denom = parseDenominator(denomElement.value);
      if (num && denom) return { ...from([num,denom]), breaks };
    } else {
      return null;
    }
  }, timeSignature)
  .then(newTimeSignature => res(newTimeSignature || timeSignature)));
}

const top = (ts: TimeSignatureModel) => {
  let t = ts.ts;
  return (t === 'cut time') ? 2 : t[0];
}
const bottom = (ts: TimeSignatureModel): Denominator => {
  let t = ts.ts;
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
  edit,
  numberOfBeats,
  beatDivision,
  parseDenominator,
  equal
}
