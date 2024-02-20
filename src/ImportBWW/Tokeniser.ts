import { Spec } from './Spec';
import { Token, TokenType } from './token';

export class TokenStream {
  private stream: string;
  private cursor = 0;
  private last: Token | null = null;
  private current: Token | null = null;
  public warnings: string[] = [];

  constructor(stream: string) {
    // Add some whitespace on the end since many
    // tokens check for whitespace after to ensure
    // that they match an entire word
    this.stream = `${stream} `;
    this.nextToken();
  }

  public warn(msg: string) {
    this.warnings.push(`Warning at ${this.last?.type}: ${msg}`);
  }

  public eat(tokenType: TokenType) {
    const token = this.current;

    if (token === null) {
      throw new SyntaxError(
        `Unexpected end of input, expected: "${tokenType}"`
      );
    }

    if (token.type !== tokenType) {
      throw new SyntaxError(
        `Unexpected token: "${token.type}", expected: "${tokenType}"`
      );
    }

    this.nextToken();

    return token;
  }

  public isAtEnd() {
    return this.current === null;
  }

  public match(tokenType: TokenType): boolean {
    if (this.current?.type === tokenType) {
      this.eat(tokenType);
      return true;
    }
    return false;
  }

  public eatAny() {
    const token = this.current;
    this.nextToken();
    return token;
  }

  private skipWhitespace() {
    const firstNonWhitespace = /[^\s]/.exec(this.stream.slice(this.cursor));
    if (!firstNonWhitespace) {
      this.cursor = this.stream.length;
    } else {
      this.cursor += firstNonWhitespace.index;
    }
  }

  private nextToken(): Token | null {
    this.skipWhitespace();

    this.last = this.current;

    if (this.cursor >= this.stream.length) {
      this.current = null;
      return null;
    }

    const slice = this.stream.slice(this.cursor);

    for (const spec of Spec) {
      const token = spec.regex.exec(slice);
      if (token) {
        this.cursor += token[0].length;
        this.current = {
          type: spec.type,
          value: token,
        };

        return this.current;
      }
    }

    const word = /[^\s]*/.exec(slice);
    throw new Error(`Unexpected token: "${word ? word[0] : '[nothing]'}"`);
  }
}
