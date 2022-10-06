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
            throw new SyntaxError(`Unexpected token: "${token.value}"`);
        }

        this.lookahead = this.tokenizer.getNextToken();

        return token;
    }

    Score() {
        const token = this.eat("SOFTWARE_HEADER");
        return {
            name: "",
            staves: [],
        };
    }
}
