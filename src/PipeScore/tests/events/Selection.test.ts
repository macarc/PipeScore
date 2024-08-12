import { deleteSelection } from '../../Events/Selection';
import { Update } from '../../Events/types';
import { ScoreSelection } from '../../Selection/score';
import { emptyState } from './common';

describe('deleteSelection', () => {
  it('deletes a stave when all bars in the stave are deleted', async () => {
    const state = emptyState();
    const stave0 = state.score.staves()[0];
    const stave1 = state.score.staves()[1];
    const stave2 = state.score.staves()[2];
    const stave3 = state.score.staves()[3];
    const selectionStart = stave2.measures()[0].id;
    const selectionEnd = stave2.measures()[3].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves()).toHaveLength(4);
    expect(await deleteSelection()(state)).toBe(Update.ShouldSave);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0]).toBe(stave0);
    expect(state.score.staves()[1]).toBe(stave1);
    expect(state.score.staves()[2]).toBe(stave3);
  });
});
