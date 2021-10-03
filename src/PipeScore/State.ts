/*
  State.ts - Defines global State interface
  Copyright (C) 2021 Archie Maclean
*/

import { BaseNote, NoteModel, TripletModel } from './Note/model';
import { DemoNoteModel } from './DemoNote/model';
import { Gracenote, SingleGracenote } from './Gracenote/model';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from '../render/h';
import { TextBoxModel } from './TextBox/model';
import { DraggedSecondTiming } from './SecondTiming/model';
import { ScoreModel } from './Score/model';
import { SecondTimingModel } from './SecondTiming/model';
import { SelectionModel } from './Selection/model';

export interface State {
  justClickedNote: boolean;
  note: {
    dragged: BaseNote | null;
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
  draggedText: TextBoxModel | null;
  ui: {
    zoom: number;
    menu: Menu;
  };
  doc: {
    current: string | null;
    show: boolean;
  };
  clipboard: (NoteModel | TripletModel | 'bar-break')[] | null;
  selection: SelectionModel | null;
  history: {
    past: string[];
    future: string[];
  };
  view: {
    ui: V | null;
    score: V | null;
  };
  playback: PlaybackState;

  score: ScoreModel;
}
