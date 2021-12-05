/*
  Dispatches to Controller when key presses occur
  Copyright (C) 2021 macarc
 */
import { dispatch } from './Controller';
import { dialogueBoxIsOpen } from './global/dialogueBox';

import {
  setInputLength,
  stopInput,
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
  addNoteAfterSelection,
} from './Controllers/Note';
import { undo, redo, print } from './Controllers/Misc';
import { deleteSelection } from './Controllers/Mouse';
import { Pitch } from './global/pitch';

import { NoteLength } from './Note/notelength';
import { moveLeftBarwise, moveRightBarwise } from './Controllers/Bar';

export function keyHandler(e: KeyboardEvent): void {
  if (dialogueBoxIsOpen) return;

  if (e.ctrlKey) {
    switch (e.key) {
      case 'c':
        dispatch(copy());
        break;
      case 'v':
        dispatch(paste());
        break;

      case 'z':
        dispatch(undo());
        break;
      case 'y':
        dispatch(redo());
        break;
      case 'p':
        e.preventDefault();
        dispatch(print());
        break;
    }
  } else {
    switch (e.key) {
      case 'Escape':
        dispatch(stopInput());
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

      case 'Tab':
        if (e.shiftKey) {
          dispatch(moveLeftBarwise());
        } else {
          dispatch(moveRightBarwise());
        }
        break;

      case '.':
        dispatch(toggleDot());
        break;
      case 't':
        dispatch(tieSelectedNotes());
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

      case 'g':
        dispatch(addNoteAfterSelection(Pitch.G));
        break;
      case 'a':
        dispatch(addNoteAfterSelection(Pitch.A));
        break;
      case 'b':
        dispatch(addNoteAfterSelection(Pitch.B));
        break;
      case 'c':
        dispatch(addNoteAfterSelection(Pitch.C));
        break;
      case 'd':
        dispatch(addNoteAfterSelection(Pitch.D));
        break;
      case 'e':
        dispatch(addNoteAfterSelection(Pitch.E));
        break;
      case 'f':
        dispatch(addNoteAfterSelection(Pitch.F));
        break;
      case 'G':
        dispatch(addNoteAfterSelection(Pitch.HG));
        break;
      case 'A':
        dispatch(addNoteAfterSelection(Pitch.HA));
        break;
    }
  }
}
