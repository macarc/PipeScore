//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
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

import { Firestore } from './Firestore';
import { PlaybackState } from './Playback/state';
import { IPreview } from './Preview';
import { SavedNoteOrTriplet } from './SavedModel';
import { IScore } from './Score';
import { ISelection } from './Selection';
import { Documentation } from './Translations';
import { Menu } from './UI/model';

export type State = {
  store: Firestore | null;
  isLoggedIn: boolean;
  justClickedNote: boolean;
  preview: IPreview | null;
  menu: Menu;
  doc: { current: keyof Documentation | null; show: boolean };
  clipboard: (SavedNoteOrTriplet | 'bar-break')[] | null;
  selection: ISelection | null;
  history: { past: string[]; future: string[] };
  view: { ui: HTMLElement | null; score: HTMLElement | null };
  playback: PlaybackState;
  score: IScore;
};
