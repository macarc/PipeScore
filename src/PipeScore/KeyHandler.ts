//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { dispatch } from './Controller';
import { dialogueBoxIsOpen } from './global/dialogueBox';

import {
  setInputLength,
  stopInput,
  tieSelectedNotes,
  moveNoteDown,
  moveNoteUp,
  toggleDot,
  addNoteAfterSelection,
} from './Events/Note';
import {
  copy,
  paste,
  expandSelection,
  detractSelection,
  deleteSelection,
  moveLeftBarwise,
  moveRightBarwise,
  moveLeft,
  moveRight,
} from './Events/Selection';
import { undo, redo, print, save } from './Events/Misc';
import { Pitch } from './global/pitch';
import { NoteLength } from './Note/notelength';

export function keyHandler(e: KeyboardEvent): void {
  if (dialogueBoxIsOpen) return;

  const isMacCmd = e.metaKey && navigator.platform.startsWith('Mac');

  if (isMacCmd || e.ctrlKey) {
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

      case 's':
        e.preventDefault();
        dispatch(save());
        break;
    }
  } else if (!(document.activeElement instanceof HTMLInputElement)) {
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
