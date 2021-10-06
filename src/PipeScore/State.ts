/*
  State.ts - Defines global State interface
  Copyright (C) 2021 Archie Maclean
*/

import { Demo } from './DemoNote';
import { Gracenote, SingleGracenote } from './Gracenote';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from '../render/h';
import { TextBox } from './TextBox';
import { DraggedSecondTiming } from './SecondTiming';
import { Score } from './Score';
import { Selection } from './Selection';
import { Note, SingleNote, Triplet, TripletNote } from './Note';

export interface State {
  justClickedNote: boolean;
  note: {
    dragged: SingleNote | TripletNote | null;
    demo: Demo | null;
  };
  gracenote: {
    dragged: SingleGracenote | null;
    // TODO this should be handled by ScoreSelection ?
    selected: Gracenote | null;
    input: Gracenote | null;
  };
  draggedSecondTiming: DraggedSecondTiming | null;
  // TODO store in TextSelection?
  draggedText: TextBox | null;
  ui: { menu: Menu };
  doc: {
    current: string | null;
    show: boolean;
  };
  clipboard: (Note | Triplet | 'bar-break')[] | null;
  selection: Selection | null;
  history: {
    past: string[];
    future: string[];
  };
  view: {
    ui: V | null;
    score: V | null;
  };
  playback: PlaybackState;

  score: Score;
}
