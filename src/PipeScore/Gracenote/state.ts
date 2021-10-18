/*
  Define state required for gracenotes
  Copyright (C) 2021 macarc
*/
import { Gracenote } from '.';

type SelectedGracenote = {
  gracenote: Gracenote;
  note: number | 'all';
};
type DraggedGracenote = {
  gracenote: Gracenote;
  note: number;
};

export interface GracenoteState {
  dragged: DraggedGracenote | null;
  selected: SelectedGracenote | null;
}

export const emptyGracenoteState = { dragged: null, selected: null };
