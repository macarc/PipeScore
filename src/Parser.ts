import Tokenizer from "./Tokenizer";
import Token from "./types/Token";

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

    private eat(tokenType: string) {
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

        if (this.lookahead) {
            switch (this.lookahead.type) {
                case "SOFTWARE_HEADER":
                    headers.push(this.SoftwareHeader());
                    break;
                case "MIDI_NOTE_MAPPINGS_HEADER":
                    headers.push(this.MIDIHeader());
                    break;
            }
        }

        return headers;
    }

    SoftwareHeader() {
        const token = this.eat("SOFTWARE_HEADER");

        return {
            type: token.type,
            value: {
                program: token.value[1],
                version: token.value[2],
            },
        };
    }

    MIDIHeader() {
        const token = this.eat("MIDI_NOTE_MAPPINGS_HEADER");

        return {
            type: token.type,
            value: token.value[0],
        };
    }
}
