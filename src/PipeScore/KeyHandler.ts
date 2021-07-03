/*
  KeyHandler.ts - dispatches to Controller when key presses occur
  Copyright (C) 2021 Archie Maclean
 */
import { dispatch } from './Controller';
import { dialogueBoxIsOpen } from './global/dialogueBox';

import { NoteLength } from './Note/model';

export function keyHandler(e: KeyboardEvent): void {
  if (dialogueBoxIsOpen) return;

  switch (e.key) {
    case "Escape":
      dispatch({ name: 'stop inputting notes' });
      break;
    case "c":
      if (e.ctrlKey)
        dispatch({ name: 'copy' });
      break;
    case "v":
      if (e.ctrlKey)
        dispatch({ name: 'paste' });
      break;
    case "Backspace":
    case "Delete":
      dispatch({ name: 'delete selected' });
      break;

    case "ArrowRight":
      if (e.shiftKey) {
        dispatch({ name: 'expand selection' })
      } else {
        dispatch({ name: 'move right' });
      }
      break;
    case "ArrowLeft":
      if (e.shiftKey) {
        dispatch({ name: 'detract selection' })
      } else {
        dispatch({ name: 'move left' });
      }
      break;
    case "ArrowUp":
      // Prevent scrolling
      e.preventDefault();
      dispatch({ name: 'move note up' });
      break;
    case "ArrowDown":
      // Prevent scrolling
      e.preventDefault();
      dispatch({ name: 'move note down' });
      break;

    case ".":
      dispatch({ name: 'toggle dotted' });
      break;
    case "t":
      dispatch({ name: 'tie selected notes' });
      break;
    case "z":
      if (e.ctrlKey)
        dispatch({ name: 'undo' });
      break;
    case "y":
      if (e.ctrlKey)
        dispatch({ name: 'redo' });
      break;

    case "1":
      dispatch({ name: 'set note input length', length: NoteLength.Semibreve });
      break;
    case "2":
      dispatch({ name: 'set note input length', length: NoteLength.Minim });
      break;
    case "3":
      dispatch({ name: 'set note input length', length: NoteLength.Crotchet });
      break;
    case "4":
      dispatch({ name: 'set note input length', length: NoteLength.Quaver });
      break;
    case "5":
      dispatch({ name: 'set note input length', length: NoteLength.SemiQuaver });
      break;
    case "6":
      dispatch({ name: 'set note input length', length: NoteLength.DemiSemiQuaver });
      break;
    case "7":
      dispatch({ name: 'set note input length', length: NoteLength.HemiDemiSemiQuaver });
      break;
  }
}

