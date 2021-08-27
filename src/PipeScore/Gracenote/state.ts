/*
  Define state required for gracenotes
  Copyright (C) 2021 Archie Maclean
*/
import { SingleGracenote, GracenoteModel } from './model';

export interface GracenoteState {
  dragged: SingleGracenote | null;
  selected: GracenoteModel | null;
}
