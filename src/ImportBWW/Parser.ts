import {
  SavedBar,
  SavedGracenote,
  SavedScore,
  SavedTimeSignature,
  SavedTiming,
} from '../PipeScore/SavedModel';
import { Token, TokenType } from './token';
import { TokenStream } from './Tokeniser';
import { Settings } from '../PipeScore/global/settings';
import { genId, ID } from '../PipeScore/global/id';
import {
  dotLength,
  lengthInBeats,
  NoteLength,
} from '../PipeScore/Note/notelength';
import { Pitch } from '../PipeScore/global/pitch';

export const parse = (data: string) => new Parser(data).parse();

type ParsedScore = {
  score: SavedScore;
  warnings: string[];
  textboxes: string[];
};

// There are two pitch formats - one is used for all notes and
// in some embellishments, the other is used for single gracenotes
// or for single gracenotes as part of an embellishment (e.g. for
// the gracenote on a birl)

function toGracenotePitch(pitch: string): Pitch {
  switch (pitch.toLowerCase()) {
    case 'a':
      return Pitch.A;
    case 'b':
      return Pitch.B;
    case 'c':
      return Pitch.C;
    case 'd':
      return Pitch.D;
    case 'e':
      return Pitch.E;
    case 'f':
      return Pitch.F;
    case 'g':
      return Pitch.HG;
    case 't':
      return Pitch.HA;
    default:
      throw new Error(`Unrecognised gracenote pitch: got "${pitch}"`);
  }
}

function toPitch(pitch: string): Pitch {
  switch (pitch.toLowerCase()) {
    case 'lg':
      return Pitch.G;
    case 'la':
      return Pitch.A;
    case 'b':
      return Pitch.B;
    case 'c':
      return Pitch.C;
    case 'd':
      return Pitch.D;
    case 'e':
      return Pitch.E;
    case 'f':
      return Pitch.F;
    case 'hg':
      return Pitch.HG;
    case 'ha':
      return Pitch.HA;
    default:
      throw new Error(`Unrecognised pitch: got "${pitch}"`);
  }
}

enum TieingState {
  NotTieing,
  OldTieFormat,
  NewTieFormat,
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

function reactive(name: string): SavedGracenote {
  return { type: 'reactive', value: { grace: name } };
}

const emptyBar = (timeSignature: SavedTimeSignature): SavedBar => ({
  id: genId(),
  isAnacrusis: false,
  timeSignature,
  notes: [],
  width: 'auto',
  frontBarline: { type: 'normal' },
  backBarline: { type: 'normal' },
});

const emptyNote = (
  pitch: Pitch,
  length: NoteLength,
  tied: boolean,
  hasNatural: boolean,
  gracenote: SavedGracenote
) => ({
  id: genId(),
  pitch,
  length,
  tied,
  hasNatural,
  gracenote,
});

type BarlineType = 'normal' | 'repeat' | 'end';
class PartialScore {
  private tieing = TieingState.NotTieing;
  private tiedFirstNote = false;
  private tieingPitch: Pitch = Pitch.A;
  private gracenote: SavedGracenote = { type: 'none' };
  private timeSignature: SavedTimeSignature = { ts: [2, 4], breaks: [] };
  private timings: SavedTiming[] = [];
  private textboxes: string[] = [];
  // The pitch of the natural
  private accidental: Pitch | null = null;
  private previousID: ID = -1;

  private currentTiming: SavedTiming | null = null;
  private currentStave: SavedBar[] = [emptyBar(this.timeSignature)];

  private score: SavedScore;

  public currentLineIsEmpty: boolean = true;

  constructor() {
    this.score = {
      name: '[Imported from BWW]',
      _staves: [],
      landscape: true,
      textBoxes: [{ texts: [] }],
      numberOfPages: 1,
      showNumberOfPages: true,
      secondTimings: this.timings,
      settings: new Settings().toJSON(),
    };
  }

  newStave() {
    this.endItem(this.currentBar().id);

    this.score._staves.push({ type: 'stave', bars: this.currentStave });
    this.currentStave = [emptyBar(this.timeSignature)];
    this.currentLineIsEmpty = true;
  }

  newNote(pitch: Pitch, length: NoteLength) {
    this.currentLineIsEmpty = false;

    const tieing =
      this.tieing === TieingState.OldTieFormat ||
      (this.tieing === TieingState.NewTieFormat && this.tiedFirstNote);

    const note = emptyNote(
      pitch,
      length,
      tieing && pitch === this.tieingPitch,
      this.accidental === pitch,
      this.gracenote
    );
    const id = note.id;

    this.currentBar().notes.push({
      notetype: 'single',
      value: note,
    });

    this.startItem(id);
    this.endItem(id);

    this.gracenote = { type: 'none' };
    this.accidental = null;
    // The new tie format lasts until ^te, but the old
    // one only lasts until the next note.
    if (this.tieing === TieingState.OldTieFormat) {
      this.tieing = TieingState.NotTieing;
    } else {
      this.tieingPitch = pitch;
      this.tiedFirstNote = true;
    }
  }

