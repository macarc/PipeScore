/*
  Playback - given a list of pitches and lengths, play them using the Web Audio API
  See https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
  Copyright (C) 2021 macarc
*/
import { Pitch } from './global/pitch';

export interface PlaybackState {
  bpm: number;
}

export interface PlaybackElement {
  pitch: Pitch;
  tied: boolean;
  duration: number;
}

function sleep(length: number): Promise<void> {
  return new Promise((res) => setTimeout(res, length));
}

let audioStopped = false;
let playing = false;

export const stopAudio = (): void => {
  audioStopped = true;
};

class Sample {
  buffer: AudioBuffer | null = null;
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  load(context: AudioContext): Promise<void> {
    if (this.buffer != null) return Promise.resolve();

    // Need to do this because when it's used later on `this` refers to something else
    // eslint-disable-next-line
    const s = this;

    const file_format = (window as any).safari !== undefined ? '.wav' : '.mp3';

    return new Promise((res) => {
      const request = new XMLHttpRequest();
      request.open('GET', '/audio/' + this.name + file_format, true);
      request.responseType = 'arraybuffer';
      request.onload = function () {
        context.decodeAudioData(request.response, (buffer) => {
          s.buffer = buffer;
          res();
        });
      };
      request.send();
    });
  }

  getSource(context: AudioContext): AudioBufferSourceNode {
    const source = context.createBufferSource();
    source.buffer = this.buffer;
    return source;
  }
}

const lowg = new Sample('lowg');
const lowa = new Sample('lowa');
const b = new Sample('b');
const c = new Sample('c');
const d = new Sample('d');
const e = new Sample('e');
const f = new Sample('f');
const highg = new Sample('highg');
const higha = new Sample('higha');
const drones = new Sample('drones');
const dronesInitial = new Sample('drones_initial');

export async function playback(
  state: PlaybackState,
  elements: PlaybackElement[]
): Promise<void> {
  if (playing) return;
  playing = true;

  document.body.classList.add('loading');
  const context = new AudioContext();

  await Promise.all([
    lowg.load(context),
    lowa.load(context),
    b.load(context),
    c.load(context),
    d.load(context),
    e.load(context),
    f.load(context),
    highg.load(context),
    higha.load(context),
    drones.load(context),
    dronesInitial.load(context),
  ]);
  function pitchToSample(pitch: Pitch): Sample {
    switch (pitch) {
      case Pitch.G:
        return lowg;
      case Pitch.A:
        return lowa;
      case Pitch.B:
        return b;
      case Pitch.C:
        return c;
      case Pitch.D:
        return d;
      case Pitch.E:
        return e;
      case Pitch.F:
        return f;
      case Pitch.HG:
        return highg;
      case Pitch.HA:
        return higha;
    }
  }

  // Need to create an array of different buffers since each buffer can only be played once
  const audioBuffers: AudioBufferSourceNode[] = new Array(elements.length);
  for (const el in elements) {
    audioBuffers[el] = pitchToSample(elements[el].pitch).getSource(context);
    audioBuffers[el].connect(context.destination);
  }
  let droneSource = dronesInitial.getSource(context);
  function loopDrones(start: boolean) {
    return sleep(
      start ? 0 : 1000 * ((droneSource.buffer?.duration || 3) - 3)
    ).then(() => {
      if (!playing) return;
      droneSource = (start ? dronesInitial : drones).getSource(context);
      const droneGain = context.createGain();
      droneGain.gain.value = 0.1;
      droneSource.connect(droneGain).connect(context.destination);
      droneSource.start(0);
      loopDrones(false);
    });
  }
  loopDrones(true);
  await sleep(1000);

  const gracenoteLength = 44;
  document.body.classList.remove('loading');
  for (let i = 0; i < audioBuffers.length; i++) {
    if (elements[i].tied) continue;
    const audio = audioBuffers[i];
    const duration = elements[i].duration;
    if (audioStopped) {
      break;
    }
    audio.start(0);
    if (duration === 0) {
      await sleep(gracenoteLength);
    } else {
      // Subtract the length of the next gracenote (so that each note lands on the beat
      // while the gracenote is before the beat)
      let j = 0;
      while (elements[i + j + 1] && elements[i + j + 1].duration === 0) {
        j++;
      }
      let duration = elements[i].duration;
      for (let k = 1; elements[i + k] && elements[i + k].tied; k++) {
        duration += elements[i + k].duration;
      }
      await sleep(
        Math.max((1000 * duration * 60) / state.bpm - gracenoteLength * j, 0)
      );
    }
    audio.stop();
  }

  droneSource.stop();
  audioStopped = false;
  playing = false;
}
