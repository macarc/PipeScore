import {
  SavedBar,
  SavedBarline,
  SavedGracenote,
  SavedNote,
  SavedNoteOrTriplet,
  SavedScore,
  SavedStave,
  SavedTimeSignature,
  SavedTiming,
  SavedTriplet,
} from '../PipeScore/SavedModel';
import { Token, TokenType } from './token';
import { embellishment } from './parser/embellishment';
import { headers } from './parser/header';
import { TokenStream } from './Tokeniser';
import { Settings } from '../PipeScore/global/settings';
import { genId, ID } from '../PipeScore/global/id';
import {
  dotLength,
  lengthInBeats,
  NoteLength,
} from '../PipeScore/Note/notelength';
import { toPitch } from './parser/pitch';

export const parse = (data: string) => new Parser(data).parse();

enum TieingState {
  NotTieing,
  OldTieFormat,
  NewTieFormat,
}

type ParsedScore = {
  score: SavedScore;
  warnings: string[];
  textboxes: string[];
};

class Parser {
  tieing = TieingState.NotTieing;
  currentTimeSignature: SavedTimeSignature = { ts: [2, 4], breaks: [] };
  currentTimeline: ID | null = null;
  currentTimelineText = '';
  timings: SavedTiming[] = [];
  ts: TokenStream;

  constructor(data: string) {
    this.ts = new TokenStream(data);
  }

  parse(): ParsedScore {
    const textboxes = headers(this.ts);
    this.ts.setSkipHeaderTokens();
    const parsed = this.score();
    const nextToken = this.ts.eatAny();
    if (nextToken) {
      this.ts.warn(`Didn't parse full score: next token is ${nextToken.type}`);
      console.log('Next token: ', nextToken);
    }
    return {
      score: parsed,
      warnings: this.ts.warnings,
      textboxes,
    };
  }
  private score(): SavedScore {
    return {
      name: '[Imported from BWW]',
      _staves: this.staves(),
      landscape: true,
      textBoxes: [{ texts: [] }],
      numberOfPages: 1,
      showNumberOfPages: true,
      secondTimings: this.timings,
      settings: new Settings().toJSON(),
    };
  }

  private staves(): SavedStave[] {
    const staves: SavedStave[] = [];

    while (this.ts.match(TokenType.CLEF)) {
      staves.push(this.stave());
    }

    return staves;
  }

  private stave(): SavedStave {
    this.keySignature();
    this.currentTimeSignature = this.timeSignature();

    let bars_: SavedBar[] = [];

    bars_ = this.bars();

    return {
      bars: bars_,
    };
  }

  private bars(): SavedBar[] {
    const bars: SavedBar[] = [];

    this.ts.match(TokenType.BAR_LINE);

    if (!this.hasNote()) {
      return bars;
    }

    bars.push(this.bar());
    while (this.ts.match(TokenType.BAR_LINE)) {
      const b = this.bar();
      bars.push(b);

      // a terminating barline, or an ending double barlines (!I)
      // or an ending double barlines with repeats (''!I)
      // must appear at the end of a line of music
      if (b.backBarline.type !== 'normal') break;
    }

    this.ts.match(TokenType.TERMINATING_BAR_LINE);

    return bars;
  }

  private hasNote(): boolean {
    return this.ts.peekAny(
      TokenType.MELODY_NOTE,
      TokenType.TIME_LINE_START,
      TokenType.PART_BEGINNING,
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
      TokenType.EDRE,
      TokenType.DOUBLE_STRIKE,
      TokenType.TRIPLE_STRIKE,
      TokenType.DOUBLE_GRACENOTE,
      TokenType.GRACENOTE
    );
  }

