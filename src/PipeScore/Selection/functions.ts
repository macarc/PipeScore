import { ID } from '../global/id';
import { NoteModel } from '../Note/model';
import { TextBoxModel } from '../TextBox/model';
import { ScoreSelection, SelectionModel, TextSelection } from './model';

const scoreSelection = (start: ID, end: ID): SelectionModel => ({
  type: 'score selected',
  start,
  end,
});

const textSelection = (text: TextBoxModel): SelectionModel => ({
  type: 'text selected',
  text,
});

const isScoreSelection = (
  selection: SelectionModel | null
): selection is ScoreSelection =>
  (selection || false) && selection.type === 'score selected';

const isTextSelection = (
  selection: SelectionModel | null
): selection is TextSelection =>
  (selection || false) && selection.type === 'text selected';

export default {
  isScoreSelection,
  isTextSelection,
  scoreSelection,
  textSelection,
};
