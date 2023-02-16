import { TokenType } from '../token';
import { TokenStream } from '../Tokeniser';
import { SavedGracenote } from '../../PipeScore/SavedModel';
import { toGracenotePitch, toPitch } from './pitch';

export function embellishment(ts: TokenStream): SavedGracenote {
  switch (ts.currentType()) {
    case TokenType.DOUBLING:
      if (ts.peek()?.value[0] === 'dbhg') {
        ts.eatAny();
        return {
          type: 'reactive',
          value: { grace: 'half-doubling' },
        };
      }
      return reactive(ts, 'doubling');
    case TokenType.REGULAR_GRIP:
      return reactive(ts, 'grip');
    case TokenType.COMPLEX_GRIP:
      return complexGrip(ts);
    case TokenType.TAORLUATH:
      return reactive(ts, 'toarluath');
    case TokenType.BUBBLY:
      return reactive(ts, 'bubbly');
    case TokenType.BIRL:
      return birl(ts);
    case TokenType.EDRE:
      return reactive(ts, 'edre');
    case TokenType.THROW:
      return reactive(ts, 'throw-d');
    case TokenType.PELE:
      return reactive(ts, 'shake');
    case TokenType.STRIKE:
      return strike(ts);
    case TokenType.DOUBLE_STRIKE:
      throw new Error("Can't deal with double strike");
    case TokenType.TRIPLE_STRIKE:
      throw new Error("Can't deal with double strike");
    case TokenType.GRACENOTE:
      return gracenote(ts);
    case TokenType.DOUBLE_GRACENOTE:
      return doubleGracenote(ts);
    default:
      return { type: 'none' };
  }
}

function reactive(ts: TokenStream, name: string): SavedGracenote {
  const token = ts.eatAny();
  if (token === null) throw new Error('Expected gracenote');

  return { type: 'reactive', value: { grace: name } };
}

function gracenote(ts: TokenStream): SavedGracenote {
  const token = ts.eat(TokenType.GRACENOTE);
  return {
    type: 'single',
    value: { note: toGracenotePitch(token.value[1]) },
  };
}

function doubleGracenote(ts: TokenStream): SavedGracenote {
  const token = ts.eat(TokenType.DOUBLE_GRACENOTE);
  const notes: string[] = [];

  if (token.value[1] === 't') {
    notes.push('a');
  } else {
    notes.push(token.value[1]);
  }

  notes.push(token.value[2]);

  // FIXME: notes isn't an array of pitches: this will crash
  return {
    type: 'custom',
    value: { pitches: notes.map(toPitch) },
  };
}

function strike(ts: TokenStream): SavedGracenote {
  // FIXME: deal with 'light' strikes, prefixed with 'l'
  const token = ts.eat(TokenType.STRIKE);
  const partBeforeStrike = token.value[1];
  if (partBeforeStrike) {
    return {
      type: 'reactive',
      value: { grace: 'g-strike' },
    };
  }

  return {
    type: 'single',
    value: { note: toPitch(token.value[2]) },
  };
}

function birl(ts: TokenStream): SavedGracenote {
  const token = ts.eat(TokenType.BIRL);
  if (token.value[0] === 'brl' || token.value[0] === 'abr') {
    return {
      type: 'reactive',
      value: { grace: 'birl' },
    };
  } else if (token.value[0] === 'gbr' || token.value[0] === 'tbr') {
    return {
      type: 'reactive',
      value: { grace: 'g-gracenote-birl' },
    };
  }
  throw new Error(`Unrecognised birl '${token.value[0]}'`);
}

function complexGrip(ts: TokenStream): SavedGracenote {
  ts.warn(
    "Can't deal with grips with gracenotes on them. Replacing with standard grip."
  );
  return {
    type: 'reactive',
    value: { grace: 'grip' },
  };
}
