import { Pitch } from '../global/pitch';
import { DemoNoteModel } from './model';


const init = (): DemoNoteModel => ({
  pitch: Pitch.A,
  x: 0,
  staveIndex: 0
});

export default {
  init
}
