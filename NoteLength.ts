export const enum NoteLength {
  Semibreve = 'sb',
  DottedMinim = 'dm', Minim = 'm',
  DottedCrotchet = 'dc', Crotchet = 'c',
  DottedQuaver = 'dq', Quaver = 'q',
  DottedSemiQuaver = 'dsq', SemiQuaver = 'sq',
  DottedDemiSemiQuaver = 'dssq', DemiSemiQuaver = 'ssq',
  DottedHemiDemiSemiQuaver = 'dhdsq', HemiDemiSemiQuaver = 'hdsq'
}

const noteLengths = [
  NoteLength.Semibreve,
  NoteLength.DottedMinim,
  NoteLength.Minim,
  NoteLength.DottedCrotchet,
  NoteLength.Crotchet,
  NoteLength.DottedQuaver,
  NoteLength.Quaver,
  NoteLength.DottedSemiQuaver,
  NoteLength.SemiQuaver,
  NoteLength.DottedDemiSemiQuaver,
  NoteLength.DemiSemiQuaver,
  NoteLength.DottedHemiDemiSemiQuaver,
  NoteLength.HemiDemiSemiQuaver
];

export function hasStem(length: NoteLength): boolean {
  return length !== NoteLength.Semibreve;
}

export function hasDot(length: NoteLength): boolean {
  return ([NoteLength.DottedMinim, NoteLength.DottedCrotchet, NoteLength.DottedQuaver, NoteLength.DottedSemiQuaver, NoteLength.DottedDemiSemiQuaver, NoteLength.DottedHemiDemiSemiQuaver].includes(length));
}

export function isFilled(length: NoteLength): boolean {
  return noteLengthToNumber(length) < 2;
}

export function noteLengthToNumber(length: NoteLength): number {
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

export function splitLengthNumber(longLength: number, splitInto: number): number[] {
  if (splitInto >= longLength) {
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


export function mergeLengths(initialLengths: NoteLength[]): NoteLength[] {
  let totalLength = initialLengths.reduce((a, b) => a + noteLengthToNumber(b), 0);
  const lengths = [];
  for (const noteLength of noteLengths) {
    const length = noteLengthToNumber(noteLength);
    if (length === totalLength) {
      lengths.push(noteLength);
      break;
    } else if (length > totalLength) {
      continue;
    } else {
      while (length < totalLength) {
        lengths.push(noteLength);
        totalLength -= length;
      }
    }
  }
  return lengths;
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

// Old version of groupNotes in Note.ts
export function groupNoteLengths(lengths: NoteLength[], lengthOfGroup: number): NoteLength[][] {
  const groupedLengths = [];
  let currentGroup: NoteLength[] = [], currentLength = 0;
  for (let i=0; i < lengths.length; i++) {
    const length = noteLengthToNumber(lengths[i]);
    if (currentLength + length < lengthOfGroup) {
      currentGroup.push(lengths[i]);
      currentLength += length;
    } else if (currentLength + length === lengthOfGroup) {
      currentGroup.push(lengths[i]);
      groupedLengths.push(currentGroup.slice());
      currentLength = 0;
      currentGroup = [];
    } else {
      // currentLength + length > lengthOfGroup
      console.log(length, lengthOfGroup - currentLength);
      const splitLengths = splitLengthNumber(length, lengthOfGroup - currentLength);
      const splitNoteLengths = splitLengths.map(numberToNoteLength);
      currentGroup.push(splitNoteLengths[0]);
      groupedLengths.push(currentGroup.slice());

      // TODO - check if it goes over another group
      currentLength = splitLengths.slice(1).reduce((a,b) => a + b);
      currentGroup = splitNoteLengths.slice(1);
    }
  }
  return groupedLengths;
}


