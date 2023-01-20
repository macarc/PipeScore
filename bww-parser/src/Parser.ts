import {
  Accidental,
  Bar,
  Dot,
  DoubleGracenote,
  Embellishment,
  Note,
  NoteAccidental,
  NoteGroup,
  NoteGroupType,
  Score,
  Stave,
  TimeSignature,
  Token,
  TokenType,
} from '../types/main';
import { embellishment } from './parser/embellishment';
import { headers } from './parser/header';
import { TokenStream } from './Tokeniser';

enum TieingState {
  NotTieing,
  OldTieFormat,
  NewTieFormat,
}

let tieing = TieingState.NotTieing;

export function parse(data: string): Score {
  const ts = new TokenStream(data);
  return score(ts);
}

function score(ts: TokenStream) {
  return {
    name: '',
    headers: headers(ts),
    staves: staves(ts),
  };
}

function staves(ts: TokenStream) {
  const staves = [];

  while (ts.match(TokenType.CLEF)) {
    staves.push(stave(ts));
  }

  return staves;
}

function stave(ts: TokenStream): Stave {
  const key = keySignature(ts);
  const time = timeSignature(ts);

  let bars_: Bar[] = [];

  const doesRepeat = beginStave(ts);

  if (hasNote(ts)) {
    bars_ = bars(ts);
  }

  endStave(ts);

  return {
    repeat: doesRepeat,
    clef: {
      key: key,
      time: time,
    },
    bars: bars_,
  };
}

// Returns true if stave starts with a repeat
function beginStave(ts: TokenStream): boolean {
  const token = ts.matchToken(TokenType.PART_BEGINNING);
  return token !== null && token.value[1] !== undefined;
}

function endStave(ts: TokenStream) {
  ts.matchAny(TokenType.PART_END, TokenType.TERMINATING_BAR_LINE);
}

function bars(ts: TokenStream): Bar[] {
  const bars = [];

  timeLineStart(ts);

  bars.push(bar(ts));
  while (ts.match(TokenType.BAR_LINE)) {
    bars.push(bar(ts));
  }

  return bars;
}

function hasNote(ts: TokenStream): boolean {
  return ts.peekAny(
    TokenType.MELODY_NOTE,
    TokenType.TIME_LINE_START,
    TokenType.TIE_START,
    TokenType.IRREGULAR_GROUP_START,
    TokenType.TRIPLET_NEW_FORMAT,
    TokenType.TRIPLET_OLD_FORMAT,
    TokenType.REST,
    TokenType.FERMATA,
    TokenType.ACCIDENTAL,
    TokenType.DOUBLING,
    TokenType.STRIKE,
    TokenType.REGULAR_GRIP,
    TokenType.COMPLEX_GRIP,
    TokenType.TAORLUATH,
    TokenType.BUBBLY,
    TokenType.BIRL,
    TokenType.THROW,
    TokenType.PELE,
    TokenType.DOUBLE_STRIKE,
    TokenType.TRIPLE_STRIKE,
    TokenType.DOUBLE_GRACENOTE,
    TokenType.GRACENOTE
  );
}

function bar(ts: TokenStream): Bar {
  let notes: Note[] = [];

  while (hasNote(ts)) {
    timeLineStart(ts);

    if (ts.is(TokenType.TRIPLET_OLD_FORMAT)) {
      notes = tripletOldFormat(ts, notes);
    } else if (ts.is(TokenType.IRREGULAR_GROUP_START)) {
      notes.push(irregularGroup(ts, TokenType.IRREGULAR_GROUP_START));
    } else if (ts.is(TokenType.TRIPLET_NEW_FORMAT)) {
      notes.push(irregularGroup(ts, TokenType.TRIPLET_NEW_FORMAT));
    } else {
      notes.push(note(ts));
    }
  }

  timeLineEnd(ts);

  return {
    notes: notes,
  };
}

function timeLineStart(ts: TokenStream) {
  ts.match(TokenType.TIME_LINE_START);
}

function timeLineEnd(ts: TokenStream) {
  ts.match(TokenType.TIME_LINE_END);
}

// A note or triplet, possibly with an embellishment
function note(ts: TokenStream): Note {
  timeLineStart(ts);
  const startedToTie = tieBeforeNote(ts);
  const embellishment_ = embellishment(ts);
  timeLineStart(ts);
  let note_ = blankNote();

  if (ts.is(TokenType.TRIPLET_NEW_FORMAT)) {
    note_ = irregularGroup(ts, TokenType.TRIPLET_NEW_FORMAT);
    if ('embellishment' in note_.value.notes[0].value) {
      note_.value.notes[0].value.embellishment = embellishment_;
    }
  } else {
    note_ = melodyNote(ts, startedToTie, embellishment_);
  }
  timeLineEnd(ts);
  return note_;
}

