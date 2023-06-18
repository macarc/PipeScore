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

//  Playback - given a list of pitches and lengths, play them using the
//  Web Audio API:
//  <https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API>

import { Pitch } from '../global/pitch';
import { Sample, Player, sleep } from './sample';
import { PlaybackState } from './state';
import {
  Playback,
  PlaybackObject,
  PlaybackRepeat,
  PlaybackNote,
  PlaybackGracenote,
  PlaybackSecondTiming,
} from './model';
import { ID } from '../global/id';
import { settings } from '../global/settings';

export * from './model';

class Drones {
  private player: Player;
  private stopped = false;

  constructor(sample: Sample, context: AudioContext) {
    this.player = new Player(sample, context);
  }
  async play() {
    while (!this.stopped) {
      this.player.play(0.1);
      const sleepLength = this.player.length() - 3;
      await sleep(1000 * sleepLength);
    }
  }
  stop() {
    this.player.stop();
    this.stopped = true;
  }
}

class SoundedPitch {
  sample: AudioBufferSourceNode;
  pitch: Pitch;
  duration: number;

  constructor(pitch: Pitch, duration: number, ctx: AudioContext) {
    this.sample = pitchToSample(pitch).getSource(ctx);
    this.sample.connect(ctx.destination);
    this.pitch = pitch;
    this.duration = duration;
  }

  async play(bpm: number) {
    const duration = (1000 * this.duration * 60) / bpm;
    this.sample.start(0);
    await sleep(duration);
    this.sample.stop();
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

// This is in a function so that sample loading can be delayed, so that images
// are loaded first. Hackity hackity.
export async function startLoadingSamples(onload: () => void) {
  const context = new AudioContext();
  const samples = await Promise.all([
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
  ]);
  samples.forEach((fn) => fn(context));
  onload();
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

function shouldDeleteBecauseOfSecondTimings(
  index: number,
  timings: PlaybackSecondTiming[],
  repeating: boolean
) {
  return timings.some((t) => t.shouldDeleteElement(index, repeating));
}

function inSecondTiming(index: number, timings: PlaybackSecondTiming[]) {
  return timings.some((t) => t.in(index));
}

function isAtEndOfTiming(index: number, timings: PlaybackSecondTiming[]) {
  return timings.some((t) => t.end === index);
}

// Removes all PlaybackRepeats and PlaybackObjects from `elements'
// and duplicates notes where necessary for repeats / second timings
function expandRepeats(
  elements: Playback[],
  timings: PlaybackSecondTiming[],
  start: ID | null
): (PlaybackNote | PlaybackGracenote)[] {
  let repeatStartIndex = 0;
  let repeatEndIndex = 0;
  let repeating = false;
  let output: (PlaybackNote | PlaybackGracenote)[] = [];

  for (let i = 0; i < elements.length; i++) {
    const e = elements[i];
    if (e instanceof PlaybackRepeat) {
      if (e.type === 'repeat-end' && repeating && !inSecondTiming(i, timings)) {
        repeating = false;
        repeatStartIndex = i;
      } else if (e.type === 'repeat-end' && i > repeatEndIndex) {
        repeatEndIndex = i;
        // Go back to repeat
        i = repeatStartIndex;
        // Need to do this to avoid an infinite loop
        // if two end repeats are next to each other
        repeatStartIndex = i;
        repeating = true;
      } else if (e.type === 'repeat-start') {
        repeatStartIndex = i;
      }
    } else if (e instanceof PlaybackObject) {
      if (e.type === 'object-start' && e.id === start) {
        output = [];
        start = -1;
      }
      if (e.type === 'object-end') {
        if (repeating && isAtEndOfTiming(i, timings)) {
          repeating = false;
        }
      }
    } else {
      if (!shouldDeleteBecauseOfSecondTimings(i, timings, repeating)) {
        output.push(e);
      }
    }
  }
  return output;
}

function getSoundedPitches(
  elements: Playback[],
  timings: PlaybackSecondTiming[],
  ctx: AudioContext,
  start: ID | null = null
): SoundedPitch[] {
  elements = expandRepeats(elements, timings, start);

  const gracenoteDuration = 0.044;

  const pitches: SoundedPitch[] = [];
  for (let i = 0; i < elements.length; i++) {
    const e = elements[i];
    if (e instanceof PlaybackGracenote) {
      pitches.push(new SoundedPitch(e.pitch, gracenoteDuration, ctx));
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
      pitches.push(new SoundedPitch(e.pitch, duration, ctx));
    } else {
      throw new Error('Unexpected playback element ' + e);
    }
  }
  return pitches;
}

export async function playback(
  state: PlaybackState,
  elements: Playback[],
  timings: PlaybackSecondTiming[],
  start: ID | null = null
): Promise<void> {
  if (state.playing || state.loading) return;

  const context = new AudioContext();

  state.playing = true;

  // Due to browser restrictions, await may not be used
  // until after sound has already been played

  document.body.classList.add('loading');

  const soundedPitches = getSoundedPitches(elements, timings, context, start);
  const drone = new Drones(drones, context);

  drone.play();
  await sleep(1000);
  document.body.classList.remove('loading');

  for (const note of soundedPitches) {
    if (state.userPressedStop) break;

    await note.play(settings.bpm);
  }

  drone.stop();

  state.userPressedStop = false;
  state.playing = false;
}
