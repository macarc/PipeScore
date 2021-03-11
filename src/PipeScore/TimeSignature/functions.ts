/*
   Copyright (C) 2021 Archie Maclean
 */
import { TimeSignatureModel, Denominator } from './model';

import dialogueBox from '../global/dialogueBox';

export const timeSignatureWidth = 30;

function numberOfBeats(ts: TimeSignatureModel): number {
  // The number of beats per bar
  switch (ts) {
    case 'cut time':
      return 2;
    default:
      switch (ts[1]) {
        case 4:
          return ts[0];
        case 8:
          return Math.ceil(ts[0] / 3);
      }
  }
}

function beatDivision(ts: TimeSignatureModel): number {
  // The number of beats in a group

  switch (ts) {
    case 'cut time':
      return 2;
    default:
      switch (ts[1]) {
        case 4:
          return 1;
        case 8:
          return 1.5;
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

  return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}

function edit(timeSignature: TimeSignatureModel): Promise<TimeSignatureModel> {
  // Makes a dialogue box for the user to edit the text, then updates the text

  const top = timeSignature === 'cut time' ? 2 : timeSignature[0];
  const bottom = timeSignature === 'cut time' ? 4 : timeSignature[1];
  const isCutTime = timeSignature === 'cut time';

  return new Promise((res, rej) => dialogueBox(`<input type="number" name="numerator" value="${top}" /><br /><input type="number" name="denominator" value="${bottom}" /><label>Cut time <input type="checkbox" ${isCutTime ? 'checked' : ''}/></label>`, form => {
    const numElement = form.querySelector('input[name = "numerator"]');
    const denomElement = form.querySelector('input[name = "denominator"]');
    const isCutTime = form.querySelector('input[type="checkbox"]');
    if (isCutTime && isCutTime instanceof HTMLInputElement && isCutTime.checked) {
      return 'cut time';
    } else if (numElement && denomElement && numElement instanceof HTMLInputElement && denomElement instanceof HTMLInputElement) {
      const num = parseInt(numElement.value);
      const denom = parseDenominator(denomElement.value);
      if (num && denom) return from([num,denom]);
    } else {
      return null;
    }
  }, timeSignature)
  .then(newTimeSignature => res(newTimeSignature || timeSignature)));
}

const init = (): TimeSignatureModel => [2,4];

// This is needed because TypeScript tends to assume that
// [1 :: number, 3 :: Denominator] is (number | Denominator)[] rather than [number, Denominator]
const from = (a: [number, Denominator]): TimeSignatureModel => a;

export default {
  init,
  from,
  edit,
  numberOfBeats,
  beatDivision,
  parseDenominator,
  equal
}
