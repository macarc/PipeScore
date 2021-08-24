import { BaseNote } from './model';

export interface NoteState {
  dragged: BaseNote | null;
  inputtingNotes: boolean;
}
