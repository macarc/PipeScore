/*
  State required for notes
  Copyright (C) 2021 Archie Maclean
*/
import { BaseNote } from './model';

export interface NoteState {
  dragged: BaseNote | null;
  inputtingNotes: boolean;
}
