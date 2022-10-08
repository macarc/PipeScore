//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  The type of the global state

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
