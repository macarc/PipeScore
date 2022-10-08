/*
  State.ts - Defines global State interface
  Copyright (C) 2021 macarc
*/

import { Preview } from './Preview';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { Score } from './Score';
import { Selection } from './Selection';
import { Note, Triplet } from './Note';

export type State = {
  canEdit: boolean;
  isLoggedIn: boolean;
  justClickedNote: boolean;
  preview: Preview | null;
  menu: Menu;
  doc: { current: string | null; show: boolean };
  clipboard: (Note | Triplet | 'bar-break')[] | null;
  selection: Selection | null;
  history: { past: string[]; future: string[] };
  view: { ui: HTMLElement | null; score: HTMLElement | null };
  playback: PlaybackState;
  score: Score;
};
