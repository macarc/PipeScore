import { Pitch } from '../global/pitch';
import { NoteLength } from '../Note/model';

import { DemoNoteModel } from './model';


const init = (length: NoteLength): DemoNoteModel => ({
  pitch: Pitch.A,
  length,
  x: 0,
  staveIndex: 0
});

export default {
  init
}
