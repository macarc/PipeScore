import { Token, TokenType } from "../types/main";
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
            throw new SyntaxError(`Unexpected token: "${token.type}"`);
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
            staves: [],
        };
    }

    Headers() {
        let headers = [];
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
