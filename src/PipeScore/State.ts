/*
  State.ts - Defines global State interface
  Copyright (C) 2021 Archie Maclean
*/

import { Demo } from './DemoNote';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from '../render/h';
import { Score } from './Score';
import { Selection } from './Selection';
import { Note, Triplet } from './Note';
import { Obj } from './global/utils';

export interface State {
  justClickedNote: boolean;
  demo: Demo | null;
  ui: { menu: Menu };
  doc: { current: string | null; show: boolean };
  clipboard: (Note | Triplet | 'bar-break')[] | null;
  selection: Selection | null;
  history: { past: string[]; future: string[] };
  view: { ui: V | null; score: V | null };
  playback: PlaybackState;
  score: Score;
}
