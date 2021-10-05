/*
  State.ts - Defines global State interface
  Copyright (C) 2021 Archie Maclean
*/

import { DemoNoteModel } from './DemoNote/model';
import { Gracenote, SingleGracenote } from './Gracenote/model';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from '../render/h';
import { TextBox } from './TextBox/model';
import { DraggedSecondTiming } from './SecondTiming/model';
import { Score } from './Score/model';
import { Selection } from './Selection/model';
import { Note, SingleNote, Triplet, TripletNote } from './Note/model';

export interface State {
  justClickedNote: boolean;
  note: {
    dragged: SingleNote | TripletNote | null;
    demo: DemoNoteModel | null;
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
