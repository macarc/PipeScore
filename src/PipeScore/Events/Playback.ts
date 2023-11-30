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

import { ScoreEvent, Update } from './common';
import { State } from '../State';

import { playback } from '../Playback';
import { ScoreSelection } from '../Selection';
import { settings } from '../global/settings';

export function startPlayback(): ScoreEvent {
  return async (state: State) => {
    const playbackElements = state.score.play();
    await playback(
      state.playback,
      playbackElements,
      state.score.playbackTimings(playbackElements)
    );
    return Update.NoChange;
  };
}

export function startPlaybackAtSelection(): ScoreEvent {
  return async (state: State) => {
    const playbackElements = state.score.play();
    if (state.selection instanceof ScoreSelection) {
      await playback(
        state.playback,
        playbackElements,
        state.score.playbackTimings(playbackElements),
        state.selection.start
      );
    }
    return Update.NoChange;
  };
}

export function playbackLoopingSelection(): ScoreEvent {
  return async (state: State) => {
    const playbackElements = state.score.play();
    if (state.selection instanceof ScoreSelection) {
      await playback(
        state.playback,
        playbackElements,
        state.score.playbackTimings(playbackElements),
        state.selection.start,
        state.selection.end,
        true
      );
    }
    return Update.NoChange;
  };
}

export function stopPlayback(): ScoreEvent {
  return async (state: State) => {
    if (state.playback.playing) state.playback.userPressedStop = true;
    return Update.NoChange;
  };
}

export function setPlaybackBpm(bpm: number): ScoreEvent {
  return async () => {
    settings.bpm = bpm;
    return Update.NoChange;
  };
}
