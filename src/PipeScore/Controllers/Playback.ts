/*
  Controller for playback events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, Update } from './Controller';
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
