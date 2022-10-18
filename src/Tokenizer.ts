import { Token, TokenType } from "../types/main";
import Spec from "./Spec";

export default class Tokenizer {
    private stream: string;
    private cursor: number;

    constructor() {
        this.stream = "";
        this.cursor = 0;
    }

    init(stream: string) {
        this.stream = stream;
        this.cursor = 0;
    }

    isEOF(): boolean {
        return this.cursor === this.stream.length;
    }

    hasMoreTokens(): boolean {
        return this.cursor < this.stream.length;
    }

    getNextToken(): Token | null {
        if (!this.hasMoreTokens()) {
            return null;
        }

        const slice = this.stream.slice(this.cursor);

        for (const item of Spec) {
            const token = item.regex.exec(slice);

            // Couldn't match this rule, continue.
            if (token == null) {
                continue;
            }

            this.cursor += token[0].length;

            if (item.type === TokenType.SKIP) {
                return this.getNextToken();
            }

            return {
                type: item.type,
                value: token,
            };
        }

        const match = /^([^\s]*)/.exec(slice);
        throw new SyntaxError(`Unexpected token: "${match ? match[1] : ""}"`);
    }
}
