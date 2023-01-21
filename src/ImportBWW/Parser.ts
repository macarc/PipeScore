import {
  SavedBar,
  SavedGracenote,
  SavedNote,
  SavedNoteOrTriplet,
  SavedScore,
  SavedStave,
  SavedTimeSignature,
  SavedTriplet,
} from '../PipeScore/SavedModel';
import { Token, TokenType } from './token';
import { embellishment } from './parser/embellishment';
import { headers } from './parser/header';
import { TokenStream } from './Tokeniser';
import { Settings } from '../PipeScore/global/settings';
import { genId } from '../PipeScore/global/id';
import { dotLength, NoteLength } from '../PipeScore/Note/notelength';
import { toPitch } from './parser/pitch';

enum TieingState {
  NotTieing,
  OldTieFormat,
  NewTieFormat,
}

let tieing = TieingState.NotTieing;
let currentTimeSignature: SavedTimeSignature = { ts: [2, 4], breaks: [] };

export function parse(data: string): [SavedScore, string[]] {
  const ts = new TokenStream(data);
  return [score(ts), ts.warnings];
}

function score(ts: TokenStream): SavedScore {
  headers(ts);
  return {
    name: '',
    _staves: staves(ts),
    landscape: true,
    textBoxes: [],
    // FIXME: how to find the number of pages?
    numberOfPages: 1,
    showNumberOfPages: true,
    secondTimings: [],
    settings: new Settings().toJSON(),
  };
}

function staves(ts: TokenStream): SavedStave[] {
  const staves: SavedStave[] = [];

  while (ts.match(TokenType.CLEF)) {
    staves.push(stave(ts));
  }

  return staves;
}

