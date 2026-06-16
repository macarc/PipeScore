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

//  The format in which scores are saved to Firebase
//  Many of these contained 'undefined' fields, for backwards compatibility
//  (a new field that is not defined in older scores)

import type { Duration } from './Note/notelength';
import type { ID } from './global/id';
import type { Pitch } from './global/pitch';
import { SUBTITLE_SIZE, Settings, TITLE_SIZE } from './global/settings';

// Overview of the format:
//
// Each score is stored as a SavedData object. There are 3 versions
// that could be stored - SavedScorev{1,2,3} - due to changes in
// the format over time as features have been added. All 3 must be able
// to be loaded. SavedScorev2 also has two different types of SavedTune
// it could contain, SavedTunev{1,2}. SavedScorev3 only contains SavedTunev2.
//
// The resolution of these different versions is done in the updateScoreVersion()
// function, which turns any (potentially old) SavedData object into a SavedScorev3.
//
// Separately to these versioned types, every type of score can contain
// bars as SavedMeasures OR DeprecatedSavedMeasures, and SavedNoteOrTriplets
// OR DeprecatedSavedNoteOrTriplets.
//
// The resolution of these deprecated types is done in Measure.fromJSON and
// noteFromJSON, rather than in this file, since it requires modifying deep
// within the SavedData structure.
//
// TODO it would be a better idea to update the Deprecated* types in
// updateScoreVersion() (or something else, called every time on load),
// so that the rest of the code need not deal with multiple versions.
//
// Finally, when a score is first created, it is initialised as a stub
// which is set to a full score when the user first opens the score and
// adjusts the initial settings.

/**
 * Check if saved data is a newly-created score without any data yet.
 * @param data 
 * @returns 
 */
export function isJustCreatedScore(data: SavedData): data is JustCreatedScore {
  return (data as JustCreatedScore).justCreated === true;
}

function istunev1(tune: SavedTunev1 | SavedTunev2): tune is SavedTunev1 {
  return typeof tune.name === 'string';
}

function isv1(score: SavedData): score is SavedScorev1 {
  return (score as SavedScorev1)._staves !== undefined;
}

function isv2(score: SavedData): score is SavedScorev2 {
  return (
    (score as SavedScorev2).tunes !== undefined &&
    (score as SavedScorev3).version === undefined
  );
}

export function isLatestScoreVersion(score: SavedData): score is SavedScorev3 {
  return (score as SavedScorev3).version === 'v3';
}

/**
 * Update a saved tune to version 2, if it is not already.
 * @param tune 
 * @returns 
 */
function updateTuneVersion(tune: SavedTunev1 | SavedTunev2): SavedTunev2 {
  if (istunev1(tune)) {
    return {
      name: { text: tune.name, font: 'sans-serif', size: TITLE_SIZE },
      composer: { text: tune.composer, font: 'sans-serif', size: SUBTITLE_SIZE },
      tuneType: { text: tune.tuneType, font: 'sans-serif', size: SUBTITLE_SIZE },
      tuneGap: Settings.defaultTuneGap,
      staves: tune.staves,
    };
  }

  return tune;
}

/**
 * Update a score to version 3, if it is not already.
 * @param score 
 * @returns 
 */
export function updateScoreVersion(
  score: SavedScorev1 | SavedScorev2 | SavedScorev3
): SavedScorev3 {
  if (isLatestScoreVersion(score)) {
    return score;
  }

  if (isv1(score)) {
    const name = score.textBoxes[0]?.texts?.[0]?._text || 'My Tune';
    const composer = score.textBoxes[0]?.texts?.[1]?._text || 'Composer';
    const tuneType = score.textBoxes[0]?.texts?.[2]?._text || 'Tune Type';
    score.textBoxes[0]?.texts?.splice(0, 3);

    return {
      version: 'v3',
      scoreName: score.name,
      landscape: score.landscape,
      textBoxes: score.textBoxes,
      tunes: [
        updateTuneVersion({
          name,
          composer,
          tuneType,
          staves: score._staves,
          tuneGap: Settings.defaultTuneGap,
        }),
      ],
      secondTimings: score.secondTimings,
      showNumberOfPages: score.showNumberOfPages,
      settings: score.settings,
    };
  }

  if (isv2(score)) {
    // The name might be stored in one of 2 places:
    // - in the `name` field of the first tune (legacy)
    // - in the `name.text` field of the first tune (legacy)
    const text = score.tunes?.[0]?.name;
    const name = typeof text === 'string' ? text : text?.text;

    return {
      ...score,
      tunes: score.tunes.map(updateTuneVersion),
      scoreName: name || 'Empty Score',
      version: 'v3',
    };
  }

  // never
  return score;
}

export type SavedData =
  | SavedScorev1
  | SavedScorev2
  | SavedScorev3
  | JustCreatedScore;

export type JustCreatedScore = {
  scoreName: string;
  justCreated: true;
};

export type SavedScorev1 = {
  version: undefined;
  name: string;
  landscape: boolean;
  _staves: SavedStave[];
  textBoxes: SavedTextBoxPage[];
  secondTimings: SavedTiming[];
  showNumberOfPages: boolean;
  settings: SavedSettings;
};

