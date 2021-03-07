/*
   Copyright (C) 2020 Archie Maclean
 */
import { NoteLength } from '../Note/model';

import { DemoNoteModel } from './model';


const init = (length: NoteLength): DemoNoteModel => ({
  pitch: null,
  length,
  x: 0,
  staveIndex: 0
});

export default {
  init
}
