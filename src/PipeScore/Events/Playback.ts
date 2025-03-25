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

import { playback } from '../Playback/impl';
import { ScoreSelection } from '../Selection/score';
import type { State } from '../State';
import type { ID } from '../global/id';
import type { Instrument } from '../global/instrument';
import { settings } from '../global/settings';
import { type ScoreEvent, Update } from './types';

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
        state.selection.start()
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
        state.selection.start(),
        state.selection.end(),
        true
      );
    }
    return Update.NoChange;
  };
}

export function stopPlayback(): ScoreEvent {
  return async (state: State) => {
    if (state.playback.playing) {
      state.playback.userPressedStop = true;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function setPlaybackBpm(bpm: number): ScoreEvent {
  return async () => {
    settings.bpm = bpm;
    return Update.ShouldSave;
  };
}

export function setHarmonyVolume(volume: number): ScoreEvent {
  return async () => {
    settings.harmonyVolume = volume / 100;
    return Update.ShouldSave;
  };
}

export function updatePlaybackCursor(id: ID | null): ScoreEvent {
  return async (state: State) => {
    if (id !== state.playback.cursor) {
      state.playback.cursor = id;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function updateInstrument(instrument: Instrument): ScoreEvent {
  return async () => {
    if (instrument !== settings.instrument) {
      settings.instrument = instrument;
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
