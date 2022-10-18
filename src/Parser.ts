import { Token, TokenType } from "../types/main";
import embellishmentMap from "./Embellishments";
import Tokenizer from "./Tokenizer";

export default class Parser {
    private data: string;
    private tokenizer: Tokenizer;
    private lookahead!: Token | null;

    constructor() {
        this.data = "";
        this.tokenizer = new Tokenizer();
    }

    /**
     * Returns an AST of the BWW file
     */
    parse(data: string): object {
        this.data = data;
        this.tokenizer.init(this.data);

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

    private eat(tokenType: TokenType) {
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

    Score() {
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

    Staves() {
        const staves = [];

        while (this.lookahead?.type === TokenType.CLEF) {
            this.eat(TokenType.CLEF);
            staves.push(this.Stave(this.KeySignature(), this.TimeSignature()));
        }

        return staves;
    }

    Stave(key: string[], time: string | object) {
        let bars: object[] = [];

        if (this.lookahead?.type === TokenType.PART_BEGINNING) {
            this.eat(TokenType.PART_BEGINNING);
            bars = this.Bars();
            this.EndStave();
        }

        if (this.HasNote()) {
            bars = this.Bars();
            this.EndStave();
        }

        return {
            clef: {
                key: key,
                time: time,
            },
            bars: bars,
        };
    }

    EndStave() {
        switch (this.lookahead?.type) {
            case TokenType.PART_END:
                this.eat(TokenType.PART_END);
                break;
            case TokenType.TERMINATING_BAR_LINE:
                this.eat(TokenType.TERMINATING_BAR_LINE);
                break;
        }
    }

    Bars(): object[] {
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

    Bar() {
        const notes = [];

        while (this.HasNote()) {
            notes.push(this.Note());
        }

        return {
            notes: notes,
        };
    }

    Note() {
        const embellishment = this.Embellishment();
        const token = this.eat(TokenType.MELODY_NOTE);

        return {
            length: token.value[3],
            pitch: token.value[1],
            tied: false,
            dotted: this.Dot(),
            embellishment: embellishment,
        };
    }

    Dot() {
        if (this.lookahead?.type === TokenType.DOTTED_NOTE) {
            this.eat(TokenType.DOTTED_NOTE);
            return true;
        }

        return false;
    }

    Embellishment() {
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

    DoubleGracenote() {
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

    TripleStrike() {
        const token = this.eat(TokenType.TRIPLE_STRIKE);
        return {
            type: embellishmentMap.get(token.value[1]),
            value: { note: token.value[2] },
        };
    }

    DoubleStrike() {
        const token = this.eat(TokenType.DOUBLE_STRIKE);
        return {
            type: embellishmentMap.get(token.value[1]),
            value: { note: token.value[2] },
        };
    }

    Pele() {
        const token = this.eat(TokenType.PELE);
        return {
            type: embellishmentMap.get(token.value[1]),
            value: { note: token.value[2] },
        };
    }

    Birl() {
        const token = this.eat(TokenType.BIRL);
        return {
            type: embellishmentMap.get(token.value[1]),
        };
    }

    Throw() {
        const token = this.eat(TokenType.THROW);
        return {
            type: embellishmentMap.get(token.value[1]),
        };
    }

    Taorluath() {
        const token = this.eat(TokenType.TAORLUATH);
        return {
            type: embellishmentMap.get(token.value[1]),
        };
    }

    Bubbly() {
        const token = this.eat(TokenType.BUBBLY);
        return {
            type: embellishmentMap.get(token.value[1]),
        };
    }

    Grip() {
        const token = this.eat(TokenType.REGULAR_GRIP);
        return {
            type: embellishmentMap.get(token.value[1]),
        };
    }

    ComplexGrip() {
        const token = this.eat(TokenType.COMPLEX_GRIP);
        if (token.value[2]) {
            return {
                type: embellishmentMap.get(token.value[1]),
                value: {
                    note: token.value[2],
                },
            };
        }
        return {
            type: embellishmentMap.get(token.value[1]),
        };
    }

    Strike() {
        const token = this.eat(TokenType.STRIKE);
        return {
            type: embellishmentMap.get(token.value[1]),
            value: {
                note: token.value[2],
            },
        };
    }

    Doubling() {
        const token = this.eat(TokenType.DOUBLING);
        return {
            type: embellishmentMap.get(token.value[1]),
            value: {
                note: token.value[2],
            },
        };
    }

    GraceNote() {
        const token = this.eat(TokenType.GRACENOTE);
        return {
            type: "gracenote",
            value: {
                note: token.value[1],
            },
        };
    }

    KeySignature() {
        const keys = [];

        while (this.lookahead?.type === TokenType.KEY_SIGNATURE) {
            keys.push(this.eat(TokenType.KEY_SIGNATURE).value[1]);
        }

        return keys;
    }

    TimeSignature() {
        if (this.lookahead?.type === TokenType.TIME_SIGNATURE) {
            const token = this.eat(TokenType.TIME_SIGNATURE);
            if (token.value[1]) {
                return {
                    top: token.value[1],
                    bottom: token.value[2],
                };
            } else if (token.value[3]) {
                return "cut";
            } else {
                return "common";
            }
        }

        return {};
    }

    Headers() {
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

    SoftwareHeader() {
        const token = this.eat(TokenType.SOFTWARE_HEADER);

        return {
            type: token.type,
            value: {
                program: token.value[1],
                version: token.value[2],
            },
        };
    }

    TuneTempoHeader() {
        const token = this.eat(TokenType.TUNE_TEMPO_HEADER);

        return {
            type: token.type,
            value: token.value[1],
        };
    }

    TextTagHeader() {
        const token = this.eat(TokenType.TEXT_TAG);

        return {
            type: token.type,
            value: {
                text: token.value[1],
                textType: token.value[2],
            },
        };
    }

    Header(tokenType: TokenType) {
        const token = this.eat(tokenType);

        return {
            type: token.type,
            value: token.value[0],
        };
    }
}
