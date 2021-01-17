/*
  Note.ts - Note implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Pitch, Svg, noteOffset, lineHeightOf, noteY, noteBoxes, flatten, removeNull } from './all';
import { NoteLength, noteLengthToNumTails, hasStem, hasDot, isFilled, splitLength, mergeLengths, noteLengthToNumber, splitLengthNumber, numberToNoteLength } from './NoteLength';
import Gracenote, { GracenoteModel, GracenoteProps } from './Gracenote';
import { dispatch, isSelected, isBeingDragged } from './Controller';
import { NoteModel, NoteProps, noteHead, noteAndGracenoteWidth } from './NoteModel';
import Singleton, { SingletonModel, DisplaySingleton } from './Singleton';
import GroupNote, { GroupNoteModel, DisplayGroupNote } from './GroupNote';

import { log, unlog, log2, unlog2 } from './all';

// TODO remove this
export { NoteModel } from './NoteModel';
export { GroupNoteModel } from './GroupNote';



const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;
const noteHeadWidth = 5;

// todo this is basically manual dynamic dispatch. Make it automatic somehow?

export function numberOfNotes(note: AnyNoteModel): number {
  if (isGroupNote(note)) {
    return note.notes.length;
  } else if (isSingleton(note)) {
    return 1;
  } else {
    return note;
  }
}
// TODO break singleton definitions into their own module too
export function totalBeatWidth(note: AnyNoteModel,previousPitch: Pitch | null): number {
  if (isGroupNote(note)) {
    return GroupNote.totalBeatWidth(note, previousPitch);
  } else if (isSingleton(note)) {
    return Gracenote.numberOfNotes(note.gracenote, note.pitch, previousPitch) * gracenoteToNoteWidthRatio + 1;
  } else {
    return note;
  }
}

export function lastNoteOfGroupNote(note: AnyNoteModel): Pitch | null {
  if (isGroupNote(note)) {
    return GroupNote.lastNoteOfGroupNote(note);
  } else if (isSingleton(note)) {
    return note.pitch;
  } else {
    return note;
  }
}

export function lastNoteXOffset(beatWidth: number, note: AnyNoteModel, previousPitch: Pitch | null): number {
  if (isGroupNote(note)) {
    return GroupNote.lastNoteXOffset(beatWidth, note, previousPitch);
  } else if (isSingleton(note)) {
    return beatWidth * Gracenote.numberOfNotes(note.gracenote, note.pitch, previousPitch) * gracenoteToNoteWidthRatio;
  } else {
    return note;
  }
}


function render(display: DisplayNote): Svg {
  if (isDisplayNone(display)) {
    return svg`<g></g>`;
  } else if (isDisplaySingleton(display)) {
      return Singleton.render(display.display);
  } else if (isDisplayGroup(display)) {
    return GroupNote.render(display.display);
  } else {
    // never
    return display;
  }
};


interface SingletonDisplay {
  type: 'display singleton',
  display: DisplaySingleton
}
interface GroupDisplay {
  type: 'display group',
  display: DisplayGroupNote
}
interface DisplayNone {
  type: 'display none'
}

function isDisplaySingleton(note: DisplayNote): note is SingletonDisplay {
  return note.type === 'display singleton';
}
function isDisplayGroup(note: DisplayNote): note is GroupDisplay {
  return note.type === 'display group';
}
function isDisplayNone(note: DisplayNote): note is DisplayNone {
  return note.type === 'display none';
}

export type DisplayNote = SingletonDisplay | GroupDisplay | DisplayNone;

export type AnyNoteModel = GroupNoteModel | SingletonModel;

function isGroupNote(note: AnyNoteModel): note is GroupNoteModel {
  return (note as GroupNoteModel).notes != null;
}
function isSingleton(note: AnyNoteModel): note is SingletonModel {
  return (note as GroupNoteModel).notes == null;
}

function prerender(note: AnyNoteModel, props: NoteProps): DisplayNote {
  return ({
    type: 'display none'
  });
}

const init: () => AnyNoteModel = () => ({
	notes: [ ]
});

export default {
  prerender,
  render,
  init,
};
