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

import {
  PlaybackIndex,
  PlaybackMeasure,
  type PlaybackNote,
  type PlaybackSecondTiming,
  itemDuration,
} from '.';
import { dispatch } from '../Controller';
import { updateView } from '../Events/Misc';
import type { ID } from '../global/id';
import { settings } from '../global/settings';
import {
  isRoughlyZero,
  last,
  nlast,
  passert,
  sleep,
  sum,
  unreachable,
} from '../global/utils';
import { Drone, type SoundedMeasure, SoundedPitch, SoundedSilence } from './sounds';
import type { PlaybackState } from './state';

function shouldDeleteBecauseOfSecondTimings(
  index: PlaybackIndex,
  timings: PlaybackSecondTiming[],
  repeating: boolean
) {
  return timings.some((t) => t.shouldDeleteElement(index, repeating));
}

function inSecondTiming(index: PlaybackIndex, timings: PlaybackSecondTiming[]) {
  return timings.some((t) => t.in(index));
}

function sliceMeasures(
  measures: PlaybackMeasure[],
  start: PlaybackIndex | null,
  end: PlaybackIndex | null
) {
  if (start !== null) {
    measures.splice(0, start.measureIndex);
    const firstMeasure = measures[0];

    for (const part of firstMeasure.parts) {
      let partLength = 0;
      for (let itemIndex = 0; itemIndex < part.length; itemIndex++) {
        const item = part[itemIndex];

        if (isRoughlyZero(partLength - start.timeOffset)) {
          part.splice(0, itemIndex);
          break;
        }

        if (partLength > start.timeOffset) {
          // The last item was too long, shave off the difference
          // Note that the last item must be a note since it was
          // the thing that increased the partLength
          (part[itemIndex - 1] as PlaybackNote).duration -=
            partLength - start.timeOffset;

          part.splice(0, itemIndex - 1);
          break;
        }

        partLength += itemDuration(item);
      }
    }

    // Update the indices in end, since we've modified the underlying arrays
    if (end) {
      end.measureIndex -= start.measureIndex;
      if (end.measureIndex === 0) {
        end.timeOffset -= start.timeOffset;
      }
    }
  }

  if (end !== null) {
    measures.splice(end.measureIndex + 1);
    const lastMeasure = last(measures);

    for (const part of lastMeasure?.parts || []) {
      let partLength = 0;
      for (let itemIndex = 0; itemIndex < part.length; itemIndex++) {
        const item = part[itemIndex];

        if (isRoughlyZero(partLength - end.timeOffset)) {
          part.splice(itemIndex + 1);
          break;
        }

        if (partLength > end.timeOffset) {
          // The last item was too long, shave off the difference
          // Note that the last item must be a note since it was
          // the thing that increased the partLength
          // Note also that its gracenote won't be played, but that
          // is the desired behaviour when we're starting in the middle
          // of the note
          passert(part[itemIndex - 1].type === 'note');

          (part[itemIndex - 1] as PlaybackNote).duration -=
            partLength - end.timeOffset;

          part.splice(itemIndex);
          break;
        }

        partLength += itemDuration(item);
      }
    }
  }

  return measures;
}

/**
 * Duplicates playback items where necessary
 * for repeats / second timings, and removes the notes before start/after end.
 *
 * This code is not pretty.
 * @param measures
 * @param timings
 * @param start ID of item to start playback on
 * @param end ID of item to end playback on
 * @returns measures containing only notes, with timings expanded
 */
function expandRepeats(
  measures: PlaybackMeasure[],
  timings: PlaybackSecondTiming[],
  start: ID | null,
  end: ID | null
): PlaybackMeasure[] {
  // These are indices into measures
  let repeatStartIndex = 0;
  let repeatEndIndex = 0;

  let repeating = false;
  let timingOverRepeat: PlaybackSecondTiming | null = null;
  const output: PlaybackMeasure[] = [];

  // These are indices into the output array
  let startIndex: PlaybackIndex | null = null;
  let endIndex: PlaybackIndex | null = null;

  for (let measureIndex = 0; measureIndex < measures.length; measureIndex++) {
    const measure = measures[measureIndex];

    // Add measure to output
    output.push(new PlaybackMeasure([], false, false));

    for (let partIndex = 0; partIndex < measure.parts.length; partIndex++) {
      const part = measure.parts[partIndex];

      // Add part to output
      nlast(output).parts.push([]);

      // Indices into measures and output respectively
      let inputIndex = new PlaybackIndex(measureIndex, 0);
      let outputIndex = new PlaybackIndex(output.length - 1, 0);

      for (const item of part) {
        // If the item is a playback object and it corresponds to the start/end objects
        // assign startIndex/endIndex based on the current outputIndex
        if (
          item.type === 'object-start' &&
          item.id === start &&
          startIndex === null
        ) {
          startIndex = outputIndex;
        }
        if (item.type === 'object-end') {
          if (item.id === end && endIndex === null && startIndex !== null) {
            endIndex = outputIndex;
          }
          if (repeating) {
            if (timingOverRepeat) {
              // Only stop repeating when the timing that went over the repeat
              // mark is done (allowing other second timings to be present earlier
              // in a part)
              if (timingOverRepeat.end.isAtOrBefore(inputIndex)) {
                repeating = false;
              }
            }
          }
        }

        // Append the item to the current measure/part in the output
        if (!shouldDeleteBecauseOfSecondTimings(inputIndex, timings, repeating)) {
          nlast(output).parts[partIndex].push(item);
        }

        // Increase the indices by the duration of the item
        inputIndex = inputIndex.incrementByItem(item);
        outputIndex = outputIndex.incrementByItem(item);
      }
    }

    const inputIndexAfterMeasure = new PlaybackIndex(
      measureIndex,
      measure.lengthOfMainPart()
    );

    if (
      measure.repeatEnd &&
      repeating &&
      !inSecondTiming(inputIndexAfterMeasure, timings)
    ) {
      // If the measure has an end repeat, and we're already in a repeat, then
      // we're no longer repeating
      // Note: if there's a timing, we only
      //       stop repeating when the timing that went over the repeat
      //       mark is done (allowing other second timings to be present earlier
      //       in a part)
      repeating = false;
      repeatStartIndex = measureIndex;
    } else if (measure.repeatEnd && measureIndex > repeatEndIndex) {
      // If the measure has an end repeat, then set measureIndex back to repeatStartIndex
      timingOverRepeat = timings.find((t) => t.in(inputIndexAfterMeasure)) || null;
      repeatEndIndex = measureIndex;
      // Go back to repeat
      measureIndex = repeatStartIndex - 1;
      // Need to do this to avoid an infinite loop
      // if two end repeats are next to each other
      repeatStartIndex = measureIndex;
      repeating = true;
    } else if (measure.repeatStart) {
      // If the measure has a start repeat, set repeatStartIndex
      repeatStartIndex = measureIndex;
    }
  }

  return sliceMeasures(output, startIndex, endIndex);
}

