/*
  Gracenote methods
  Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { gracenotes } from './gracenotes';
export { gracenotes };

import {
  ReactiveGracenote,
  SingleGracenote,
  NoGracenote,
  Gracenote,
} from './model';

// Convert from name to gracenote
const from = (name: string | null): Gracenote =>
  name === null
    ? new SingleGracenote(Pitch.HG)
    : name === 'none'
    ? new NoGracenote()
    : new ReactiveGracenote(name);
