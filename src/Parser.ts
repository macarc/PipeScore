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
import { tokenise, TokenStream } from "./Tokenizer";

export default class Parser {
    private nextToken: TokenStream = () => null;
    private current!: Token | null;
    private oldFormatBarlineTie = false;
    private tieNextNote = false;
    private currentLine = 0;
    private currentBar = 0;

    /**
     * Returns an AST of the BWW file
     */
    parse(data: string): Score {
        this.nextToken = tokenise(data);

        // Reset barline tie values
        this.oldFormatBarlineTie = false;
        this.tieNextNote = false;
        this.currentBar = 0;
        this.currentLine = 0;

        /**
         * Prime the tokenizer to obtain the first
         * token which is our lookahead. The lookahead
         * is used for predictive parsing.
         */
        this.current = this.nextToken();

        /**
         * Parse recursively starting from the main
         * entrypoint, the Score
         */
        return this.Score();
    }

    private eat(tokenType: TokenType): Token {
        const token = this.current;

        if (token == null) {
            throw new SyntaxError(
                `Unexpected end of input, expected: "${tokenType}" near Line #${this.currentLine} and Bar #${this.currentBar}`
            );
        }

        if (token.type !== tokenType) {
            throw new SyntaxError(
                `Unexpected token: "${token.type}", expected: "${tokenType}" near Line #${this.currentLine} and Bar #${this.currentBar}`
            );
        }

        this.current = this.nextToken();

        return token;
    }

    private matchToken(tokenType: TokenType): Token | null {
        if (this.current?.type === tokenType) {
            const token = this.current;
            this.eat(tokenType);
            return token;
        }
        return null;
    }

    private match(tokenType: TokenType): boolean {
        return this.matchToken(tokenType) !== null;
    }

    private matchAny(...tokenTypes: TokenType[]): boolean {
        for (const token of tokenTypes) {
            if (this.match(token)) {
                return true;
            }
        }
        return false;
    }

    private peekAny(...tokenTypes: TokenType[]): boolean {
        return tokenTypes.some(tokenType => this.current?.type === tokenType);
    }

    Score(): Score {
        if (!this.current) {
            return {
                name: "",
                headers: [],
                staves: [],
            };
        }

        return {
            name: "",
            headers: this.Headers(),
            staves: this.Staves(),
        };
    }

    Staves(): Stave[] {
        const staves = [];

        while (this.match(TokenType.CLEF)) {
            staves.push(this.Stave(this.KeySignature(), this.TimeSignature()));
        }

        return staves;
    }

    Stave(key: Accidental[], time: TimeSignature): Stave {
        let bars: Bar[] = [];
        this.currentLine++;
        this.currentBar = 0;

        const doesRepeat = this.BeginStave();

        if (this.HasNote()) {
            bars = this.Bars();
        }

        this.EndStave();

        return {
            repeat: doesRepeat,
            clef: {
                key: key,
                time: time,
            },
            bars: bars,
        };
    }

    BeginStave(): boolean {
        const token = this.matchToken(TokenType.PART_BEGINNING);
        return token !== null && token.value[1] !== undefined;
    }

    EndStave(): void {
        this.matchAny(TokenType.PART_END, TokenType.TERMINATING_BAR_LINE)
    }

    Bars(): Bar[] {
        const bars = [];

        this.ParseTimeLineStart();

        bars.push(this.Bar());

        while (this.match(TokenType.BAR_LINE)) {
            this.currentBar++;
            bars.push(this.Bar());
        }

        return bars;
    }

    HasNote(): boolean {
        return this.peekAny(
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
        )
    }

    Bar(): Bar {
        let notes: Note[] = [];

        while (this.HasNote()) {
            this.ParseTimeLineStart();

            if (this.current?.type === TokenType.TRIPLET_OLD_FORMAT) {
                notes = this.TripletOldFormat(notes);
            } else if (
                this.current?.type === TokenType.IRREGULAR_GROUP_START
            ) {
                notes = notes.concat(
                    this.IrregularGroup(TokenType.IRREGULAR_GROUP_START)
                );
            } else if (this.current?.type === TokenType.TRIPLET_NEW_FORMAT) {
                notes = notes.concat(
                    this.IrregularGroup(TokenType.TRIPLET_NEW_FORMAT)
                );
            } else {
                notes = notes.concat(this.GetBarNote());
            }
        }

        this.ParseTimeLineEnd();

        return {
            notes: notes,
        };
    }