// Collapses all adjacent notes with the same pitch to one note (with duration of both notes)
// This fixes playback of tied notes
function collapsePitches(measures: SoundedMeasure[]): SoundedMeasure[] {
  const lastPitches: SoundedPitch[] = [];
  const collapsed: SoundedMeasure[] = measures.map((measure) => ({
    parts: measure.parts.map((part, i) => {
      const newPart = [];
      for (const pitch of part) {
        if (pitch instanceof SoundedPitch) {
          if (lastPitches[i] && pitch.pitch === lastPitches[i].pitch) {
            lastPitches[i].durationIncludingTies += pitch.duration;
            newPart.push(new SoundedSilence(pitch.duration, pitch.id));
          } else {
            newPart.push(pitch);
            lastPitches[i] = pitch;
          }
        } else {
          console.error('Unexpected SoundedSilence', pitch);
        }
      }
      return newPart;
    }),
  }));

  return collapsed;
}

function getSoundedPitches(
  measures: PlaybackMeasure[],
  timings: PlaybackSecondTiming[],
  ctx: AudioContext,
  start: ID | null,
  end: ID | null
): SoundedMeasure[] {
  const measuresToPlay = expandRepeats(measures, timings, start, end);
  const gracenoteDuration = 0.044;

  const soundedMeasuresToPlay = measuresToPlay.map((measure) => ({
    parts: measure.parts.map((part) => {
      let currentGracenoteDuration = 0;
      const soundedPart: SoundedPitch[] = [];
      let currentID = null;

      for (const e of part) {
        switch (e.type) {
          case 'note': {
            const duration = e.duration - currentGracenoteDuration;
            soundedPart.push(new SoundedPitch(e.pitch, duration, ctx, currentID));
            currentGracenoteDuration = 0;
            break;
          }
          case 'gracenote': {
            soundedPart.push(
              new SoundedPitch(e.pitch, gracenoteDuration, ctx, currentID)
            );
            currentGracenoteDuration += gracenoteDuration;
            break;
          }
          case 'object-start': {
            currentID = e.id;
            break;
          }
          case 'object-end':
            break;
          default:
            unreachable(e);
        }
      }

      return soundedPart;
    }),
  }));

  return collapsePitches(soundedMeasuresToPlay);
}

export async function playback(
  state: PlaybackState,
  measures: PlaybackMeasure[],
  timings: PlaybackSecondTiming[],
  start: ID | null = null,
  end: ID | null = null,
  loop = false
): Promise<void> {
  if (state.playing || state.loading) return;

  const context = new AudioContext();

  state.playing = true;

  // Due to browser restrictions, await may not be used
  // until after sound has already been played

  document.body.classList.add('loading');

  const drone = new Drone(context);

  drone.start();

  await sleep(1000);
  document.body.classList.remove('loading');

  await playPitches(state, measures, timings, context, start, end, loop);

  drone.stop();

  state.playing = false;
}

async function playPitches(
  state: PlaybackState,
  measures: PlaybackMeasure[],
  timings: PlaybackSecondTiming[],
  context: AudioContext,
  start: ID | null,
  end: ID | null,
  loop: boolean
) {
  const measuresToPlay = getSoundedPitches(measures, timings, context, start, end);

  const numberOfItems = sum(
    measuresToPlay.flatMap((measure) => measure.parts.flatMap((part) => part.length))
  );

  if (numberOfItems === 0) {
    return;
  }

  let stopped = false;

  playing: do {
    for (const measure of measuresToPlay) {
      await Promise.all(
        measure.parts.map(async (pitchlist, i) => {
          for (const pitch of pitchlist) {
            if (state.userPressedStop || stopped) {
              stopped = true;
              return;
            }

            await pitch.play(settings.bpm, i !== 0);
          }
        })
      );

      if (stopped) {
        break playing;
      }
    }
  } while (loop);

  state.userPressedStop = false;
  dispatch(updateView());
}