  makeTriplet() {
    const bar = this.currentBar();
    const notesOrTriplets = bar.notes.slice(bar.notes.length - 3);
    if (notesOrTriplets.length !== 3) {
      throw new Error(
        "Tried to make a triplet, but there weren't enough notes in the bar!"
      );
    }
    const notes = notesOrTriplets.map((note) => {
      if (note.notetype === 'triplet') {
        throw new Error(
          'Tried to make a triplet, but one of the notes in the triplet is itself a triplet!'
        );
      } else {
        return note.value;
      }
    });
    const notelength = notes[0].length;
    bar.notes.splice(bar.notes.length - 3, 3, {
      notetype: 'triplet',
      value: {
        id: genId(),
        length: notelength,
        notes: notes,
      },
    });
  }

  newBar() {
    // Sometimes a barline is placed at the start of a line
    // in which case we should ignore it
    if (this.currentLineIsEmpty) {
      return;
    }

    {
      // We can now determine if the previous bar was an anacrusis.
      // This is a bit crude, but BWW has no concept of lead-ins
      // and I can't really think of a better metric
      const barNoteLength = this.currentBar().notes.reduce(
        (prev, note) => (prev += lengthInBeats(note.value.length)),
        0
      );
      const ts = this.currentBar().timeSignature.ts;
      const barLength =
        ts === 'cut time' || ts === 'common time' ? 4 : (ts[0] * 4) / ts[1];

      if (barNoteLength < barLength / 2) {
        this.currentBar().isAnacrusis = true;
      }
    }

    this.endItem(this.currentBar().id);

    const bar = emptyBar(this.timeSignature);
    this.startItem(bar.id);
    this.currentStave.push(bar);
  }

  startTimeline(text: string) {
    this.currentTiming = {
      type: 'single timing',
      value: { start: -1, end: -1, text },
    };
  }

  endTimeline() {
    if (this.currentTiming) {
      this.currentTiming.value.end = this.previousID;
      this.score.secondTimings.push(this.currentTiming);
      this.currentTiming = null;
    } else {
      console.warn("Ending timeline, but a timeline wasn't started");
    }
  }

  setBarline(barline: BarlineType, place: 'start' | 'end') {
    if (place === 'start') {
      this.currentBar().frontBarline.type = barline;
    } else {
      this.currentBar().backBarline.type = barline;
    }
  }

  setTimeSignature(ts: SavedTimeSignature) {
    this.timeSignature = ts;
    if (this.currentLineIsEmpty) {
      this.currentBar().timeSignature = ts;
    }
  }

  newText(text: string) {
    this.textboxes.push(text);
  }

  newGracenote(gracenote: SavedGracenote) {
    this.gracenote = gracenote;
  }

  setAccidental(pitch: Pitch) {
    this.accidental = pitch;
  }

  // Get the stave, or return null if the item at index is a spacer
  getStave(index: number) {
    const stave = this.score._staves[index];
    if (stave.type === 'stave') {
      return stave;
    }
    return null;
  }

  dotLastNote() {
    // All this is likely unnecessary since dots will almost always
    // come straight after a melody note
    const dotLast = (stave: SavedBar[]) => {
      for (let i = this.currentStave.length - 1; i >= 0; i--) {
        const bar = this.currentStave[i];
        if (bar.notes.length > 0) {
          const note = bar.notes[bar.notes.length - 1];
          note.value.length = dotLength(note.value.length);
          return true;
        }
      }
      return false;
    };
    if (!dotLast(this.currentStave)) {
      for (let i = this.score._staves.length - 1; i >= 0; i--) {
        if (dotLast(this.getStave(i)?.bars || [])) {
          break;
        }
      }
    }
  }

  startTie() {
    this.tieing = TieingState.NewTieFormat;
    this.tiedFirstNote = false;
  }
  endTie() {
    this.tieing = TieingState.NotTieing;
  }
  oldTieFormat(pitch: Pitch) {
    this.tieingPitch = pitch;
    this.tieing = TieingState.OldTieFormat;
  }

  isTieingWithNewFormat() {
    return this.tieing === TieingState.NewTieFormat;
  }