function stave(ts: TokenStream): SavedStave {
  const key = keySignature(ts);
  currentTimeSignature = timeSignature(ts);

  let bars_: SavedBar[] = [];

  const doesRepeat = beginStave(ts);

  if (hasNote(ts)) {
    bars_ = bars(ts);
  }

  if (bars_.length > 0) {
    if (doesRepeat) {
      bars_[0].frontBarline.type = 'repeat';
    }
  }

  endStave(ts);

  return {
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

function bars(ts: TokenStream): SavedBar[] {
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

function bar(ts: TokenStream): SavedBar {
  let notes: SavedNoteOrTriplet[] = [];

  while (hasNote(ts)) {
    timeLineStart(ts);

    if (ts.is(TokenType.TRIPLET_OLD_FORMAT)) {
      notes.push({
        notetype: 'triplet',
        id: genId(),
        value: tripletOldFormat(ts, notes.splice(note.length - 3)),
      });
    } else if (ts.is(TokenType.IRREGULAR_GROUP_START)) {
      notes.push({
        notetype: 'triplet',
        id: genId(),
        value: irregularGroup(ts, TokenType.IRREGULAR_GROUP_START),
      });
    } else if (ts.is(TokenType.TRIPLET_NEW_FORMAT)) {
      notes.push({
        notetype: 'triplet',
        id: genId(),
        value: irregularGroup(ts, TokenType.TRIPLET_NEW_FORMAT),
      });
    } else {
      notes.push(note(ts));
    }
  }

  timeLineEnd(ts);

  return {
    id: genId(),
    // FIXME
    isAnacrusis: false,
    width: 'auto',
    // FIXME
    frontBarline: { type: 'normal' },
    backBarline: { type: 'normal' },
    timeSignature: currentTimeSignature,
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
function note(ts: TokenStream): SavedNoteOrTriplet {
  timeLineStart(ts);
  const startedToTie = tieBeforeNote(ts);
  const embellishment_ = embellishment(ts);
  timeLineStart(ts);
  let note_: SavedNoteOrTriplet | null = null;

  if (ts.is(TokenType.TRIPLET_NEW_FORMAT)) {
    const triplet = irregularGroup(ts, TokenType.TRIPLET_NEW_FORMAT);
    triplet.notes[0].gracenote = embellishment_;
    note_ = { notetype: 'triplet', id: genId(), value: triplet };
  } else {
    note_ = {
      notetype: 'single',
      id: genId(),
      value: melodyNote(ts, startedToTie, embellishment_),
    };
  }
  timeLineEnd(ts);
  if (note_) {
    return note_;
  } else {
    throw new Error('Expected note');
  }
}

// A note or rest, without any embellishments
function melodyNote(
  ts: TokenStream,
  tiedBefore: boolean,
  embellishment: SavedGracenote
): SavedNote {
  const accidental_ = ts.is(TokenType.ACCIDENTAL) ? accidental(ts) : false;
  const startedToTie = tieBeforeNote(ts);
  let token: Token | null = null;
  let note_: SavedNote | null = null;

  if ((token = ts.matchToken(TokenType.REST))) {
    throw new Error("Can't deal with rests");
  } else if ((token = ts.eat(TokenType.MELODY_NOTE))) {
    const hasFermata = fermata(ts);
    if (hasFermata) {
      ts.warn("Ignoring fermata");
    }
    const noteLength = toNoteLength(token.value[3]);
    const hasDot = dot(ts);
    note_ = {
      length: hasDot ? dotLength(noteLength) : noteLength,
      pitch: toPitch(token.value[1]),
      hasNatural: accidental_,
      tied: tieing !== TieingState.NotTieing,
      gracenote: embellishment,
    };
  }

  if (tieing === TieingState.OldTieFormat) {
    tieing = TieingState.NotTieing;
  }

  tieAfterNote(ts, tiedBefore || startedToTie);

  if (note_) {
    return note_;
  } else {
    throw new Error('Missing melody note');
  }
}

function toNoteLength(length: string): NoteLength {
  switch (length) {
    case '1':
      return NoteLength.Semibreve;
    case '2':
      return NoteLength.Minim;
    case '4':
      return NoteLength.Crotchet;
    case '8':
      return NoteLength.Quaver;
    case '16':
      return NoteLength.SemiQuaver;
    case '32':
      return NoteLength.DemiSemiQuaver;
    default:
      throw new Error('Unrecognised note length');
  }
}

function makeTriplet(notes: SavedNoteOrTriplet[]): SavedTriplet {
  if (notes.every((note) => note.notetype === 'single')) {
    const length = notes[0].value.length;
    return {
      length,
      notes: notes as unknown as SavedNote[],
    };
  } else {
    throw new Error("Can't nest triplets");
  }
}

function tripletOldFormat(
  ts: TokenStream,
  notes: SavedNoteOrTriplet[]
): SavedTriplet {
  ts.eat(TokenType.TRIPLET_OLD_FORMAT);

  if (notes.length !== 3) {
    throw new Error('Triplet without 3 notes in it.');
  }

  return makeTriplet(notes);
}

function irregularGroup(
  ts: TokenStream,
  startingToken: TokenType
): SavedTriplet {
  const token = ts.eat(startingToken);
  const size = transformIrregularGroupToSize(token.value[1]);
  if (size !== 3)
    throw new Error("Can't deal with non-triplet irregular groups");
  let notes: SavedNoteOrTriplet[] = [];

  for (let i = 0; i < size; i++) {
    notes.push(note(ts));
  }

  eatIrregularGroupEnd(ts);

  return makeTriplet(notes);
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

function dot(ts: TokenStream): boolean {
  const token = ts.matchToken(TokenType.DOTTED_NOTE);
  if (token) {
    if (token.value[1].length === 2) {
      ts.warn("Ignoring doubled dot: replacing with a single dot")
    }
    return true;
  }
  return false;
}

function keySignature(ts: TokenStream) {
  while (ts.match(TokenType.ACCIDENTAL)) {
    ts.warn("Ignoring custom key signature");
  }
}

// Returns true if it is a natural
function accidental(ts: TokenStream): boolean {
  const token = ts.eat(TokenType.ACCIDENTAL);

  const type = token.value[1];

  if (type === 'natural') {
    return true;
  }

  if (type === 'sharp' || type === 'flat') {
    ts.warn(`Ignoring ${type}`)
  }

  throw new Error(`Unable to match accidental type: ${type}`);
}

function timeSignature(ts: TokenStream): SavedTimeSignature {
  const token = ts.matchToken(TokenType.TIME_SIGNATURE);
  if (token) {
    if (token.value[1]) {
      const top = parseInt(token.value[1]);
      const bottom = parseInt(token.value[2]);
      if (top && (bottom === 2 || bottom === 4 || bottom === 8)) {
        return {
          ts: [top, bottom],
          breaks: [],
        };
      }
      throw new Error("Cannot parse time signature");
    } else if (token.value[3]) {
      return {
        ts: 'cut time',
        breaks: [],
      };
    } else {
      // FIXME: common time
      return {
        ts: 'cut time',
        breaks: [],
      };
    }
  }

  return currentTimeSignature;
}