export type SavedScorev2 = {
  version: undefined;
  landscape: boolean;
  tunes: (SavedTunev1 | SavedTunev2)[];
  textBoxes: SavedTextBoxPage[];
  secondTimings: SavedTiming[];
  showNumberOfPages: boolean;
  settings: SavedSettings;
};

export type SavedScorev3 = {
  version: 'v3';
  scoreName: string;
  landscape: boolean;
  tunes: SavedTunev2[];
  textBoxes: SavedTextBoxPage[];
  secondTimings: SavedTiming[];
  showNumberOfPages: boolean;
  settings: SavedSettings;
};

export type SavedSettings = {
  bpm: number;
  staveGap: number;
  lineGap: number;
  harmonyGap: number;
  margin: number;
  gapAfterGracenote: number;
  harmonyVolume: number;
  instrument: string;
};

// name/tuneType/composer were originally string,
// preserved for backwards compatibility
export type SavedTunev1 = {
  name: string;
  tuneType: string;
  composer: string;
  staves: SavedStave[];
  tuneGap: number;
};

export type SavedTunev2 = {
  name: SavedStaticTextBox;
  tuneType: SavedStaticTextBox;
  composer: SavedStaticTextBox;
  staves: SavedStave[];
  tuneGap: number;
};

export type SavedStave = {
  // Called bars for backwards compatibility
  bars: (SavedMeasure | DeprecatedSavedMeasure)[];
  numberOfParts: number | undefined;
};

export type SavedMeasure = {
  isAnacrusis: boolean;
  timeSignature: SavedTimeSignature;
  bars: SavedBar[];
  width: 'auto' | number | undefined;
  frontBarline: SavedBarline;
  backBarline: SavedBarline;
};

export type SavedBar = {
  id: ID;
  notes: SavedNoteOrTriplet[];
};

export type SavedBarline = {
  type: 'normal' | 'repeat' | 'end';
};

export type SavedTimeSignature = {
  ts: [number, 2 | 4 | 8] | 'cut time' | 'common time';
  breaks: number[];
};

export type SavedNote = {
  id: ID | undefined;
  pitch: Pitch;
  length: Duration;
  tied: boolean;
  hasNatural: boolean | undefined;
  gracenote: SavedGracenote;
};

export type SavedTriplet = {
  id: ID | undefined;
  length: Duration;
  notes: SavedNote[];
};

export type SavedNoteOrTriplet =
  | {
      notetype: 'single';
      value: SavedNote;
    }
  | {
      notetype: 'triplet';
      value: SavedTriplet;
    }
  | DeprecatedSavedNoteOrTriplet;

export type SavedReactiveGracenote = {
  grace: string;
};

export type SavedSingleGracenote = {
  note: Pitch;
};

export type SavedCustomGracenote = {
  pitches: Pitch[];
};

export type SavedGracenote =
  | {
      type: 'reactive';
      value: SavedReactiveGracenote;
    }
  | {
      type: 'single';
      value: SavedSingleGracenote;
    }
  | {
      type: 'custom';
      value: SavedCustomGracenote;
    }
  | {
      type: 'none';
    };

export type SavedTextBoxPage = {
  texts: SavedMovableTextBox[];
};

export type SavedStaticTextBox = {
  size: number;
  text: string;
  font: 'sans-serif' | 'serif' | undefined;
};

export type SavedMovableTextBox = {
  x: number;
  y: number;
  size: number;
  _text: string;
  centred: boolean;
  font: 'sans-serif' | 'serif' | undefined;
};

export type SavedSecondTiming = {
  start: ID;
  middle: ID;
  end: ID;
  firstText: string;
  secondText: string;
};

export type SavedSingleTiming = {
  start: ID;
  end: ID;
  text: string;
};

export type SavedTiming =
  | {
      type: 'second timing';
      value: SavedSecondTiming;
    }
  | {
      type: 'single timing';
      value: SavedSingleTiming;
    };

export type DeprecatedSavedMeasure = {
  id: ID;
  isAnacrusis: boolean;
  timeSignature: SavedTimeSignature;
  notes: SavedNoteOrTriplet[];
  width: 'auto' | number | undefined;
  frontBarline: SavedBarline;
  backBarline: SavedBarline;
};

export type DeprecatedSavedNoteOrTriplet =
  | {
      notetype: 'single';
      // deprecated : use id in SavedNote instead
      id: ID;
      value: SavedNote;
    }
  | {
      notetype: 'triplet';
      // deprecated : use id in SavedTriplet instead
      id: ID;
      value: SavedTriplet;
    };

export function isDeprecatedSavedNoteOrTriplet(
  noteOrTriplet: SavedNoteOrTriplet
): noteOrTriplet is DeprecatedSavedNoteOrTriplet {
  return (noteOrTriplet as DeprecatedSavedNoteOrTriplet).id !== undefined;
}

export function isDeprecatedSavedMeasure(
  m: SavedMeasure | DeprecatedSavedMeasure
): m is DeprecatedSavedMeasure {
  return (m as DeprecatedSavedMeasure).notes !== undefined;
}