    GetBarNote(): Note[] {
        let note: Note;
        let notes: Note[] = [];

        this.ParseTimeLineStart();
        const tied = this.Tie();
        const embellishment = this.Embellishment();
        this.ParseTimeLineStart();
        if (this.current?.type === TokenType.TRIPLET_NEW_FORMAT) {
            notes = notes.concat(
                this.IrregularGroup(TokenType.TRIPLET_NEW_FORMAT)
            );
            if (
                notes &&
                embellishment &&
                "notes" in notes[0].value &&
                "embellishment" in notes[0].value.notes[0].value
            ) {
                notes[0].value.notes[0].value.embellishment = embellishment;
            }

            return notes;
        } else {
            note = this.Note(tied, embellishment);
            this.BarLineTie(note);
            notes = notes.concat(this.OldTie(note));

            this.ParseTimeLineEnd();

            return notes;
        }
    }

    ParseTimeLineStart(): void {
        this.match(TokenType.TIME_LINE_START);
    }

    ParseTimeLineEnd(): void {
        this.match(TokenType.TIME_LINE_END);
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
            notes = notes.concat(this.Note(this.Tie(), this.Embellishment()));
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
        if (!this.matchAny(TokenType.IRREGULAR_GROUP_END, TokenType.TRIPLET_OLD_FORMAT)) {
            throw new SyntaxError(`Expected irregular group end or triplet old format, got ${this.current?.type}`)
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

    Tie(): boolean {
        if (this.match(TokenType.TIE_START)) {
            this.tieNextNote = true;
            return true;
        }

        return false;
    }

    HandleTieEnd(): boolean {
        if (this.tieNextNote) {
            this.CheckForTieEnd();
            return true;
        }

        return false;
    }

    CheckForTieEnd(): void {
        if (this.match(TokenType.TIE_OLD_FORMAT)) {
            this.tieNextNote = false;
        }
    }

    OldTie(note: Note): Note[] {
        const notes: Note[] = [];

        notes.push(note);

        if (this.match(TokenType.TIE_OLD_FORMAT)) {
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
        }
    }

    AddTieToNote(note: Note): void {
        if ("tied" in note.value) {
            note.value.tied = true;
        }
    }

    OldFormatTieNextNote(): Note | null {
        let nextNote;

        if (this.current?.type === TokenType.BAR_LINE) {
            this.oldFormatBarlineTie = true;
        } else {
            nextNote = this.Note(true, this.Embellishment());

            if ("tied" in nextNote.value) {
                nextNote.value.tied = true;
            }

            return nextNote;
        }

        return null;
    }

    Note(tied: boolean, embellishment: Embellishment | DoubleGracenote): Note {
        const accidental =
            this.current?.type === TokenType.ACCIDENTAL
                ? this.Accidental().type
                : "none";

        const restToken = this.matchToken(TokenType.REST);
        if (restToken) {
            return {
                type: "rest",
                value: {
                    length: restToken.value[1],
                },
            };
        } else {
            tied = this.Tie();
            const token = this.eat(TokenType.MELODY_NOTE);
            const fermata = this.Fermata();

            if (!tied) {
                tied = this.HandleTieEnd();
            }
            return {
                type: "single",
                value: {
                    length: token.value[3],
                    pitch: token.value[1],
                    accidental: accidental,
                    tied: tied,
                    fermata: fermata,
                    dot: this.Dot(),
                    embellishment: embellishment,
                },
            };
        }
    }

    Fermata(): boolean {
        if (this.current?.type === TokenType.FERMATA) {
            this.eat(TokenType.FERMATA);
            return true;
        }

        return false;
    }

    Dot(): Dot {
        const token = this.matchToken(TokenType.DOTTED_NOTE);
        if (token) {
            return token.value[1].length === 1 ? "single" : "double";
        }

        return "none";
    }

    Embellishment(): Embellishment | DoubleGracenote {
        switch (this.current?.type) {
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
        const embellishment = EmbellishmentMap.get(lookup);
        if (embellishment) {
            return embellishment;
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

        while (this.current?.type === TokenType.ACCIDENTAL) {
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
        const token = this.matchToken(TokenType.TIME_SIGNATURE);
        if (token) {
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

        while (this.current && matching) {
            switch (this.current.type) {
                case TokenType.SOFTWARE_HEADER:
                    headers.push(this.SoftwareHeader());
                    break;
                case TokenType.MIDI_NOTE_MAPPINGS_HEADER:
                    headers.push(this.Header(this.current.type));
                    break;
                case TokenType.FREQUENCY_MAPPINGS_HEADER:
                    headers.push(this.Header(this.current.type));
                    break;
                case TokenType.INSTRUMENT_MAPPINGS_HEADER:
                    headers.push(this.Header(this.current.type));
                    break;
                case TokenType.GRACENOTE_DURATIONS_HEADER:
                    headers.push(this.Header(this.current.type));
                    break;
                case TokenType.FONT_SIZES_HEADER:
                    headers.push(this.Header(this.current.type));
                    break;
                case TokenType.TUNE_FORMAT_HEADER:
                    headers.push(this.Header(this.current.type));
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
                version: token.value[3],
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