// A note or rest, without any embellishments
function melodyNote(
  ts: TokenStream,
  tiedBefore: boolean,
  embellishment: Embellishment | DoubleGracenote
): Note {
  const accidental_: NoteAccidental = ts.is(TokenType.ACCIDENTAL)
    ? accidental(ts).type
    : 'none';
  const startedToTie = tieBeforeNote(ts);
  let token: Token | null = null;
  let note_ = blankNote();

  if ((token = ts.matchToken(TokenType.REST))) {
    note_ = {
      type: 'rest',
      value: { length: token.value[1] },
    };
  } else if ((token = ts.eat(TokenType.MELODY_NOTE))) {
    const hasFermata = fermata(ts);
    note_ = {
      type: 'note',
      value: {
        length: token.value[3],
        pitch: token.value[1],
        accidental: accidental_,
        tied: tieing !== TieingState.NotTieing,
        fermata: hasFermata,
        dot: dot(ts),
        embellishment: embellishment,
      },
    };
  }

  if (tieing === TieingState.OldTieFormat) {
    tieing = TieingState.NotTieing;
  }

  tieAfterNote(ts, tiedBefore || startedToTie);

  return note_;
}

function tripletOldFormat(ts: TokenStream, notes: Note[]): Note[] {
  const groupNotes: Note[] = [];
  ts.eat(TokenType.TRIPLET_OLD_FORMAT);
  for (let i = 0; i < 3; i++) {
    const note = notes.pop();

    if (note) {
      groupNotes.push(note);
    } else {
      throw new Error('Missing note in triplet');
    }
  }

  notes.push({
    type: 'triplet',
    value: {
      notes: groupNotes.reverse(),
    },
  });

  return notes;
}

function irregularGroup(ts: TokenStream, startingToken: TokenType): NoteGroup {
  const token = ts.eat(startingToken);
  const size = transformIrregularGroupToSize(token.value[1]);
  let notes: Note[] = [];

  for (let i = 0; i < size; i++) {
    notes.push(note(ts));
  }

  eatIrregularGroupEnd(ts);

  return {
    type: getGroupType(size),
    value: {
      notes: notes,
    },
  };
}

function eatIrregularGroupEnd(ts: TokenStream): void {
  if (
    !ts.matchAny(TokenType.IRREGULAR_GROUP_END, TokenType.TRIPLET_OLD_FORMAT)
  ) {
    throw new SyntaxError(`Expected irregular group end or triplet old format`); //, got ${ts.current?.type}`)
  }
}

function transformIrregularGroupToSize(group: string): number {
  switch (group) {
    case '2':
      return 2;
    case '3':
      return 3;
    case '43':
      return 4;
    case '46':
      return 4;
    case '53':
      return 5;
    case '54':
      return 5;
    case '64':
      return 6;
    case '74':
      return 7;
    case '76':
      return 7;
  }

  throw Error(`Unable transform group to size: ${group}`);
}

function getGroupType(size: number): NoteGroupType {
  switch (size) {
    case 1:
      return 'single';
    case 2:
      return 'duplet';
    case 3:
      return 'triplet';
    case 4:
      return 'quadruplet';
    case 5:
      return 'quintuplet';
    case 6:
      return 'sextuplet';
    case 7:
      return 'septuplet';
  }

  throw Error(`Unable to match group size: ${size}`);
}

function tieBeforeNote(ts: TokenStream) {
  return ts.match(TokenType.TIE_START);
}

function tieAfterNote(ts: TokenStream, tieBeforeNote: boolean) {
  if (tieBeforeNote) {
    tieing = TieingState.NewTieFormat;
  }
  const token = ts.matchToken(TokenType.TIE_END_OR_TIE_OLD_FORMAT);
  if (token) {
    if (tieing === TieingState.NewTieFormat && token.value[1] === 'e') {
      tieing = TieingState.NotTieing;
    } else {
      tieing = TieingState.OldTieFormat;
    }
  }
}

function fermata(ts: TokenStream): boolean {
  return ts.match(TokenType.FERMATA);
}

function dot(ts: TokenStream): Dot {
  const token = ts.matchToken(TokenType.DOTTED_NOTE);
  if (token) {
    return token.value[1].length === 1 ? 'single' : 'double';
  }

  return 'none';
}

function keySignature(ts: TokenStream): Accidental[] {
  const accidentals: Accidental[] = [];

  while (ts.is(TokenType.ACCIDENTAL)) {
    accidentals.push(accidental(ts));
  }

  return accidentals;
}

function accidental(ts: TokenStream): Accidental {
  const token = ts.eat(TokenType.ACCIDENTAL);

  const type = token.value[1];

  if (type === 'sharp' || type === 'flat' || type === 'natural') {
    return {
      type,
      note: token.value[2],
    };
  }

  throw new Error(`Unable to match accidental type: ${type}`);
}

function timeSignature(ts: TokenStream): TimeSignature {
  const token = ts.matchToken(TokenType.TIME_SIGNATURE);
  if (token) {
    if (token.value[1]) {
      return {
        top: token.value[1],
        bottom: token.value[2],
      };
    } else if (token.value[3]) {
      return {
        type: 'cut',
      };
    } else {
      return {
        type: 'common',
      };
    }
  }

  return {};
}

function blankNote(): Note {
  return { type: 'rest', value: { length: 'default blank note' } };
}
