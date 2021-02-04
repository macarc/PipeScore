import { dispatch } from './Controller';
import { NoteLength } from './Note/model';

export function keyHandler(e: KeyboardEvent) {
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

  }
}

