import { Token, TokenType } from './token';
import Spec from './Spec';

export class TokenStream {
  private stream: string;
  private cursor = 0;
  private current: Token | null;

  constructor(stream: string) {
    this.stream = stream;
    this.current = this.nextToken();
  }

  public eat(tokenType: TokenType) {
    const token = this.current;

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

    this.current = this.nextToken();

    return token;
  }

  public is(tokenType: TokenType): boolean {
    return this.current?.type === tokenType;
  }

  public isAtEnd() {
    return this.current === null;
  }

  public matchToken(tokenType: TokenType): Token | null {
    if (this.current?.type === tokenType) {
      const token = this.current;
      this.eat(tokenType);
      return token;
    }
    return null;
  }

  public match(tokenType: TokenType): boolean {
    return this.matchToken(tokenType) !== null;
  }

  public matchAny(...tokenTypes: TokenType[]): boolean {
    for (const token of tokenTypes) {
      if (this.match(token)) {
        return true;
      }
    }
    return false;
  }

  public peekAny(...tokenTypes: TokenType[]): boolean {
    return tokenTypes.some((tokenType) => this.current?.type === tokenType);
  }

  public currentType() {
    return this.current?.type;
  }

  public eatAny() {
    const token = this.current;
    this.current = this.nextToken();
    return token;
  }

  private nextToken(): Token | null {
    if (this.cursor >= this.stream.length) {
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
        return this.nextToken();
      }

      return {
        type: item.type,
        value: token,
      };
    }

    const match = /^([^\s]*)/.exec(slice);
    throw new SyntaxError(`Unexpected token: "${match ? match[1] : ''}"`);
  }
}
