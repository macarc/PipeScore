import { Pitch } from './global/pitch';

export interface PlaybackState {
  bpm: number
}

export interface PlaybackElement {
  pitch: Pitch,
  duration: number
}

function sleep(length: number): Promise<void> {
  return new Promise(res => setTimeout(res, length));
}

function pitchToAudio(pitch: Pitch): HTMLAudioElement {
  switch (pitch) {
    case Pitch.G: return lowg;
    case Pitch.A: return lowa;
    case Pitch.B: return b;
    case Pitch.C: return c;
    case Pitch.D: return d;
    case Pitch.E: return e;
    case Pitch.F: return f;
    case Pitch.HG: return highg;
    case Pitch.HA: return higha;
  }
}

let audioStopped = false;

export const stopAudio = (): void => {
    audioStopped = true;
}

export async function playback(state: PlaybackState, elements: PlaybackElement[]): Promise<void> {
  const lowg = new Audio('/audio/lowg.mp3');
  const lowa = new Audio('/audio/lowa.mp3');
  const b = new Audio('/audio/b.mp3');
  const c = new Audio('/audio/c.mp3');
  const d = new Audio('/audio/d.mp3');
  const e = new Audio('/audio/e.mp3');
  const f = new Audio('/audio/f.mp3');
  const highg = new Audio('/audio/highg.mp3');
  const higha = new Audio('/audio/higha.mp3');

  let current = lowa;
  for (const el of elements) {
    if (audioStopped) {
      audioStopped = false;
      break;
    }
    current = pitchToAudio(el.pitch);
    current.play();
    await sleep(1000 * el.duration * 60 / (state.bpm));
    current.pause();
    current.currentTime = 0;
  }
}

