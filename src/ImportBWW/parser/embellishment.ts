import { TokenType } from '../token';
import { TokenStream } from '../Tokeniser';
import { embellishmentName } from '../Embellishments';
import { SavedGracenote } from '../../PipeScore/SavedModel';


export function embellishment(
  ts: TokenStream
): SavedGracenote {
  switch (ts.currentType()) {
    case TokenType.DOUBLING:
      return reactive(ts, 'doubling')
    case TokenType.STRIKE:
      break;
    case TokenType.REGULAR_GRIP:
      break;
    case TokenType.TAORLUATH:
      return reactive(ts, 'toarluath')
    case TokenType.BUBBLY:
      break;
    case TokenType.BIRL:
      break;
    case TokenType.THROW:
      return reactive(ts, 'throw');
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
      return { type: 'none' };
  }
}

function reactive(ts: TokenStream, name: string): SavedGracenote {
  const token = ts.eatAny();
  if (token === null) throw new Error('Expected gracenote');

  return { type: 'reactive', value: { grace: name } };
}

function gracenote(ts: TokenStream) {
  const token = ts.eat(TokenType.GRACENOTE);
  return {
    type: 'gracenote',
    value: { note: token.value[1] },
  };
}

function doubleGracenote(ts: TokenStream): SavedGracenote {
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

function complexGrip(ts: TokenStream): SavedGracenote {
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
