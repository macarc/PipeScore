import { BaseNote, NoteModel, TripletModel } from './Note/model';
import { DemoNoteModel } from './DemoNote/model';
import { GracenoteModel, SingleGracenote } from './Gracenote/model';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from '../render/h';
import { TextBoxModel } from './TextBox/model';
import { DraggedSecondTiming } from './SecondTiming/model';
import { ScoreModel } from './Score/model';
import { SecondTimingModel } from './SecondTiming/model';
import { ScoreSelectionModel } from './ScoreSelection/model';

import { NoteState } from './Note/state';
import { GracenoteState } from './Gracenote/state';
import { TextBoxState } from './TextBox/state';

export interface State {
  justClickedNote: boolean;
  note: {
    dragged: BaseNote | null;
    demo: DemoNoteModel | null;
  };
  gracenote: {
    dragged: SingleGracenote | null;
    // TODO this should be handled by ScoreSelection ?
    selected: GracenoteModel | null;
    input: GracenoteModel | null;
  };
  secondTiming: {
    selected: SecondTimingModel | null;
    dragged: DraggedSecondTiming | null;
  };
  text: {
    dragged: TextBoxModel | null;
    selected: TextBoxModel | null;
  };
  ui: {
    zoom: number;
    menu: Menu;
  };
  doc: {
    current: string | null;
    show: boolean;
  };
  clipboard: (NoteModel | TripletModel | 'bar-break')[] | null;
  selection: ScoreSelectionModel | null;
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
  //draggedNote: BaseNote | null;
  //playbackState: PlaybackState;
  //currentMenu: Menu;
  //zoomLevel: number;
  //justClickedNote: boolean;
  //currentDocumentation: string | null;
  //showDocumentation: boolean;
  //selectedSecondTiming: SecondTimingModel | null;
  //draggedText: TextBoxModel | null;
  //inputGracenote: GracenoteModel | null;
  //history: string[];
  //future: string[];
  //draggedSecondTiming: DraggedSecondTiming | null;
  //view: V | null;
  //uiView: V | null;
}
