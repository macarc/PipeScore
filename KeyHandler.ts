import { dispatch } from './Controller';

import { NoteLength } from './Note/model';

export function keyHandler(e: KeyboardEvent): void {
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
    case "Delete":
      dispatch({ name: 'delete selected notes' });
      break;
    case ".":
      dispatch({ name: 'toggle dotted' });
      break;
    case "t":
      dispatch({ name: 'tie selected notes' });
      break;

    case "1":
      dispatch({ name: 'set note input length', length: NoteLength.HemiDemiSemiQuaver });
      break;
    case "2":
      dispatch({ name: 'set note input length', length: NoteLength.DemiSemiQuaver });
      break;
    case "3":
      dispatch({ name: 'set note input length', length: NoteLength.SemiQuaver });
      break;
    case "4":
      dispatch({ name: 'set note input length', length: NoteLength.Quaver });
      break;
    case "5":
      dispatch({ name: 'set note input length', length: NoteLength.Crotchet });
      break;
    case "6":
      dispatch({ name: 'set note input length', length: NoteLength.Minim });
      break;
    case "7":
      dispatch({ name: 'set note input length', length: NoteLength.Semibreve });
      break;
  }
}

