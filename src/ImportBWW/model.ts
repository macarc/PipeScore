import { TokenType } from './token';

export type Score = {
  name: string;
  headers: (Header | TextTagHeader | SoftwareHeader)[];
  staves: Stave[];
};

export type Stave = {
  repeat: boolean;
  clef: {
    key: Accidental[];
    time: TimeSignature;
  };
  bars: Bar[];
};

export type Accidental = {
  type: 'sharp' | 'natural' | 'flat';
  note: string;
};

export type TimeSignature = {
  type?: 'cut' | 'common';
  top?: string;
  bottom?: string;
};

export type Bar = {
  notes: Note[];
};

export type Note = NoteValue | NoteGroup | Rest;

export type NoteValue = {
  type: 'note';
  value: {
    length: string;
    pitch: string;
    accidental: NoteAccidental;
    tied: boolean;
    fermata: boolean;
    dot: Dot;
    embellishment?: Embellishment | DoubleGracenote;
    embellishments?: (Embellishment | DoubleGracenote)[];
  };
};

export type NoteGroup = {
  type: NoteGroupType;
  value: {
    notes: Note[];
  };
};

export type Rest = {
  type: 'rest';
  value: {
    length: string;
  };
};

export type Dot = 'none' | 'single' | 'double';
export type NoteAccidental = 'sharp' | 'natural' | 'flat' | 'none';
export type NoteGroupType =
  | 'single'
  | 'duplet'
  | 'triplet'
  | 'quadruplet'
  | 'quintuplet'
  | 'sextuplet'
  | 'septuplet';

export type DoubleGracenote = {
  type: string;
  value?: {
    notes: string[];
  };
};

export type Embellishment = {
  type?: string;
  value?: {
    note: string;
  };
};

export type Header = {
  type: TokenType;
  value: string;
};

export type TextTagHeader = {
  type: TokenType;
  value: {
    text: string;
    textType: string;
  };
};

export type SoftwareHeader = {
  type: TokenType;
  value: {
    program: string;
    version: string;
  };
};
