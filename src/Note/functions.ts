import { Pitch } from '../global/pitch';
import { genId, flatten } from '../global/utils';

import { NoteModel, NoteLength, TripletModel, BaseNote } from './model';

import Gracenote from '../Gracenote/functions';

//const lastNoteOfGroupNote = (groupNote: GroupNoteModel): Pitch | null => (groupNote.notes.length === 0) ? null : nmap(last(groupNote.notes), n => n.pitch);

function isTriplet(note: NoteModel | BaseNote | NoteModel[] | TripletModel): note is TripletModel {
  return (note as TripletModel).first !== undefined;
}

function isNoteModel(note: BaseNote): note is NoteModel {
  return (note as NoteModel).length !== undefined;
}

function tripletNoteModels(triplet: TripletModel): [NoteModel, NoteModel, NoteModel] {
  return [{ ...triplet.first, length: triplet.length, tied: false }, { ...triplet.second, length: triplet.length, tied: false }, { ...triplet.third, length: triplet.length, tied: false }];
}

function unGroupNotes(notes: NoteModel[][]): NoteModel[] {
  return flatten(notes);
}

function groupNotes(notes: (NoteModel | TripletModel)[], lengthOfGroup: number): (NoteModel[] | TripletModel)[] {
  // TODO this could probably be cleaned up further
  const pushNote = (group: NoteModel[], note: NoteModel): void => {
    if (hasBeam(note.length)) {
      group.push(note);
    } else {
      // Push the note as its own group. This won't modify the currentLength,
      // which means that other groupings will still be correct
      if (group.length > 0) groupedNotes.push(group.slice());
      group.splice(0, group.length, note);
      groupedNotes.push(group.slice());
      group.splice(0, group.length);
    }
  };
  let currentGroup: NoteModel[] = [];
  const groupedNotes: (NoteModel[] | TripletModel)[] = [];
  let currentLength = 0;
  notes.forEach(note => {
    if (isTriplet(note)) {
      if (currentGroup.length > 0) groupedNotes.push(currentGroup);
      groupedNotes.push(note);
      currentGroup = [];
      currentLength = 0;
    } else {
      const length = lengthToNumber(note.length);
      if (currentLength + length < lengthOfGroup) {
        pushNote(currentGroup, note);
        currentLength += length;
      } else if (currentLength + length === lengthOfGroup) {
        pushNote(currentGroup, note);
        // this check is needed since pushNote could end up setting currentGroup to have no notes in it
        if (currentGroup.length > 0) groupedNotes.push(currentGroup);
        currentLength = 0;
        currentGroup = [];
      } else {
        if (currentGroup.length > 0) groupedNotes.push(currentGroup);
        currentGroup = [];
        pushNote(currentGroup, note);
        currentLength = length;
        if (currentLength >= lengthOfGroup) {
          if (currentGroup.length > 0) groupedNotes.push(currentGroup);
          currentGroup = [];
          currentLength = 0;
        }
      }
    }
  });
  if (currentGroup.length > 0) groupedNotes.push(currentGroup);
  return groupedNotes;
}


// Note Length

function hasStem(note: NoteModel): boolean {
  return note.length !== NoteLength.Semibreve;
}

function hasDot(note: NoteLength): boolean {
  return ([NoteLength.DottedMinim, NoteLength.DottedCrotchet, NoteLength.DottedQuaver, NoteLength.DottedSemiQuaver, NoteLength.DottedDemiSemiQuaver, NoteLength.DottedHemiDemiSemiQuaver].includes(note));
}

function hasBeam(note: NoteLength): boolean {
  return lengthToNumber(note) < 1;
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

function copyNote(note: NoteModel | TripletModel): NoteModel | TripletModel {
  if (isTriplet(note)) {
    return {
      first: { ...note.first, id: genId() },
      second: { ...note.second, id: genId() },
      third: { ...note.third, id: genId() },
      id: genId(),
      length: note.length
    };
  } else {
    return { ...note, id: genId() };
  }
}

const lastNoteIn = (notes: NoteModel[] | TripletModel): BaseNote => isTriplet(notes) ? notes.third : notes[notes.length - 1];
const pitchOf = (note: NoteModel | TripletModel): Pitch => isTriplet(note) ? note.third.pitch : note.pitch;


const numberOfNotes = (notes: NoteModel[]): number => notes.length;

const init = (pitch: Pitch, length: NoteLength, tied = false): NoteModel => ({
  pitch,
  length,
  gracenote: Gracenote.init(),
  tied,
  id: genId()
});

const initBase = (pitch = Pitch.A): BaseNote => ({
  id: genId(),
  pitch,
  gracenote: Gracenote.init()
});

const initTriplet = (length = NoteLength.Quaver): TripletModel => ({
  id: genId(),
  first: initBase(),
  second: initBase(),
  third: initBase(),
  length
});

export default {
  init,
  initTriplet,
  isTriplet,
  isNoteModel,
  copyNote,
  tripletNoteModels,
  numberOfNotes,
  lastNoteIn,
  pitchOf,
  unGroupNotes,
  groupNotes,
  lengthToNumTails,
  hasStem,
  hasDot,
  hasBeam,
  isFilled,
  toggleDot,
  equalOrDotted
}
