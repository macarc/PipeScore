import { TokenStream } from '../Tokenizer';
import {
  Header,
  TextTagHeader,
  SoftwareHeader,
  TokenType,
} from '../../types/main';

export function headers(
  ts: TokenStream
): (Header | TextTagHeader | SoftwareHeader)[] {
  const headers = [];
  let matching = true;

  while (!ts.isAtEnd() && matching) {
    switch (ts.currentType()) {
      case TokenType.SOFTWARE_HEADER:
        headers.push(softwareHeader(ts));
        break;
      case TokenType.MIDI_NOTE_MAPPINGS_HEADER:
      case TokenType.FREQUENCY_MAPPINGS_HEADER:
      case TokenType.INSTRUMENT_MAPPINGS_HEADER:
      case TokenType.GRACENOTE_DURATIONS_HEADER:
      case TokenType.FONT_SIZES_HEADER:
      case TokenType.TUNE_FORMAT_HEADER:
        headers.push(header(ts));
        break;
      case TokenType.TUNE_TEMPO_HEADER:
        headers.push(tuneTempoHeader(ts));
        break;
      case TokenType.TEXT_TAG:
        headers.push(textTagHeader(ts));
        break;
      default:
        matching = false;
    }
  }

  return headers;
}

function softwareHeader(ts: TokenStream): SoftwareHeader {
  const token = ts.eat(TokenType.SOFTWARE_HEADER);

  return {
    type: token.type,
    value: {
      program: token.value[1],
      version: token.value[3],
    },
  };
}

function tuneTempoHeader(ts: TokenStream): Header {
  const token = ts.eat(TokenType.TUNE_TEMPO_HEADER);

  return {
    type: token.type,
    value: token.value[1],
  };
}

function textTagHeader(ts: TokenStream): TextTagHeader {
  const token = ts.eat(TokenType.TEXT_TAG);

  return {
    type: token.type,
    value: {
      text: token.value[1],
      textType: token.value[2],
    },
  };
}

function header(ts: TokenStream): Header {
  const token = ts.eatAny();

  if (token === null)
    throw new SyntaxError('Expected header, got end of input.');

  return {
    type: token.type,
    value: token.value[0],
  };
}
