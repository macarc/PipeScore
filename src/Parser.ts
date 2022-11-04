import {
    Accidental,
    Bar,
    Dot,
    DoubleGracenote,
    Embellishment,
    Header,
    Note,
    NoteType,
    Score,
    SoftwareHeader,
    Stave,
    TextTagHeader,
    TimeSignature,
    Token,
    TokenType,
} from "../types/main";
import EmbellishmentMap from "./Embellishments";
import Tokenizer from "./Tokenizer";

export default class Parser {
    private data: string;
    private tokenizer: Tokenizer;
    private lookahead!: Token | null;
    private oldFormatBarlineTie = false;
    private newFormatBarlineTie = false;

    constructor() {
        this.data = "";
        this.tokenizer = new Tokenizer();
    }

    /**
     * Returns an AST of the BWW file
     */
    parse(data: string): Score {
        this.data = data;
        this.tokenizer.init(this.data);

        // Reset barline tie values
        this.oldFormatBarlineTie = false;
        this.newFormatBarlineTie = false;

        /**
         * Prime the tokenizer to obtain the first
         * token which is our lookahead. The lookahead
         * is used for predictive parsing.
         */
        this.lookahead = this.tokenizer.getNextToken();

        /**
         * Parse recursively starting from the main
         * entrypoint, the Score
         */
        return this.Score();
    }

