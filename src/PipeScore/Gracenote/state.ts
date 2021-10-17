/*
  Define state required for gracenotes
  Copyright (C) 2021 Archie Maclean
*/
import { Gracenote } from '.';

type SelectedGracenote = {
  gracenote: Gracenote;
  note: number;
};

export interface GracenoteState {
  dragged: SelectedGracenote | null;
  selected: SelectedGracenote | null;
}

export const emptyGracenoteState = { dragged: null, selected: null };
