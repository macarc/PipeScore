/*
   Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';

export interface ReactiveGracenote {
  type: 'reactive',
  name: string
}

export interface SingleGracenote {
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
