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

import { ScoreEvent, Update } from './common';
import { State } from '../State';

import { playback, stopAudio } from '../Playback';

export function startPlayback(): ScoreEvent {
  return async (state: State) => {
    await playback(state.playback, state.score.play());
    return Update.NoChange;
  };
}

export function stopPlayback(): ScoreEvent {
  return async () => {
    stopAudio();
    return Update.NoChange;
  };
}

export function setPlaybackBpm(bpm: number): ScoreEvent {
  return async (state: State) => {
    state.playback.bpm = bpm;
    return Update.NoChange;
  };
}
