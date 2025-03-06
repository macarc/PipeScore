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

//  Drone and SoundedPitch classes enable playback of drones and notes (including gracenotes).

import { dispatch } from '../Controller';
import { updatePlaybackCursor } from '../Events/Playback';
import type { ID } from '../global/id';
import { Pitch } from '../global/pitch';
import { settings } from '../global/settings';
import { sleep } from '../global/utils';
import { AudioResource, Sample } from './sample';

/**
 * Drone playback.
 */
export class Drone {
  private sample: Sample;
  private stopped = false;

  constructor(context: AudioContext) {
    this.sample = new Sample(drones, context);
  }

  /**
   * Start the drone, looping forever until .stop() is called.
   */
  async start() {
    while (!this.stopped) {
      this.sample.start(0.1);
      const sleepLength = this.sample.length() - 3;
      await sleep(1000 * sleepLength);
    }
  }

  /**
   * Stop the drone.
   */
  stop() {
    this.sample.stop();
    this.stopped = true;
  }
}

/**
 * Pitched note playback (used for notes and gracenotes).
 */
export class SoundedPitch {
  private sample: Sample;
  private id: ID | null;

  public pitch: Pitch;
  public duration: number;

  constructor(pitch: Pitch, duration: number, ctx: AudioContext, id: ID | null) {
    this.sample = new Sample(pitchToAudioResource(pitch), ctx);
    this.pitch = pitch;
    this.duration = duration;
    this.id = id;
  }

  /**
   * Play the note.
   * @param bpm beats per minute
   * @param isHarmony true if the pitch is in a harmony part (affects volume and cursor updates)
   */
  async play(bpm: number, isHarmony: boolean) {
    if (isHarmony) {
      dispatch(updatePlaybackCursor(this.id));
    }

    const duration = (1000 * this.duration * 60) / bpm;
    const gain = isHarmony ? settings.harmonyVolume : 1;
    this.sample.start(gain);
    await sleep(duration);
    this.sample.stop();
  }
}

// Audio Resource Loading

const lowg = new AudioResource('lowg');
const lowa = new AudioResource('lowa');
const b = new AudioResource('b');
const c = new AudioResource('c');
const d = new AudioResource('d');
const e = new AudioResource('e');
const f = new AudioResource('f');
const highg = new AudioResource('highg');
const higha = new AudioResource('higha');
const drones = new AudioResource('drones');

// This is in a function (rather than at the top level)
// so that sample loading can be delayed, so that images
// are loaded first. Hackity hackity.

/**
 * Load the audio files necessary for playback.
 * @returns a promise which resolves when all resources are loaded
 */
export async function loadAudioResources() {
  const context = new AudioContext();
  return Promise.all([
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
  ]);
}

/**
 * Get the AudioResource associated with the pitch.
 * @param pitch
 * @returns the audio resource
 */
function pitchToAudioResource(pitch: Pitch): AudioResource {
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