    private eat(tokenType: TokenType): Token {
        const token = this.lookahead;

        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}"`
            );
        }

        if (token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.type}", expected: "${tokenType}"`
            );
        }

        this.lookahead = this.tokenizer.getNextToken();

        return token;
    }

    Score(): Score {
        if (!this.lookahead) {
            return {
                name: "",
                headers: [],
                staves: [],
            };
        }

        return {
            name: "",
            headers: this.Headers(),
            staves: this.tokenizer.hasMoreTokens() ? this.Staves() : [],
        };
    }

    Staves(): Stave[] {
        const staves = [];

        while (this.lookahead?.type === TokenType.CLEF) {
            this.eat(TokenType.CLEF);
            staves.push(this.Stave(this.KeySignature(), this.TimeSignature()));
        }

        return staves;
    }

    Stave(key: Accidental[], time: TimeSignature): Stave {
        let bars: Bar[] = [];

        const repeat: boolean = this.BeginStave();

        if (this.HasNote()) {
            bars = this.Bars();
        }

        this.EndStave();

        return {
            repeat: repeat,
            clef: {
                key: key,
                time: time,
            },
            bars: bars,
        };
    }

    BeginStave(): boolean {
        if (this.lookahead?.type === TokenType.PART_BEGINNING) {
            const token: Token = this.eat(TokenType.PART_BEGINNING);

            if (token.value[1]) {
                return true;
            }
        }

        return false;
    }

    EndStave(): void {
        switch (this.lookahead?.type) {
            case TokenType.PART_END:
                this.eat(TokenType.PART_END);
                break;
            case TokenType.TERMINATING_BAR_LINE:
                this.eat(TokenType.TERMINATING_BAR_LINE);
                break;
        }
    }

    Bars(): Bar[] {
        const bars = [];

        bars.push(this.Bar());

        while (this.lookahead?.type === TokenType.BAR_LINE) {
            this.eat(TokenType.BAR_LINE);
            bars.push(this.Bar());
        }

        return bars;
    }

    HasNote(): boolean {
        if (
            this.lookahead?.type === TokenType.MELODY_NOTE ||
            this.lookahead?.type === TokenType.TIE_START ||
            this.lookahead?.type === TokenType.IRREGULAR_GROUP_START ||
            this.lookahead?.type === TokenType.TRIPLET_NEW_FORMAT ||
            this.lookahead?.type === TokenType.TRIPLET_OLD_FORMAT ||
            this.lookahead?.type === TokenType.REST ||
            this.lookahead?.type === TokenType.FERMATA ||
            this.lookahead?.type === TokenType.ACCIDENTAL ||
            this.lookahead?.type === TokenType.DOUBLING ||
            this.lookahead?.type === TokenType.STRIKE ||
            this.lookahead?.type === TokenType.REGULAR_GRIP ||
            this.lookahead?.type === TokenType.COMPLEX_GRIP ||
            this.lookahead?.type === TokenType.TAORLUATH ||
            this.lookahead?.type === TokenType.BUBBLY ||
            this.lookahead?.type === TokenType.BIRL ||
            this.lookahead?.type === TokenType.THROW ||
            this.lookahead?.type === TokenType.PELE ||
            this.lookahead?.type === TokenType.DOUBLE_STRIKE ||
            this.lookahead?.type === TokenType.TRIPLE_STRIKE ||
            this.lookahead?.type === TokenType.DOUBLE_GRACENOTE ||
            this.lookahead?.type === TokenType.GRACENOTE
        ) {
            return true;
        }

        return false;
    }

    Bar(): Bar {
        let notes: Note[] = [];

        while (this.HasNote()) {
            let note: Note;

            if (this.lookahead?.type === TokenType.TIE_START) {
                notes = notes.concat(this.Tie());
                continue;
            } else if (this.lookahead?.type === TokenType.TRIPLET_OLD_FORMAT) {
                notes = this.TripletOldFormat(notes);
            } else if (
                this.lookahead?.type === TokenType.IRREGULAR_GROUP_START
            ) {
                notes = notes.concat(
                    this.IrregularGroup(TokenType.IRREGULAR_GROUP_START)
                );
            } else if (this.lookahead?.type === TokenType.TRIPLET_NEW_FORMAT) {
                notes = notes.concat(
                    this.IrregularGroup(TokenType.TRIPLET_NEW_FORMAT)
                );
            } else {
                note = this.Note();
                this.BarLineTie(note);
                notes = notes.concat(this.OldTie(note));
            }
        }

        return {
            notes: notes,
        };
    }

    TripletOldFormat(notes: Note[]): Note[] {
        const groupNotes: Note[] = [];
        this.eat(TokenType.TRIPLET_OLD_FORMAT);
        for (let i = 0; i < 3; i++) {
            const note = notes.pop();

            if (note) {
                groupNotes.push(note);
            } else {
                throw new Error("Missing note in triplet");
            }
        }

        notes.push({
            type: "triplet",
            value: {
                notes: groupNotes.reverse(),
            },
        });

        return notes;
    }

    IrregularGroup(startingToken: TokenType): Note {
        const token = this.eat(startingToken);
        const size = this.TransformIrregularGroupToSize(token.value[1]);
        let notes: Note[] = [];

        for (let i = 0; i < size; i++) {
            notes = notes.concat(this.Note());
        }

        this.EatIrregularGroupEnd();

        return {
            type: this.GetGroupType(size),
            value: {
                notes: notes,
            },
        };
    }

    EatIrregularGroupEnd(): void {
        if (this.lookahead?.type === TokenType.IRREGULAR_GROUP_END) {
            this.eat(TokenType.IRREGULAR_GROUP_END);
        } else {
            this.eat(TokenType.TRIPLET_OLD_FORMAT);
        }
    }

    TransformIrregularGroupToSize(group: string): number {
        switch (group) {
            case "2":
                return 2;
            case "3":
                return 3;
            case "43":
                return 4;
            case "46":
                return 4;
            case "53":
                return 5;
            case "54":
                return 5;
            case "64":
                return 6;
            case "74":
                return 7;
            case "76":
                return 7;
        }

        throw Error(`Unable transform group to size: ${group}`);
    }

    GetGroupType(size: number): NoteType {
        switch (size) {
            case 1:
                return "single";
            case 2:
                return "duplet";
            case 3:
                return "triplet";
            case 4:
                return "quadruplet";
            case 5:
                return "quintuplet";
            case 6:
                return "sextuplet";
            case 7:
                return "septuplet";
        }

        throw Error(`Unable to match group size: ${size}`);
    }

    Tie(): Note[] {
        const notes: Note[] = [];

        this.eat(TokenType.TIE_START);
        const note = this.Note();
        this.AddTieToNote(note);
        notes.push(note);

        const nextNote = this.NewFormatTieNextNote();
        if (nextNote) {
            notes.push(nextNote);
        }

        return notes;
    }

    OldTie(note: Note): Note[] {
        const notes: Note[] = [];

        notes.push(note);

        if (this.lookahead?.type === TokenType.TIE_OLD_FORMAT) {
            this.eat(TokenType.TIE_OLD_FORMAT);
            this.AddTieToNote(note);

            const nextNote = this.OldFormatTieNextNote();
            if (nextNote) {
                notes.push(nextNote);
            }
        }

        return notes;
    }

    BarLineTie(note: Note): void {
        if (this.oldFormatBarlineTie) {
            this.AddTieToNote(note);
            this.oldFormatBarlineTie = false;
        } else if (this.newFormatBarlineTie) {
            this.AddTieToNote(note);
            this.eat(TokenType.TIE_OLD_FORMAT);
            this.newFormatBarlineTie = false;
        }
    }

    AddTieToNote(note: Note): void {
        if ("tied" in note.value) {
            note.value.tied = true;
        }
    }

    NewFormatTieNextNote(): Note | null {
        let nextNote;

        if (this.lookahead?.type === TokenType.BAR_LINE) {
            this.newFormatBarlineTie = true;
        } else {
            nextNote = this.Note();
            this.eat(TokenType.TIE_OLD_FORMAT);
            this.AddTieToNote(nextNote);

            return nextNote;
        }

        return null;
    }

    OldFormatTieNextNote(): Note | null {
        let nextNote;

        if (this.lookahead?.type === TokenType.BAR_LINE) {
            this.oldFormatBarlineTie = true;
        } else {
            nextNote = this.Note();

            if ("tied" in nextNote.value) {
                nextNote.value.tied = true;
            }

            return nextNote;
        }

        return null;
    }

    Note(): Note {
        const embellishment = this.Embellishment();
        const accidental =
            this.lookahead?.type === TokenType.ACCIDENTAL
                ? this.Accidental().type
                : "none";

        if (this.lookahead?.type === TokenType.REST) {
            const token = this.eat(TokenType.REST);
            return {
                type: "rest",
                value: {
                    length: token.value[1],
                },
            };
        } else {
            const fermata = this.Fermata();
            const token = this.eat(TokenType.MELODY_NOTE);
            return {
                type: "single",
                value: {
                    length: token.value[3],
                    pitch: token.value[1],
                    accidental: accidental,
                    tied: false,
                    fermata: fermata,
                    dot: this.Dot(),
                    embellishment: embellishment,
                },
            };
        }
    }

    Fermata(): boolean {
        if (this.lookahead?.type === TokenType.FERMATA) {
            this.eat(TokenType.FERMATA);
            return true;
        }

        return false;
    }

    Dot(): Dot {
        if (this.lookahead?.type === TokenType.DOTTED_NOTE) {
            const token: Token = this.eat(TokenType.DOTTED_NOTE);

            return token.value[1].length === 1 ? "single" : "double";
        }

        return "none";
    }

    Embellishment(): Embellishment | DoubleGracenote {
        switch (this.lookahead?.type) {
            case TokenType.GRACENOTE:
                return this.GraceNote();
            case TokenType.DOUBLING:
                return this.Doubling();
            case TokenType.STRIKE:
                return this.Strike();
            case TokenType.REGULAR_GRIP:
                return this.Grip();
            case TokenType.COMPLEX_GRIP:
                return this.ComplexGrip();
            case TokenType.TAORLUATH:
                return this.Taorluath();
            case TokenType.BUBBLY:
                return this.Bubbly();
            case TokenType.BIRL:
                return this.Birl();
            case TokenType.THROW:
                return this.Throw();
            case TokenType.PELE:
                return this.Pele();
            case TokenType.DOUBLE_STRIKE:
                return this.DoubleStrike();
            case TokenType.TRIPLE_STRIKE:
                return this.TripleStrike();
            case TokenType.DOUBLE_GRACENOTE:
                return this.DoubleGracenote();
            default:
                return {};
        }
    }

    DoubleGracenote(): DoubleGracenote {
        const token = this.eat(TokenType.DOUBLE_GRACENOTE);
        const notes = [];

        if (token.value[1] === "t") {
            notes.push("a");
        } else {
            notes.push(token.value[1]);
        }

        notes.push(token.value[2]);

        return {
            type: "gracenotes",
            value: {
                notes: notes,
            },
        };
    }

    GetEmbellishment(lookup: string): string {
        if (EmbellishmentMap.has(lookup)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return EmbellishmentMap.get(lookup)!;
        }

        throw new Error(`Unable to find ${lookup} in embellishment map`);
    }

    TripleStrike(): Embellishment {
        const token = this.eat(TokenType.TRIPLE_STRIKE);

        return {
            type: this.GetEmbellishment(token.value[1]),
            value: { note: token.value[2] },
        };
    }

    DoubleStrike(): Embellishment {
        const token = this.eat(TokenType.DOUBLE_STRIKE);
        return {
            type: this.GetEmbellishment(token.value[1]),
            value: { note: token.value[2] },
        };
    }

    Pele(): Embellishment {
        const token = this.eat(TokenType.PELE);
        return {
            type: this.GetEmbellishment(token.value[1]),
            value: { note: token.value[2] },
        };
    }

    Birl(): Embellishment {
        const token = this.eat(TokenType.BIRL);
        return {
            type: this.GetEmbellishment(token.value[1]),
        };
    }

    Throw(): Embellishment {
        const token = this.eat(TokenType.THROW);
        return {
            type: this.GetEmbellishment(token.value[1]),
        };
    }

    Taorluath(): Embellishment {
        const token = this.eat(TokenType.TAORLUATH);
        return {
            type: this.GetEmbellishment(token.value[1]),
        };
    }

    Bubbly(): Embellishment {
        const token = this.eat(TokenType.BUBBLY);
        return {
            type: this.GetEmbellishment(token.value[1]),
        };
    }

    Grip(): Embellishment {
        const token = this.eat(TokenType.REGULAR_GRIP);
        return {
            type: this.GetEmbellishment(token.value[1]),
        };
    }

    ComplexGrip(): Embellishment {
        const token = this.eat(TokenType.COMPLEX_GRIP);
        if (token.value[2]) {
            return {
                type: this.GetEmbellishment(token.value[1]),
                value: {
                    note: token.value[2],
                },
            };
        }
        return {
            type: this.GetEmbellishment(token.value[1]),
        };
    }

    Strike(): Embellishment {
        const token = this.eat(TokenType.STRIKE);
        return {
            type: this.GetEmbellishment(token.value[1]),
            value: {
                note: token.value[2],
            },
        };
    }

    Doubling(): Embellishment {
        const token = this.eat(TokenType.DOUBLING);
        return {
            type: this.GetEmbellishment(token.value[1]),
            value: {
                note: token.value[2],
            },
        };
    }

    GraceNote(): Embellishment {
        const token = this.eat(TokenType.GRACENOTE);
        return {
            type: "gracenote",
            value: {
                note: token.value[1],
            },
        };
    }

    KeySignature(): Accidental[] {
        const accidentals: Accidental[] = [];

        while (this.lookahead?.type === TokenType.ACCIDENTAL) {
            accidentals.push(this.Accidental());
        }

        return accidentals;
    }

    Accidental(): Accidental {
        const token: Token = this.eat(TokenType.ACCIDENTAL);

        return {
            type: this.AccidentalType(token.value[1]),
            note: token.value[2],
        };
    }

    AccidentalType(type: string): "sharp" | "flat" | "natural" {
        switch (type) {
            case "sharp":
                return "sharp";
            case "flat":
                return "flat";
            case "natural":
                return "natural";
            default:
                throw new Error(`Unable to match accidental type: ${type}`);
        }
    }

    TimeSignature(): TimeSignature {
        if (this.lookahead?.type === TokenType.TIME_SIGNATURE) {
            const token = this.eat(TokenType.TIME_SIGNATURE);
            if (token.value[1]) {
                return {
                    top: token.value[1],
                    bottom: token.value[2],
                };
            } else if (token.value[3]) {
                return {
                    type: "cut",
                };
            } else {
                return {
                    type: "common",
                };
            }
        }

        return {};
    }

    Headers(): (Header | TextTagHeader | SoftwareHeader)[] {
        const headers = [];
        let matching = true;

        while (this.lookahead && matching) {
            switch (this.lookahead.type) {
                case TokenType.SOFTWARE_HEADER:
                    headers.push(this.SoftwareHeader());
                    break;
                case TokenType.MIDI_NOTE_MAPPINGS_HEADER:
                    headers.push(this.Header(this.lookahead.type));
                    break;
                case TokenType.FREQUENCY_MAPPINGS_HEADER:
                    headers.push(this.Header(this.lookahead.type));
                    break;
                case TokenType.INSTRUMENT_MAPPINGS_HEADER:
                    headers.push(this.Header(this.lookahead.type));
                    break;
                case TokenType.GRACENOTE_DURATIONS_HEADER:
                    headers.push(this.Header(this.lookahead.type));
                    break;
                case TokenType.FONT_SIZES_HEADER:
                    headers.push(this.Header(this.lookahead.type));
                    break;
                case TokenType.TUNE_FORMAT_HEADER:
                    headers.push(this.Header(this.lookahead.type));
                    break;
                case TokenType.TUNE_TEMPO_HEADER:
                    headers.push(this.TuneTempoHeader());
                    break;
                case TokenType.TEXT_TAG:
                    headers.push(this.TextTagHeader());
                    break;
                default:
                    matching = false;
            }
        }

        return headers;
    }

    SoftwareHeader(): SoftwareHeader {
        const token = this.eat(TokenType.SOFTWARE_HEADER);

        return {
            type: token.type,
            value: {
                program: token.value[1],
                version: token.value[2],
            },
        };
    }

    TuneTempoHeader(): Header {
        const token = this.eat(TokenType.TUNE_TEMPO_HEADER);

        return {
            type: token.type,
            value: token.value[1],
        };
    }

    TextTagHeader(): TextTagHeader {
        const token = this.eat(TokenType.TEXT_TAG);

        return {
            type: token.type,
            value: {
                text: token.value[1],
                textType: token.value[2],
            },
        };
    }

    Header(tokenType: TokenType): Header {
        const token = this.eat(tokenType);

        return {
            type: token.type,
            value: token.value[0],
        };
    }
}