  private currentBar() {
    return this.currentStave[this.currentStave.length - 1];
  }
  private startItem(id: ID) {
    if (this.currentTiming && this.currentTiming.value.start === -1) {
      this.currentTiming.value.start = id;
    }
  }
  private endItem(id: ID) {
    this.previousID = id;
  }

  toScore(warnings: string[]): ParsedScore {
    this.newStave();

    return {
      score: this.score,
      textboxes: this.textboxes,
      warnings,
    };
  }
}
class Parser implements Record<TokenType, (t: Token) => void> {
  score: PartialScore = new PartialScore();
  ts: TokenStream;

  constructor(data: string) {
    this.ts = new TokenStream(data);
  }

  parse() {
    while (!this.ts.isAtEnd()) {
      const token = this.ts.eatAny();
      if (!token) break;

      this[token.type](token);
    }

    return this.score.toScore(this.ts.warnings);
  }

  [TokenType.SPACE]() {}

  [TokenType.SOFTWARE_NAME_AND_VERSION]() {}
  [TokenType.MIDI_NOTE_MAPPINGS]() {}
  [TokenType.FREQUENCY_MAPPINGS]() {}
  [TokenType.INSTRUMENT_MAPPINGS]() {}
  [TokenType.GRACENOTE_DURATIONS]() {}
  [TokenType.FONT_SIZES]() {}
  [TokenType.TUNE_FORMAT]() {}
  [TokenType.TUNE_TEMPO]() {}
  [TokenType.TEXT_TAG](t: Token) {
    this.score.newText(t.value[1]);
  }

  [TokenType.CLEF]() {
    if (!this.score.currentLineIsEmpty) {
      this.score.newStave();
    }

    // Skipping these allows us to treat all accidentals
    // as accidentals, not part of the key signature
    while (this.ts.match(TokenType.ACCIDENTAL)) {}
  }

  [TokenType.TIME_SIGNATURE](t: Token) {
    if (t.value[1]) {
      const top = parseInt(t.value[1]);
      const bottom = parseInt(t.value[2]);
      if (top && (bottom === 2 || bottom === 4 || bottom === 8)) {
        this.score.setTimeSignature({
          ts: [top, bottom],
          breaks: [],
        });
      } else {
        throw new Error('Cannot parse time signature');
      }
    } else if (t.value[3]) {
      this.score.setTimeSignature({
        ts: 'cut time',
        breaks: [],
      });
    } else {
      this.score.setTimeSignature({
        ts: 'common time',
        breaks: [],
      });
    }
  }

  [TokenType.PART_BEGINNING](t: Token) {
    // Only make a new bar if we aren't at the start of the line
    if (!this.score.currentLineIsEmpty) {
      this.score.newBar();
    }
    const barline = t.value[1] ? 'repeat' : 'end';
    this.score.setBarline(barline, 'start');
  }
  [TokenType.PART_END](t: Token) {
    const barline = t.value[1] ? 'repeat' : 'end';
    this.score.setBarline(barline, 'end');
  }

  [TokenType.TERMINATING_BAR_LINE]() {
    this.score.newStave();
  }

  [TokenType.BAR_LINE]() {
    this.score.newBar();
  }

  [TokenType.FERMATA]() {
    this.ts.warn('Ignoring fermata.');
  }

  [TokenType.REST]() {
    this.ts.warn('Ignoring rest.');
  }

  [TokenType.IRREGULAR_GROUP_START](t: Token) {
    const size = transformIrregularGroupToSize(t.value[1]);
    if (size !== 3)
      throw new Error("Can't deal with non-triplet irregular groups");
  }
  [TokenType.IRREGULAR_GROUP_END]() {
    this.score.makeTriplet();
  }

  [TokenType.TRIPLET_OLD_FORMAT]() {
    this.score.makeTriplet();
  }
  [TokenType.TRIPLET_NEW_FORMAT]() {
    /* Nothing here - handled at the end by TRIPLET_OLD_FORMAT */
  }

  [TokenType.TIME_LINE_START](t: Token) {
    const text =
      t.value[1] === '1' || t.value[1] === '2'
        ? t.value[1] + '.'
        : t.value[1] || '2nd.';

    this.score.startTimeline(text);
  }
  [TokenType.TIME_LINE_END]() {
    this.score.endTimeline();
  }

  [TokenType.TIE_START]() {
    this.score.startTie();
  }
  [TokenType.TIE_END_OR_TIE_OLD_FORMAT](t: Token) {
    if (this.score.isTieingWithNewFormat() && t.value[1] === 'e') {
      this.score.endTie();
    } else {
      this.score.oldTieFormat(toPitch(t.value[1]));
    }
  }

