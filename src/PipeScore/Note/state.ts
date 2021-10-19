/*
  State required for notes
  Copyright (C) 2021 macarc
*/
import { Note, Triplet } from '.';

export interface NoteState {
  dragged: Note | null;
  selectedTripletLine: Triplet | null;
  inputtingNotes: boolean;
}
