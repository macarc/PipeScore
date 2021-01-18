/*
  Note.ts - Note implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from './all';
import Gracenote, { GracenoteModel, GracenoteProps } from './Gracenote';
import { NoteProps } from './NoteModel';
import Singleton, { SingletonModel, DisplaySingleton } from './Singleton';
import GroupNote, { GroupNoteModel, DisplayGroupNote } from './GroupNote';


/* MODEL */
const init: () => GroupNoteModel = () => ({
	notes: [ ]
});


/* CONSTANTS */
const gracenoteToNoteWidthRatio = 0.6;
const tailGap = 5;
const shortTailLength = 10;
const noteHeadWidth = 5;

/* FUNCTIONS */
export function numberOfNotes(note: GroupNoteModel): number {
  return note.notes.length;
}

/* PRERENDER */
function prerender(note: GroupNoteModel, props: NoteProps): DisplayNote {
  if (note.notes.length === 0) {
    return {
      type: 'display none'
    }
  } else if (note.notes.length === 1) {
    return {
      type: 'display singleton',
      display: Singleton.prerender(note.notes[0], props)
    };
  } else {
    return {
      type: 'display group',
      display: GroupNote.prerender(note, props)
    };
  }
}

/* RENDER */
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



/* EXPORTS */
export default {
  prerender,
  render,
  init,
};
