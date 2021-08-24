import { ScoreEvent, noChange } from './Controller';
import { State } from '../State';

import { playback, stopAudio } from '../Playback';
import playScore from '../Score/play';

export function startPlayback(): ScoreEvent {
  return async (state: State) =>
    playback(state.playbackState, playScore(state.score)) && noChange(state);
}

export function stopPlayback(): ScoreEvent {
  return async (state: State) => {
    stopAudio();
    return noChange(state);
  };
}

export function setPlaybackBpm(bpm: number): ScoreEvent {
  return async (state: State) => noChange({ ...state, playbackState: { bpm } });
}
