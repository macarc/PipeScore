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
    const selectionStart = stave2.measures()[0].bars()[0].id;
    const selectionEnd = stave2.measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(state.score.staves()).toHaveLength(4);
    expect(await deleteSelection()(state)).toBe(Update.ShouldSave);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0]).toBe(stave0);
    expect(state.score.staves()[1]).toBe(stave1);
    expect(state.score.staves()[2]).toBe(stave3);
  });
  it('doesn\'t delete a bar if only the harmony stave is selected', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    state.selection = ScoreSelection.from(state.score.staves()[1].measures()[1].bars()[1].id, state.score.staves()[1].measures()[1].bars()[1].id, false);
    expect(state.score.staves()[1].numberOfMeasures()).toBe(4);
    await deleteSelection()(state);
    expect(state.score.staves()[1].numberOfMeasures()).toBe(4);
  });
  it('doesn\'t delete bars if only harmony bars are selected', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    state.selection = ScoreSelection.from(state.score.staves()[1].measures()[0].bars()[1].id, state.score.staves()[1].measures()[2].bars()[1].id, false);
    expect(state.score.staves()[1].numberOfMeasures()).toBe(4);
    await deleteSelection()(state);
    expect(state.score.staves()[1].numberOfMeasures()).toBe(4);
  });
});
