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

//  Functions for loading AudioResources corresponding to samples that are played
//  during playback.

import { Instrument } from '../global/instrument';
import { Pitch } from '../global/pitch';
import { settings } from '../global/settings';
import { unreachable } from '../global/utils';
import { AudioResource } from './audio';

/**
 * InstrumentResources holds the audio resources associated with an instrument
 * (GHB or chanter, could be expanded in future)
 */
type InstrumentResources = {
  lowg: AudioResource;
  lowa: AudioResource;
  b: AudioResource;
  c: AudioResource;
  d: AudioResource;
  e: AudioResource;
  f: AudioResource;
  highg: AudioResource;
  higha: AudioResource;
  drones: AudioResource | null;
};

const ghb: InstrumentResources = {
  lowg: new AudioResource('GHB/lowg'),
  lowa: new AudioResource('GHB/lowa'),
  b: new AudioResource('GHB/b'),
  c: new AudioResource('GHB/c'),
  d: new AudioResource('GHB/d'),
  e: new AudioResource('GHB/e'),
  f: new AudioResource('GHB/f'),
  highg: new AudioResource('GHB/highg'),
  higha: new AudioResource('GHB/higha'),
  drones: new AudioResource('GHB/drones'),
};

const chanter: InstrumentResources = {
  lowg: new AudioResource('chanter/lowg'),
  lowa: new AudioResource('chanter/lowa'),
  b: new AudioResource('chanter/b'),
  c: new AudioResource('chanter/c'),
  d: new AudioResource('chanter/d'),
  e: new AudioResource('chanter/e'),
  f: new AudioResource('chanter/f'),
  highg: new AudioResource('chanter/highg'),
  higha: new AudioResource('chanter/higha'),
  drones: null,
};

/**
 * Load all audio resources for the given instrument.
 * @param resources samples to load
 * @param context AudioContext to load samples with
 * @returns
 */
function loadInstrumentResources(
  resources: InstrumentResources,
  context: AudioContext
) {
  return Promise.all([
    resources.lowg.load(context),
    resources.lowa.load(context),
    resources.b.load(context),
    resources.c.load(context),
    resources.d.load(context),
    resources.e.load(context),
    resources.f.load(context),
    resources.highg.load(context),
    resources.higha.load(context),
    resources.drones?.load(context),
  ]);
}

/**
 * Get the InstrumentResources corresponding to the user selected
 * playback instrument.
 */
export function getInstrumentResources(): InstrumentResources {
  return settings.instrument === Instrument.Chanter
    ? chanter
    : settings.instrument === Instrument.GHB
      ? ghb
      : unreachable(settings.instrument);
}

// This is in a function (rather than at the top level)
// so that sample loading can be delayed, so that images
// are loaded first. Hackity hackity.

/**
 * Load the audio files necessary for playback.
 * @returns a promise which resolves when all resources are loaded
 */
export async function loadAudioResources() {
  const context = new AudioContext();
  loadInstrumentResources(ghb, context);
  loadInstrumentResources(chanter, context);
}

/**
 * Get the AudioResource associated with the pitch.
 * @param pitch
 * @returns the audio resource
 */
export function pitchToAudioResource(pitch: Pitch): AudioResource {
  const resources = getInstrumentResources();
  switch (pitch) {
    case Pitch.G:
      return resources.lowg;
    case Pitch.A:
      return resources.lowa;
    case Pitch.B:
      return resources.b;
    case Pitch.C:
      return resources.c;
    case Pitch.D:
      return resources.d;
    case Pitch.E:
      return resources.e;
    case Pitch.F:
      return resources.f;
    case Pitch.HG:
      return resources.highg;
    case Pitch.HA:
      return resources.higha;
  }
}
