/*
  State required for notes
  Copyright (C) 2021 Archie Maclean
*/
import { Note, TripletNote } from './model';

export interface NoteState {
  dragged: Note | TripletNote | null;
  inputtingNotes: boolean;
}
