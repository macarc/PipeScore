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

//  Playback - given a list of pitches and lengths, play them using the
//  Web Audio API:
//  <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>
//  There's some pretty horrible stuff here, to try and make the API work
//  (especially on Safari).

import { Pitch } from './global/pitch';
import { ID } from './global/id';

export interface PlaybackState {
  bpm: number;
}

export interface Playback {
  type: string;
}
export class PlaybackObject implements Playback {
  type: 'object-start' | 'object-end';
  id: ID;

  constructor(position: 'start' | 'end', id: ID) {
    this.type = position === 'start' ? 'object-start' : 'object-end';
    this.id = id;
  }
}
export class PlaybackNote implements Playback {
  type: 'note' = 'note';
  pitch: Pitch;
  tied: boolean;
  duration: number;

  constructor(pitch: Pitch, tied: boolean, duration: number) {
    this.pitch = pitch;
    this.tied = tied;
    this.duration = duration;
  }
}

export class PlaybackGracenote implements Playback {
  type: 'gracenote' = 'gracenote';
  pitch: Pitch;

  constructor(pitch: Pitch) {
    this.pitch = pitch;
  }
}

export class PlaybackRepeat implements Playback {
  type: 'repeat-start' | 'repeat-end';

  constructor(position: 'start' | 'end') {
    this.type = position === 'start' ? 'repeat-start' : 'repeat-end';
  }
}

export class PlaybackSecondTiming {
  start: number;
  middle: number;
  end: number;

