import { TokenStream } from '../Tokeniser';
import { Header, TextTagHeader, SoftwareHeader } from '../model';
import { TokenType } from '../token';

export function headers(ts: TokenStream): string[] {
  const textboxes = [];
  let matching = true;

  while (!ts.isAtEnd() && matching) {
    switch (ts.currentType()) {
      case TokenType.SOFTWARE_HEADER:
      case TokenType.MIDI_NOTE_MAPPINGS_HEADER:
      case TokenType.FREQUENCY_MAPPINGS_HEADER:
      case TokenType.INSTRUMENT_MAPPINGS_HEADER:
      case TokenType.GRACENOTE_DURATIONS_HEADER:
      case TokenType.FONT_SIZES_HEADER:
      case TokenType.TUNE_FORMAT_HEADER:
      case TokenType.TUNE_TEMPO_HEADER:
        ts.eatAny();
        break;
      case TokenType.TEXT_TAG:
        textboxes.push(textTagHeader(ts));
        break;
      default:
        matching = false;
    }
  }

  return textboxes;
}

function textTagHeader(ts: TokenStream): string {
  const token = ts.eat(TokenType.TEXT_TAG);
  return token.value[1];
}
