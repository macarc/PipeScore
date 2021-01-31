import { Pitch } from '../all';

interface ReactiveGracenote {
  type: 'reactive',
  name: string
}

interface SingleGracenote {
  type: 'single',
  note: Pitch,
}

interface NoGracenote {
  type: 'none'
}

export type GracenoteModel = ReactiveGracenote | SingleGracenote | NoGracenote;

// consider naming this better
export type Gracenote = Pitch[];

export interface InvalidGracenote {
  gracenote: Gracenote
}

