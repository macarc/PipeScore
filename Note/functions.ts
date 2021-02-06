import { Pitch, genId, flatten } from '../all';

import { GroupNoteModel, NoteModel, NoteLength } from './model';

import Gracenote from '../Gracenote/functions';

const lastNoteOfGroupNote = (groupNote: GroupNoteModel): Pitch | null => (groupNote.notes.length === 0) ? null : groupNote.notes[groupNote.notes.length - 1].pitch;

function unGroupNotes(notes: GroupNoteModel[]): NoteModel[] {
  return flatten(notes.map(note => note.notes));
}

function groupNotes(notes: NoteModel[], lengthOfGroup: number): GroupNoteModel[] {
  const pushNote = (group: GroupNoteModel, note: NoteModel, length: number): number => {
    // add a note to the end - also merges notes if it can and they are tied
    const push = (noteToPush: NoteModel) => {
      if (hasBeam(noteToPush)) {
        group.notes.push(noteToPush);
      } else {
        // Push the note as its own group. This won't modify the currentLength,
        // which means that other groupings will still be correct
        if (group.notes.length > 0) groupedNotes.push({ ...group });
        group.notes = [noteToPush];
        groupedNotes.push({ ...group });
        group.notes = [];
      }
    };
    if (note.tied && previousLength !== 0) {
      const newLength = length + previousLength;
      const newNoteLength = numberToNoteLength(newLength);
      if (newNoteLength === null) {
        push(note);
        return length;
      } else {
        group.notes[group.notes.length - 1].length = newNoteLength;
        return newLength;
      }
    } else {
      push(note);
      return length;
    }
  };
  let currentGroup: GroupNoteModel = { notes: [] };
  const groupedNotes: GroupNoteModel[] = [];
  let currentLength = 0;
  let previousLength = 0;
  notes.forEach(note => {
    const length = lengthToNumber(note.length);
    if (currentLength + length < lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length);
      currentLength += length;
    } else if (currentLength + length === lengthOfGroup) {
      previousLength = pushNote(currentGroup, note, length);
      // this check is needed since pushNote could end up setting currentGroup to have no notes in it
      if (currentGroup.notes.length > 0) groupedNotes.push(currentGroup);
      currentLength = 0;
      currentGroup = { notes: [] };
      previousLength = 0;
    } else {
      groupedNotes.push(currentGroup);
      currentGroup = { notes: [] };
      previousLength = pushNote(currentGroup, note, length);
      currentLength = length;
      if (currentLength >= lengthOfGroup) {
        groupedNotes.push(currentGroup);
        currentGroup = { notes: [] };
        currentLength = 0;
        previousLength = 0;
      }
    }
  });
  // pushes the last notes to the groupedNotes
  // this also ensures that the length will never be 0, even if there are 0 notes
  groupedNotes.push(currentGroup);
  return groupedNotes;
}


// Note Length

function hasStem(note: NoteModel): boolean {
  return note.length !== NoteLength.Semibreve;
}

function hasDot(note: NoteLength): boolean {
  return ([NoteLength.DottedMinim, NoteLength.DottedCrotchet, NoteLength.DottedQuaver, NoteLength.DottedSemiQuaver, NoteLength.DottedDemiSemiQuaver, NoteLength.DottedHemiDemiSemiQuaver].includes(note));
}

function hasBeam(note: NoteModel): boolean {
  return lengthToNumber(note.length) < 1;
}

function isFilled(note: NoteModel): boolean {
  return lengthToNumber(note.length) < 2;
}

function equalOrDotted(a: NoteLength, b: NoteLength): boolean {
  if (a === b)
    return true;

  let conv;

  switch (a) {
    case NoteLength.Semibreve: conv = NoteLength.Semibreve; break;
    case NoteLength.DottedMinim: conv = NoteLength.Minim; break;
    case NoteLength.Minim: conv = NoteLength.DottedMinim; break;
    case NoteLength.DottedCrotchet: conv = NoteLength.Crotchet; break;
    case NoteLength.Crotchet: conv = NoteLength.DottedCrotchet; break;
    case NoteLength.DottedQuaver: conv = NoteLength.Quaver; break;
    case NoteLength.Quaver: conv = NoteLength.DottedQuaver; break;
    case NoteLength.DottedSemiQuaver: conv = NoteLength.SemiQuaver; break;
    case NoteLength.SemiQuaver: conv = NoteLength.DottedSemiQuaver; break;
    case NoteLength.DottedDemiSemiQuaver: conv = NoteLength.DemiSemiQuaver; break;
    case NoteLength.DemiSemiQuaver: conv = NoteLength.DottedDemiSemiQuaver; break;
    case NoteLength.DottedHemiDemiSemiQuaver: conv = NoteLength.HemiDemiSemiQuaver; break;
    case NoteLength.HemiDemiSemiQuaver: conv = NoteLength.DottedHemiDemiSemiQuaver; break;
  }
  return b === conv;
}

function lengthToNumber(length: NoteLength): number {
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

function lengthToNumTails(length: NoteLength): number {
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

function toggleDot(length: NoteLength): NoteLength {
  switch(length) {
    case NoteLength.Semibreve: return NoteLength.Semibreve;
    case NoteLength.DottedMinim: return NoteLength.Minim;
    case NoteLength.Minim: return NoteLength.DottedMinim;
    case NoteLength.DottedCrotchet: return NoteLength.Crotchet;
    case NoteLength.Crotchet: return NoteLength.DottedCrotchet;
    case NoteLength.DottedQuaver: return NoteLength.Quaver;
    case NoteLength.Quaver: return NoteLength.DottedQuaver;
    case NoteLength.DottedSemiQuaver: return NoteLength.SemiQuaver;
    case NoteLength.SemiQuaver: return NoteLength.DottedSemiQuaver;
    case NoteLength.DottedDemiSemiQuaver: return NoteLength.DemiSemiQuaver;
    case NoteLength.DemiSemiQuaver: return NoteLength.DottedDemiSemiQuaver;
    case NoteLength.DottedHemiDemiSemiQuaver: return NoteLength.HemiDemiSemiQuaver;
    case NoteLength.HemiDemiSemiQuaver: return NoteLength.DottedHemiDemiSemiQuaver;
  }
}

const numberOfNotes = (note: GroupNoteModel): number => note.notes.length;

const initNote = (pitch: Pitch, length: NoteLength, tied = false): NoteModel => ({
  pitch,
  length,
  gracenote: Gracenote.init(),
  tied,
  id: genId()
});

const initGroupNote = (): GroupNoteModel => ({
	notes: [ ]
});

export default {
  initNote,
  init: initGroupNote,
  numberOfNotes,
  unGroupNotes,
  groupNotes,
  lastNoteOfGroupNote,
  lengthToNumTails,
  hasStem,
  hasDot,
  hasBeam,
  isFilled,
  toggleDot,
  equalOrDotted
}
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

*/

