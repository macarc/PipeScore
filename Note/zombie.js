/*
zombie code - currently unused, may be useful in future?

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

function splitLength(longLength: NoteLength, splitInto: NoteLength): NoteLength[] {
  return splitLengthNumber(lengthToNumber(longLength), lengthToNumber(splitInto))
    .map(numberToNoteLength)
    .filter(removeNull);
}


function mergeLengths(initialLengths: NoteLength[]): NoteLength[] {
  let totalLength = initialLengths.reduce((a, b) => a + lengthToNumber(b), 0);
  const lengths = [];
  for (const noteLength of noteLengths) {
    const length = lengthToNumber(noteLength);
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
function splitLengthNumber(longLength: number, splitInto: number): number[] {
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

function numberToNoteLength(length: number): NoteLength | null {
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
    default: return null;
  }
}

*/