  private bar(): SavedBar {
    const notes: SavedNoteOrTriplet[] = [];

    const frontBarline: SavedBarline = { type: 'normal' };
    const backBarline: SavedBarline = { type: 'normal' };

    const barId = genId();

    this.timeLineStart(barId);

    let token: Token | null;
    if ((token = this.ts.matchToken(TokenType.PART_BEGINNING))) {
      frontBarline.type = token.value[1] ? 'repeat' : 'end';
    }

    this.timeLineStart(barId);
    const time = this.timeSignature();

    while (this.hasNote()) {
      const noteId = genId();
      this.timeLineStart(noteId);

      if (this.ts.is(TokenType.TRIPLET_OLD_FORMAT)) {
        notes.push({
          notetype: 'triplet',
          id: noteId,
          value: this.tripletOldFormat(notes.splice(this.note.length - 3)),
        });
      } else if (this.ts.is(TokenType.IRREGULAR_GROUP_START)) {
        notes.push({
          notetype: 'triplet',
          id: noteId,
          value: this.irregularGroup(TokenType.IRREGULAR_GROUP_START),
        });
      } else if (this.ts.is(TokenType.TRIPLET_NEW_FORMAT)) {
        notes.push({
          notetype: 'triplet',
          id: noteId,
          value: this.irregularGroup(TokenType.TRIPLET_NEW_FORMAT),
        });
      } else {
        notes.push(this.note(noteId));
      }
    }

    this.timeLineEnd(barId);

    if ((token = this.ts.matchToken(TokenType.PART_END))) {
      backBarline.type = token.value[1] ? 'repeat' : 'end';
    }

    const barNoteLength = notes.reduce(
      (prev, note) => (prev += lengthInBeats(note.value.length)),
      0
    );
    const barLength =
      this.currentTimeSignature.ts === 'cut time' ||
      this.currentTimeSignature.ts === 'common time'
        ? 4
        : (this.currentTimeSignature.ts[0] * 4) /
          this.currentTimeSignature.ts[1];

    return {
      id: barId,
      // This is a bit crude, but BWW has no concept of lead-ins
      // and I can't really think of a better metric
      isAnacrusis: barNoteLength < barLength / 2,
      width: 'auto',
      frontBarline,
      backBarline,
      timeSignature: time,
      notes: notes,
    };
  }

  private addTiming(currentId: ID) {
    if (
      this.currentTimelineText === '2.' &&
      this.timings.length > 0 &&
      this.currentTimeline
    ) {
      const previous = this.timings.pop() as SavedTiming;
      this.timings.push({
        type: 'second timing',
        value: {
          start: previous.value.start,
          middle: this.currentTimeline,
          end: currentId,
          firstText: '1.',
          secondText: '2.',
        },
      });
    } else if (this.currentTimeline) {
      this.timings.push({
        type: 'single timing',
        value: {
          start: this.currentTimeline,
          end: currentId,
          text: this.currentTimelineText,
        },
      });
    }
  }

  private timeLineStart(currentId: ID) {
    let token: Token | null;
    if ((token = this.ts.matchToken(TokenType.TIME_LINE_START))) {
      this.currentTimeline = currentId;
      this.currentTimelineText =
        token.value[1] === '1' || token.value[1] === '2'
          ? token.value[1] + '.'
          : token.value[1] || '2nd.';
    }
  }

  private timeLineEnd(currentId: ID) {
    if (this.ts.match(TokenType.TIME_LINE_END)) {
      this.addTiming(currentId);
    }
  }

  // A note or triplet, possibly with an embellishment
  private note(id: ID): SavedNoteOrTriplet {
    this.timeLineStart(id);
    const startedToTie = this.tieBeforeNote();
    const embellishment_ = embellishment(this.ts);
    this.timeLineStart(id);
    let note_: SavedNoteOrTriplet | null = null;

    if (this.ts.is(TokenType.TRIPLET_NEW_FORMAT)) {
      const triplet = this.irregularGroup(TokenType.TRIPLET_NEW_FORMAT);
      triplet.notes[0].gracenote = embellishment_;
      note_ = { notetype: 'triplet', id: genId(), value: triplet };
    } else {
      note_ = {
        notetype: 'single',
        id,
        value: this.melodyNote(startedToTie, embellishment_),
      };
    }
    this.timeLineEnd(id);
    if (note_) {
      return note_;
    } else {
      throw new Error('Expected note');
    }
  }

