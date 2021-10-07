/*
  State required for notes
  Copyright (C) 2021 Archie Maclean
*/
import { Note } from '.';

export interface NoteState {
  dragged: Note | null;
  inputtingNotes: boolean;
}
