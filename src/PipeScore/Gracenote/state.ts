import { SingleGracenote, GracenoteModel } from './model';

export interface GracenoteState {
  dragged: SingleGracenote | null;
  selected: GracenoteModel | null;
}
