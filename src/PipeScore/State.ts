/*
  State.ts - Defines global State interface
  Copyright (C) 2021 macarc
*/

import { Demo } from './DemoNote';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from 'marender';
import { Score } from './Score';
import { Selection } from './Selection';
import { Note, Triplet } from './Note';

export interface State {
  canEdit: boolean;
  isLoggedIn: boolean;
  justClickedNote: boolean;
  // justAddedNote is needed for a hack -
  // after adding a note, in order to show the
  // demo note as soon as possible, it changes from
  // mouseOverPitch to mouseMovedOnPitch
  // this just tracks whether or not to do that
  justAddedNote: boolean;
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
