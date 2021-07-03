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

let audioStopped = false;

export const stopAudio = (): void => {
    audioStopped = true;
}

function loadSample(context: AudioContext, location: string): Promise<AudioBufferSourceNode> {
  return new Promise((res, rej) => {
    const request = new XMLHttpRequest();
    request.open('GET', location, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      context.decodeAudioData(request.response, (buffer) => {
        let source = context.createBufferSource();
        source.buffer = buffer;
        res(source);
      });
    }
    request.send();
  });
}

export async function playback(state: PlaybackState, elements: PlaybackElement[]): Promise<void> {
  const context = new AudioContext();

  function pitchToSample(pitch: Pitch): string {
    switch (pitch) {
      case Pitch.G: return '/audio/lowg.mp3';
      case Pitch.A: return '/audio/lowa.mp3';
      case Pitch.B: return '/audio/b.mp3';
      case Pitch.C: return '/audio/c.mp3';
      case Pitch.D: return '/audio/d.mp3';
      case Pitch.E: return '/audio/e.mp3';
      case Pitch.F: return '/audio/f.mp3';
      case Pitch.HG: return '/audio/highg.mp3';
      case Pitch.HA: return '/audio/higha.mp3';
    }
  }

  elements.unshift({ pitch: Pitch.E, duration: 1 });

  // Need to create an array of different buffers since each buffer can only be played once
  let audioBuffers = new Array(elements.length);
  for (const el in elements) {
    audioBuffers[el] = loadSample(context, pitchToSample(elements[el].pitch)).then(a => {
      a.connect(context.destination);
      return a;
    });
  }
  const gracenoteLength = 50;
  Promise.all(audioBuffers).then(async (audioBuffers) => {
    for (let i=0; i<audioBuffers.length; i++) {
      const audio = audioBuffers[i];//const current = { audio: audio[i], duration: elements[i].duration };
      const duration = elements[i].duration;
      if (audioStopped) {
        audioStopped = false;
        break;
      }
      audio.start(0);
      if (duration === 0) {
        await sleep(gracenoteLength);
      } else {
        const nextGracenotes = 0;

        // Subtract the length of the next gracenote (so that each note lands on the beat
        // while the gracenote is before the beat)
        let j = 0;
        while (elements[i + j].duration === 0) {
          j++;
        }
        await sleep(1000 * duration * 60 / (state.bpm) - (gracenoteLength * j));
      }
      audio.stop();
    }
  });
}

