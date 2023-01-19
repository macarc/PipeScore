import { Token, TokenType } from "../types/main";
import Spec from "./Spec";

export type TokenStream = () => Token | null;

export function tokenise(stream: string): TokenStream {
    let cursor = 0;
    const nextToken: TokenStream = () => {
        if (cursor >= stream.length) {
            return null;
        }

        const slice = stream.slice(cursor);

        for (const item of Spec) {
            const token = item.regex.exec(slice);

            // Couldn't match this rule, continue.
            if (token == null) {
                continue;
            }

            cursor += token[0].length;

            if (item.type === TokenType.SKIP) {
                return nextToken();
            }

            return {
                type: item.type,
                value: token,
            };
        }

        const match = /^([^\s]*)/.exec(slice);
        throw new SyntaxError(`Unexpected token: "${match ? match[1] : ""}"`);
    }
    
    return nextToken;
}