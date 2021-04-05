import { BarModel } from './model';
import { PlaybackElement } from '../Playback';
import { flatten } from '../global/utils';

import playNote from '../Note/play';


export default function play(bar: BarModel): PlaybackElement[] {
  return flatten(bar.notes.map(playNote));
}
