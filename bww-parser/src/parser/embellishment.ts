import { TokenType, Embellishment, DoubleGracenote } from '../../types/main';
import { TokenStream } from '../Tokeniser';
import { embellishmentName } from '../Embellishments';

export function embellishment(
  ts: TokenStream
): Embellishment | DoubleGracenote {
  switch (ts.currentType()) {
    case TokenType.DOUBLING:
    case TokenType.STRIKE:
    case TokenType.REGULAR_GRIP:
    case TokenType.TAORLUATH:
    case TokenType.BUBBLY:
    case TokenType.BIRL:
    case TokenType.THROW:
    case TokenType.PELE:
    case TokenType.DOUBLE_STRIKE:
    case TokenType.TRIPLE_STRIKE:
      return simpleEmbellishment(ts);
    case TokenType.GRACENOTE:
      return gracenote(ts);
    case TokenType.DOUBLE_GRACENOTE:
      return doubleGracenote(ts);
    case TokenType.COMPLEX_GRIP:
      return complexGrip(ts);
    default:
      return {};
  }
}

function simpleEmbellishment(ts: TokenStream) {
  const token = ts.eatAny();

  if (token === null) throw new Error('Expected gracenote');

  const type = embellishmentName(token.value[1]);
  const note = token.value[2];

  if (note) {
    return { type, value: { note } };
  } else {
    return { type };
  }
}

function gracenote(ts: TokenStream) {
  const token = ts.eat(TokenType.GRACENOTE);
  return {
    type: 'gracenote',
    value: { note: token.value[1] },
  };
}

function doubleGracenote(ts: TokenStream): DoubleGracenote {
  const token = ts.eat(TokenType.DOUBLE_GRACENOTE);
  const notes = [];

  if (token.value[1] === 't') {
    notes.push('a');
  } else {
    notes.push(token.value[1]);
  }

  notes.push(token.value[2]);

  return {
    type: 'gracenotes',
    value: {
      notes: notes,
    },
  };
}

function complexGrip(ts: TokenStream): Embellishment {
  const token = ts.eat(TokenType.COMPLEX_GRIP);
  if (token.value[2]) {
    return {
      type: embellishmentName(token.value[1]),
      value: {
        note: token.value[2],
      },
    };
  }
  return {
    type: embellishmentName(token.value[1]),
  };
}
