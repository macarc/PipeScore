/*
   Copyright (C) 2020 Archie Maclean
 */
import { NoteLength } from '../Note/model';

import { DemoNoteModel } from './model';


const init = (length: NoteLength): DemoNoteModel => ({
  type: 'note',
  pitch: null,
  length,
  x: 0,
  staveIndex: 0
});

const initDemoGracenote = (): DemoNoteModel => ({
  type: 'gracenote',
  pitch: null,
  x: 0,
  staveIndex: 0
});
export default {
  init,
  initDemoGracenote
}
