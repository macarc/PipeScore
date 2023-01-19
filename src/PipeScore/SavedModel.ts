import { ID } from './global/id';
import { Pitch } from './global/pitch';
import { NoteLength } from './Note/notelength';

export function scoreIsPresent(data: SavedData): data is SavedScore {
  return (data as { justCreated: true }).justCreated !== true;
}

export type SavedData = SavedScore | { name: string; justCreated: true };

export type SavedScore = {
  name: string;
  landscape: boolean;
  _staves: SavedStave[];
  textBoxes: SavedTextBoxPage[];
  secondTimings: SavedTiming[];
  numberOfPages: number;
  showNumberOfPages: boolean;
  settings: SavedSettings;
};

export type SavedStave = {
  bars: SavedBar[];
};

export type SavedBar = {
  id: ID;
  isAnacrusis: boolean;
  timeSignature: SavedTimeSignature;
  notes: SavedNoteOrTriplet[];
  width: 'auto' | number | undefined;
  frontBarline: SavedBarline;
  backBarline: SavedBarline;
};

export type SavedBarline = {
  type: 'normal' | 'repeat' | 'end';
};

export type SavedTimeSignature = {
  ts: [number, 2 | 4 | 8] | 'cut time';
  breaks: number[];
};

export type SavedNote = {
  pitch: Pitch;
  length: NoteLength;
  tied: boolean;
  hasNatural: boolean | undefined;
  gracenote: SavedGracenote;
};

export type SavedTriplet = {
  length: NoteLength;
  notes: SavedNote[];
};

export type SavedNoteOrTriplet =
  | {
      notetype: 'single';
      id: ID;
      value: SavedNote;
    }
  | {
      notetype: 'triplet';
      id: ID;
      value: SavedTriplet;
    };

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
  texts: SavedTextBox[];
};

export type SavedTextBox = {
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

export type SavedSettings = {
  staveGap: number;
  lineGap: number;
  margin: number;
  topOffset: number;
};