  // A note or rest, without any embellishments
  private melodyNote(
    tiedBefore: boolean,
    embellishment: SavedGracenote
  ): SavedNote {
    const accidental_ = this.ts.is(TokenType.ACCIDENTAL)
      ? this.accidental()
      : false;
    const startedToTie = this.tieBeforeNote();
    let token: Token | null = null;
    let note_: SavedNote | null = null;

    if ((token = this.ts.matchToken(TokenType.REST))) {
      this.ts.warn('Skipping rest');
    } else {
      token = this.ts.eat(TokenType.MELODY_NOTE);
      const hasFermata = this.fermata();
      if (hasFermata) {
        this.ts.warn('Ignoring fermata');
      }
      const noteLength = this.toNoteLength(token.value[3]);
      const hasDot = this.dot();
      note_ = {
        length: hasDot ? dotLength(noteLength) : noteLength,
        pitch: toPitch(token.value[1]),
        hasNatural: accidental_,
        tied: this.tieing !== TieingState.NotTieing,
        gracenote: embellishment,
      };
    }

    if (this.tieing === TieingState.OldTieFormat) {
      this.tieing = TieingState.NotTieing;
    }

    this.tieAfterNote(tiedBefore || startedToTie);

    if (note_) {
      return note_;
    } else {
      throw new Error('Missing melody note');
    }
  }

  private toNoteLength(length: string): NoteLength {
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

  private makeTriplet(notes: SavedNoteOrTriplet[]): SavedTriplet {
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

  private tripletOldFormat(notes: SavedNoteOrTriplet[]): SavedTriplet {
    this.ts.eat(TokenType.TRIPLET_OLD_FORMAT);

    if (notes.length !== 3) {
      throw new Error('Triplet without 3 notes in it.');
    }

    return this.makeTriplet(notes);
  }

  private irregularGroup(startingToken: TokenType): SavedTriplet {
    const token = this.ts.eat(startingToken);
    const size = this.transformIrregularGroupToSize(token.value[1]);
    if (size !== 3)
      throw new Error("Can't deal with non-triplet irregular groups");
    const notes: SavedNoteOrTriplet[] = [];

    for (let i = 0; i < size; i++) {
      notes.push(this.note(genId()));
    }

    this.eatIrregularGroupEnd();

    return this.makeTriplet(notes);
  }

  private eatIrregularGroupEnd(): void {
    if (
      !this.ts.matchAny(
        TokenType.IRREGULAR_GROUP_END,
        TokenType.TRIPLET_OLD_FORMAT
      )
    ) {
      throw new SyntaxError(
        `Expected irregular group end or triplet old format`
      ); //, got ${ts.current?.type}`)
    }
  }

  private transformIrregularGroupToSize(group: string): number {
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

  private tieBeforeNote() {
    return this.ts.match(TokenType.TIE_START);
  }

  private tieAfterNote(tieBeforeNote: boolean) {
    if (tieBeforeNote) {
      this.tieing = TieingState.NewTieFormat;
    }
    const token = this.ts.matchToken(TokenType.TIE_END_OR_TIE_OLD_FORMAT);
    if (token) {
      if (this.tieing === TieingState.NewTieFormat && token.value[1] === 'e') {
        this.tieing = TieingState.NotTieing;
      } else {
        this.tieing = TieingState.OldTieFormat;
      }
    }
  }

  private fermata(): boolean {
    return this.ts.match(TokenType.FERMATA);
  }

  private dot(): boolean {
    const token = this.ts.matchToken(TokenType.DOTTED_NOTE);
    if (token) {
      if (token.value[1].length === 2) {
        this.ts.warn('Ignoring doubled dot: replacing with a single dot');
      }
      return true;
    }
    return false;
  }

  private keySignature() {
    while (this.ts.match(TokenType.ACCIDENTAL)) {
      this.ts.warn('Ignoring custom key signature');
    }
  }

  // Returns true if it is a natural
  private accidental(): boolean {
    const token = this.ts.eat(TokenType.ACCIDENTAL);

    const type = token.value[1];

    if (type === 'natural') {
      return true;
    }

    if (type === 'sharp' || type === 'flat') {
      this.ts.warn(`Ignoring ${type}`);
      return false;
    }

    throw new Error(`Unable to match accidental type: ${type}`);
  }

  private timeSignature(): SavedTimeSignature {
    const token = this.ts.matchToken(TokenType.TIME_SIGNATURE);
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
        throw new Error('Cannot parse time signature');
      } else if (token.value[3]) {
        return {
          ts: 'cut time',
          breaks: [],
        };
      } else {
        return {
          ts: 'common time',
          breaks: [],
        };
      }
    }

    return this.currentTimeSignature;
  }
}
