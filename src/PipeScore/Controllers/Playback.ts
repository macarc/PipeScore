/*
  Controller for playback events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, noChange } from './Controller';
import { State } from '../State';

import { playback, stopAudio } from '../Playback';

export function startPlayback(): ScoreEvent {
  return async (state: State) => {
    await playback(state.playback, state.score.play());
    return noChange(state);
  };
}

export function stopPlayback(): ScoreEvent {
  return async (state: State) => {
    stopAudio();
    return noChange(state);
  };
}

export function setPlaybackBpm(bpm: number): ScoreEvent {
  return async (state: State) => noChange({ ...state, playback: { bpm } });
}
