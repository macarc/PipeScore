import { StaveModel } from './model';
import { PlaybackElement } from '../Playback';
import { flatten } from '../global/utils';

import playBar from '../Bar/play';


export default function play(stave: StaveModel): PlaybackElement[] {
  return flatten(stave.bars.map(playBar));
}
