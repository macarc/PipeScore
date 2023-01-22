import { Token, TokenType } from './token';
import { Spec } from './Spec';

export class TokenStream {
  private stream: string;
  private cursor = 0;
  private current: Token | null;
  public warnings: string[] = [];

  constructor(stream: string) {
    // Add some whitespace on the end since many
    // tokens check for whitespace after to ensure
    // that they match an entire word
    this.stream = stream + ' ';
    this.current = this.nextToken();
  }

  public warn(msg: string) {
    this.warnings.push(msg);
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

  private skipWhitespace() {
    const firstNonWhitespace = /[^\s]/.exec(this.stream.slice(this.cursor));
    if (!firstNonWhitespace) {
      this.cursor = this.stream.length;
    } else {
      this.cursor += firstNonWhitespace.index;
    }
    if (this.stream.slice(this.cursor).match('space')) {
      this.cursor += 5;
      this.skipWhitespace();
    }
  }

  private nextToken(): Token | null {
    this.skipWhitespace();

    if (this.cursor >= this.stream.length) {
      return null;
    }

    const slice = this.stream.slice(this.cursor);

    for (const spec of Spec) {
      const token = spec.regex.exec(slice);
      if (token) {
        this.cursor += token[0].length;
        return {
          type: spec.type,
          value: token,
        };
      }
    }

    const word = /[^\s]*/.exec(slice);
    throw new Error(`Unexpected token: "${word ? word[0] : '[nothing]'}"`);
  }
}