  constructor(start: number, middle: number, end: number) {
    this.start = start;
    this.middle = middle;
    this.end = end;
  }
  shouldDeleteElement(index: number, repeating: boolean) {
    if (repeating) {
      return this.start <= index && index <= this.middle;
    } else {
      return this.middle <= index && index <= this.end;
    }
  }
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
  loaded = false;
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  load(): Promise<(context: AudioContext) => void> {
    // Need to do this because when it's used later on `this` refers to something else
    // eslint-disable-next-line
    const s = this;

    // Safari can't decode mp3
    const file_format = (window as any).safari !== undefined ? '.wav' : '.mp3';

    return new Promise((res) => {
      const request = new XMLHttpRequest();
      request.open('GET', '/audio/' + this.name + file_format, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        const data = request.response;
        res((context) => {
          if (!s.loaded) {
            context.decodeAudioData(data, (buffer) => {
              s.buffer = buffer;
              s.loaded = true;
            });
          }
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

class Drones {
  private initialSample: Sample;
  private sample: Sample;
  private started = false;
  private context: AudioContext;
  private source: AudioBufferSourceNode | null = null;

  constructor(initialDrone: Sample, drone: Sample, context: AudioContext) {
    this.initialSample = initialDrone;
    this.sample = drone;
    this.context = context;
  }
  loop() {
    if (!playing) return;

    const sample = this.started ? this.initialSample : this.sample;
    this.source = sample.getSource(this.context);
    const droneGain = this.context.createGain();
    droneGain.gain.value = 0.1;
    this.source.connect(droneGain).connect(this.context.destination);
    this.source.start(0);
    const sampleLength = this.source.buffer?.duration || 0;
    const repeatAfter = sampleLength > 1 ? sampleLength - 3 : sampleLength;
    sleep(1000 * repeatAfter).then(() => this.loop());
  }
  stop() {
    if (this.source) this.source.stop();
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

let loading: Promise<((context: AudioContext) => void)[]> = new Promise(
  () => null
);

export function loadSamples() {
  loading = Promise.all([
    lowg.load(),
    lowa.load(),
    b.load(),
    c.load(),
    d.load(),
    e.load(),
    f.load(),
    highg.load(),
    higha.load(),
    drones.load(),
    dronesInitial.load(),
  ]);
}

// Some programming horror to try to massage the WebAudio API to do what I want
// We have to:
// * get the sources of the audio samples
// * play some blank audio so that Safari behaves slightly better
// * not create an AudioContext without being triggered by a user action
// * trigger AudioContext creation as soon as possible after being triggered by action (for Safari)
let finishedSetup = false;
let finishSetup: () => void = () => null;
const setup = new Promise<void>((res) => (finishSetup = res)).then(
  () => (finishedSetup = true)
);
let context: AudioContext = new AudioContext(); // Won't work initially
let initialisedContext = false;

function initialiseContext() {
  if (initialisedContext) return;
  context = new AudioContext();
  const buf = context.createBuffer(1, 1, 48000);
  const source = context.createBufferSource();
  source.buffer = buf;
  source.connect(context.destination);
  source.start();
  source.stop();
  initialisedContext = true;
}

export async function setupAudio() {
  if (finishedSetup) return;

  // This won't work in the main body of the 'playback' function
  // I'm not really sure why, but let's appease the browser gods with
  // a hacky solution
  // This has to be triggered by a user action (in order to create an AudioContext)
  (await loading).forEach((fn) => fn(context));
  initialiseContext();
  finishSetup();
}

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

const gracenoteDuration = 0.044;

class SoundedPitch {
  sample: AudioBufferSourceNode;
  pitch: Pitch;
  duration: number;

  constructor(pitch: Pitch, duration: number) {
    this.sample = pitchToSample(pitch).getSource(context);
    this.sample.connect(context.destination);
    this.pitch = pitch;
    this.duration = duration;
  }

  duplicate() {
    return new SoundedPitch(this.pitch, this.duration);
  }

  async play(bpm: number) {
    const duration = (1000 * this.duration * 60) / bpm;
    this.sample.start(0);
    await sleep(duration);
    this.sample.stop();
  }
}

function shouldDeleteBecauseOfSecondTimings(
  index: number,
  timings: PlaybackSecondTiming[],
  repeating: boolean
) {
  for (const timing of timings) {
    if (timing.shouldDeleteElement(index, repeating)) return true;
  }
  return false;
}

function isAtEndOfTiming(index: number, timings: PlaybackSecondTiming[]) {
  for (const timing of timings) {
    if (timing.end === index) {
      return true;
    }
  }
  return false;
}

// Removes all PlaybackRepeats and PlaybackObjects from `elements'
// and duplicates notes where necessary for repeats / second timings
function expandRepeats(elements: Playback[], timings: PlaybackSecondTiming[]) {
  let repeatStartIndex = 0;
  let repeatEndIndex = 0;
  let i = 0;
  let repeating = false;
  const output: Playback[] = [];

  while (i < elements.length) {
    const e = elements[i];
    if (e instanceof PlaybackRepeat) {
      if (e.type === 'repeat-end' && i > repeatEndIndex) {
        repeatEndIndex = i;
        // Go back to repeat
        i = repeatStartIndex + 1;
        // Sometimes people don't put a repeat start, in which
        // case we just repeat from the last repeat end
        repeatStartIndex = repeatEndIndex;
        repeating = true;
      } else {
        if (e.type === 'repeat-start') repeatStartIndex = i;
        ++i;
      }
    } else {
      if (
        !(e instanceof PlaybackObject) &&
        !shouldDeleteBecauseOfSecondTimings(i, timings, repeating)
      ) {
        output.push(e);
      }
      if (e instanceof PlaybackObject && e.type === 'object-end') {
        if (repeating && isAtEndOfTiming(i, timings)) {
          repeating = false;
        }
      }
      ++i;
    }
  }
  return output;
}

function getSoundedPitches(
  elements: Playback[],
  timings: PlaybackSecondTiming[]
): SoundedPitch[] {
  elements = expandRepeats(elements, timings);

  const pitches: SoundedPitch[] = [];
  for (let i = 0; i < elements.length; i++) {
    const e = elements[i];
    if (e instanceof PlaybackGracenote) {
      pitches.push(new SoundedPitch(e.pitch, gracenoteDuration));
    } else if (e instanceof PlaybackNote) {
      let duration = e.duration;
      // If subsequent notes are tied, increase this note's duration
      // and skip the next notes
      for (
        let nextNote = elements[i + 1];
        i < elements.length &&
        nextNote instanceof PlaybackNote &&
        nextNote.tied;
        nextNote = elements[++i + 1]
      ) {
        duration += nextNote.duration;
      }
      // If there are gracenotes next, remove their length from the note
      for (
        let j = i, nextNote = elements[j + 1];
        j < elements.length && nextNote instanceof PlaybackNote;
        nextNote = elements[++j + 1]
      ) {
        duration -= gracenoteDuration;
      }
      duration = Math.max(duration, 0);
      pitches.push(new SoundedPitch(e.pitch, duration));
    } else {
      throw new Error('Unexpected playback element ' + e);
    }
  }
  return pitches;
}

export async function playback(
  state: PlaybackState,
  elements: Playback[],
  timings: PlaybackSecondTiming[]
): Promise<void> {
  if (playing) return;
  playing = true;

  document.body.classList.add('loading');
  initialiseContext();
  await setup;

  const soundedPitches = getSoundedPitches(elements, timings);
  const drone = new Drones(dronesInitial, drones, context);

  drone.loop();
  await sleep(1000);
  document.body.classList.remove('loading');

  for (const note of soundedPitches) {
    if (audioStopped) break;

    await note.play(state.bpm);
  }

  drone.stop();

  audioStopped = false;
  playing = false;
}