  [TokenType.ACCIDENTAL](t: Token) {
    if (t.value[1] === 'natural') {
      const pitch = toPitch(t.value[2]);
      if (pitch === Pitch.C || pitch === Pitch.F) {
        this.score.setAccidental(pitch);
      } else {
        this.ts.warn(`Can't have an accidental on a ${pitch}, ignoring.`);
      }
    } else {
      this.ts.warn(`Can't handle ${t.value[1]}s, ignoring.`);
    }
  }

  [TokenType.MELODY_NOTE](t: Token) {
    const pitch = toPitch(t.value[1]);
    const length = toNoteLength(t.value[3]);
    this.score.newNote(pitch, length);
  }

  [TokenType.DOTTED_NOTE](t: Token) {
    if (t.value[1].length === 2) {
      this.ts.warn('Ignoring double-dotted note, using a single dot instead.');
    }
    this.score.dotLastNote();
  }

  // Embellishments

  [TokenType.DOUBLING](t: Token) {
    // dbhg is really a half doubling on HG
    this.score.newGracenote(
      reactive(
        t.value[0] === 'dbhg' || t.value[0].startsWith('h')
          ? 'half-doubling'
          : 'doubling'
      )
    );
  }
  [TokenType.REGULAR_GRIP]() {
    this.score.newGracenote(reactive('grip'));
  }
  [TokenType.COMPLEX_GRIP]() {
    this.ts.warn(
      "Can't deal with grips with gracenotes on them. Replacing with standard grip."
    );
    this.score.newGracenote(reactive('grip'));
  }
  [TokenType.TAORLUATH]() {
    // typo intentional
    this.score.newGracenote(reactive('toarluath'));
  }
  [TokenType.BUBBLY]() {
    this.score.newGracenote(reactive('bubbly'));
  }
  [TokenType.BIRL](t: Token) {
    if (t.value[0] === 'brl' || t.value[0] === 'abr') {
      this.score.newGracenote({
        type: 'reactive',
        value: { grace: 'birl' },
      });
    } else if (t.value[0] === 'gbr' || t.value[0] === 'tbr') {
      this.score.newGracenote({
        type: 'reactive',
        value: { grace: 'g-gracenote-birl' },
      });
    } else {
      this.ts.warn(`Unrecognised birl '${t.value[0]}'`);
    }
  }
  [TokenType.EDRE]() {
    this.score.newGracenote(reactive('edre'));
  }
  [TokenType.THROW]() {
    this.score.newGracenote(reactive('throw-d'));
  }
  [TokenType.PELE](t: Token) {
    if (t.value[0].startsWith('l')) {
      this.score.newGracenote(reactive('c-shake'));
    } else {
      this.score.newGracenote(reactive('shake'));
    }
  }
  [TokenType.STRIKE](t: Token) {
    const partBeforeStrike = t.value[1];

    if (
      partBeforeStrike === 'g' ||
      partBeforeStrike === 't' ||
      partBeforeStrike === 'h'
    ) {
      this.score.newGracenote(reactive('g-strike'));
    } else if (partBeforeStrike && partBeforeStrike.startsWith('l')) {
      // 'Light' strikes on D go to C instead of G. These are not implemented
      // as reactive gracenotes in PipeScore, so we use custom gracenotes instead.
      if (partBeforeStrike[1] === 'g') {
        this.score.newGracenote({
          type: 'custom',
          value: {
            pitches: [Pitch.HG, Pitch.D, Pitch.C],
          },
        });
      } else if (partBeforeStrike[1] === 't') {
        this.score.newGracenote({
          type: 'custom',
          value: {
            pitches: [Pitch.HA, Pitch.D, Pitch.C],
          },
        });
      } else if (partBeforeStrike[1] === 'h') {
        this.score.newGracenote({
          type: 'custom',
          value: {
            pitches: [Pitch.D, Pitch.C],
          },
        });
      }
    } else {
      this.score.newGracenote({
        type: 'single',
        value: { note: toPitch(t.value[2]) },
      });
    }
  }
  [TokenType.DOUBLE_STRIKE]() {
    this.ts.warn("Don't support double strike, ignoring");
  }
  [TokenType.TRIPLE_STRIKE]() {
    this.ts.warn("Don't support triple strike, ignoring.");
  }
  [TokenType.GRACENOTE](t: Token) {
    this.score.newGracenote({
      type: 'single',
      value: { note: toGracenotePitch(t.value[1]) },
    });
  }
  [TokenType.DOUBLE_GRACENOTE](t: Token) {
    this.score.newGracenote({
      type: 'custom',
      value: {
        pitches: [toGracenotePitch(t.value[1]), toPitch(t.value[2])],
      },
    });
  }
}
