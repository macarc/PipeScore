/*
  Dispatches to Controller when key presses occur
  Copyright (C) 2021 Archie Maclean
 */
import { dispatch } from './Controller';
import { dialogueBoxIsOpen } from './global/dialogueBox';

import {
  setInputLength,
  stopInputtingNotes,
  copy,
  paste,
  tieSelectedNotes,
  moveNoteDown,
  moveNoteUp,
  toggleDot,
  moveLeft,
  moveRight,
  expandSelection,
  detractSelection,
} from './Controllers/Note';
import { undo, redo } from './Controllers/Misc';
import { deleteSelection } from './Controllers/Mouse';

import { NoteLength } from './Note/model';

export function keyHandler(e: KeyboardEvent): void {
  if (dialogueBoxIsOpen) return;

  switch (e.key) {
    case 'Escape':
      dispatch(stopInputtingNotes());
      break;
    case 'c':
      if (e.ctrlKey) dispatch(copy());
      break;
    case 'v':
      if (e.ctrlKey) dispatch(paste());
      break;
    case 'Backspace':
    case 'Delete':
      dispatch(deleteSelection());
      break;

    case 'ArrowRight':
      if (e.shiftKey) {
        dispatch(expandSelection());
      } else {
        dispatch(moveRight());
      }
      break;
    case 'ArrowLeft':
      if (e.shiftKey) {
        dispatch(detractSelection());
      } else {
        dispatch(moveLeft());
      }
      break;
    case 'ArrowUp':
      // Prevent scrolling
      e.preventDefault();
      dispatch(moveNoteUp());
      break;
    case 'ArrowDown':
      // Prevent scrolling
      e.preventDefault();
      dispatch(moveNoteDown());
      break;

    case '.':
      dispatch(toggleDot());
      break;
    case 't':
      dispatch(tieSelectedNotes());
      break;
    case 'z':
      if (e.ctrlKey) dispatch(undo());
      break;
    case 'y':
      if (e.ctrlKey) dispatch(redo());
      break;

    case '1':
      dispatch(setInputLength(NoteLength.Semibreve));
      break;
    case '2':
      dispatch(setInputLength(NoteLength.Minim));
      break;
    case '3':
      dispatch(setInputLength(NoteLength.Crotchet));
      break;
    case '4':
      dispatch(setInputLength(NoteLength.Quaver));
      break;
    case '5':
      dispatch(setInputLength(NoteLength.SemiQuaver));
      break;
    case '6':
      dispatch(setInputLength(NoteLength.DemiSemiQuaver));
      break;
    case '7':
      dispatch(setInputLength(NoteLength.HemiDemiSemiQuaver));
      break;
  }
}
