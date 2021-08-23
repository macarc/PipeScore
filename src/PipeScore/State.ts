import { BaseNote, NoteModel, TripletModel } from './Note/model';
import { DemoNoteModel } from './DemoNote/model';
import { GracenoteModel } from './Gracenote/model';
import { GracenoteState } from './Gracenote/view';
import { PlaybackState } from './Playback';
import { Menu } from './UI/model';
import { V } from '../render/h';
import { TextBoxModel } from './TextBox/model';
import { TextBoxState } from './TextBox/view';
import { DraggedSecondTiming } from './SecondTiming/model';
import { ScoreModel } from './Score/model';
import { SecondTimingModel } from './SecondTiming/model';
import { ScoreSelectionModel } from './ScoreSelection/model';

export interface State {
  draggedNote: BaseNote | null;
  demoNote: DemoNoteModel | null;
  gracenoteState: GracenoteState;
  playbackState: PlaybackState;
  currentMenu: Menu;
  zoomLevel: number;
  justClickedNote: boolean;
  interfaceWidth: number;
  textBoxState: TextBoxState;
  currentDocumentation: string | null;
  showDocumentation: boolean;
  clipboard: (NoteModel | TripletModel | 'bar-break')[] | null;
  selection: ScoreSelectionModel | null;
  selectedSecondTiming: SecondTimingModel | null;
  draggedText: TextBoxModel | null;
  inputGracenote: GracenoteModel | null;
  score: ScoreModel;
  history: string[];
  future: string[];
  draggedSecondTiming: DraggedSecondTiming | null;
  view: V | null;
  uiView: V | null;
}
