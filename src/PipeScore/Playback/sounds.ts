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
import type { Pitch } from '../global/pitch';
import { settings } from '../global/settings';
import { sleep } from '../global/utils';
import { Sample } from './audio';
import { getInstrumentResources, pitchToAudioResource } from './resources';

/**
 * Drone playback.
 */
export class Drone {
  private sample: Sample | null;
  private stopped = false;

  constructor(context: AudioContext) {
    const drones = getInstrumentResources().drones;
    this.sample = drones && new Sample(drones, context);
  }

  /**
   * Start the drone, looping forever until .stop() is called.
   */
  async start() {
    while (!this.stopped && this.sample) {
      this.sample.start(0.1);
      const sleepLength = this.sample.duration() - 3;
      await sleep(1000 * sleepLength);
    }
  }

  /**
   * Stop the drone.
   */
  stop() {
    if (this.sample) {
      this.sample.stop();
    }
    this.stopped = true;
  }
}

/**
 * Pitched note playback (used for notes and gracenotes).
 */
export class SoundedPitch {
  private sample: Sample;

  public id: ID | null;
  public pitch: Pitch;

  // The length of time to pause for after starting to play
  public duration: number;

  // The length of time to actually play for
  // If this is longer than duration, then .play() returns but keeps playing
  // the note. This is required for playing ties over barlines -
  // see SoundedSilence for details.
  public durationIncludingTies: number;

  constructor(pitch: Pitch, duration: number, ctx: AudioContext, id: ID | null) {
    this.sample = new Sample(pitchToAudioResource(pitch), ctx);
    this.pitch = pitch;
    this.duration = duration;
    this.durationIncludingTies = duration;
    this.id = id;
  }

  /**
   * Play the note.
   * @param bpm beats per minute
   * @param isHarmony true if the pitch is in a harmony part (affects volume and cursor updates)
   */
  async play(bpm: number, isHarmony: boolean) {
    if (!isHarmony) {
      dispatch(updatePlaybackCursor(this.id));
    }

    const duration = (1000 * this.duration * 60) / bpm;
    const tieDuration =
      (1000 * (this.durationIncludingTies - this.duration) * 60) / bpm;
    const gain = isHarmony ? settings.harmonyVolume : 1;
    this.sample.start(gain);
    await sleep(duration);
    setTimeout(() => this.sample.stop(), tieDuration);
  }
}

/**
 * Silence for a given duration.
 *
 * This is needed because, for tied note playback:
 * - the note should sound continuous
 * - the cursor should update to the new note
 * - it should sound continuous even over multiple bar lines
 *   (hard since we synchronise between parts at bar lines)
 *
 * The solution is to split up a tied note into its constituent notes,
 * then set .durationIncludingTies on the first note (so that the first
 * note plays for the full length, but the .play() function returns after
 * its normal length), and then emit SoundedSilence objects for each
 * next tied note. Then the cursor is updated, synchronisation can still
 * happen, and the note sounds continuous.
 */
export class SoundedSilence {
  private duration: number;
  private id: ID | null;

  constructor(duration: number, id: ID | null) {
    this.duration = duration;
    this.id = id;
  }

  async play(bpm: number, isHarmony: boolean) {
    if (!isHarmony) {
      dispatch(updatePlaybackCursor(this.id));
    }

    const duration = (1000 * this.duration * 60) / bpm;
    await sleep(duration);
  }
}

export type SoundedMeasure = {
  parts: (SoundedPitch | SoundedSilence)[][];
};
