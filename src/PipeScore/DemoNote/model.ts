/*
   Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { NoteLength } from '../Note/model';

export type DemoNoteModel =
  | {
      type: 'note';
      pitch: Pitch | null;
      length: NoteLength;
      staveIndex: number;
      x: number;
    }
  | {
      type: 'gracenote';
      pitch: Pitch | null;
      staveIndex: number;
      x: number;
    };
