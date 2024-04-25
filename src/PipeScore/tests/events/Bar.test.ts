import { moveBarToNextLine, moveBarToPreviousLine } from '../../Events/Bar';
import { ScoreSelection } from '../../Selection/score';
import { emptyState } from './common';

describe('moveBarToNextLine', () => {
  it('does nothing with nothing selected', async () => {
    const state = emptyState();
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToNextLine()(state);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
  });
  it('does nothing if a bar in the middle of a line is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].bars()[2].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToNextLine()(state);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
  });
  it('does nothing if the last bar is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[3].bars()[3].id;
    const selectionEnd = state.score.staves()[3].bars()[3].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToNextLine()(state);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
  });
  it('moves a single bar to next line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[3].id;
    const selectionEnd = state.score.staves()[1].bars()[3].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].bars().length).toBe(4);
    expect(state.score.staves()[1].bars().length).toBe(3);
    expect(state.score.staves()[2].bars().length).toBe(5);
    expect(state.score.staves()[3].bars().length).toBe(4);
    expect(state.score.staves()[2].bars()[0].id).toBe(selectionStart);
  });
  it('moves multiple bars to next line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].bars()[3].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].bars().length).toBe(4);
    expect(state.score.staves()[1].bars().length).toBe(1);
    expect(state.score.staves()[2].bars().length).toBe(7);
    expect(state.score.staves()[3].bars().length).toBe(4);
    expect(state.score.staves()[2].bars()[0].id).toBe(selectionStart);
    expect(state.score.staves()[2].bars()[2].id).toBe(selectionEnd);
  });
  it('deletes the stave if all of the bars are moved to the next line', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].bars()[3].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    expect(state.score.staves()).toHaveLength(4);
    await moveBarToNextLine()(state);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0].bars().length).toBe(4);
    expect(state.score.staves()[1].bars().length).toBe(8);
    expect(state.score.staves()[2].bars().length).toBe(4);
    expect(state.score.staves()[1].bars()[0].id).toBe(selectionStart);
    expect(state.score.staves()[1].bars()[3].id).toBe(selectionEnd);
  });
});

describe('moveBarToPreviousLine', () => {
  it('does nothing with nothing selected', async () => {
    const state = emptyState();
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToPreviousLine()(state);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
  });
  it('does nothing if a bar in the middle of a line is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].bars()[2].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToPreviousLine()(state);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
  });
  it('does nothing if the first bar is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[0].bars()[0].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToPreviousLine()(state);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
  });
  it('moves a single bar to previous line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].bars()[0].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].bars().length).toBe(5);
    expect(state.score.staves()[1].bars().length).toBe(3);
    expect(state.score.staves()[2].bars().length).toBe(4);
    expect(state.score.staves()[3].bars().length).toBe(4);
    expect(state.score.staves()[0].bars()[4].id).toBe(selectionStart);
  });
  it('moves multiple bars to previous line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].bars()[2].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].bars().length).toBe(7);
    expect(state.score.staves()[1].bars().length).toBe(1);
    expect(state.score.staves()[2].bars().length).toBe(4);
    expect(state.score.staves()[3].bars().length).toBe(4);
    expect(state.score.staves()[0].bars()[4].id).toBe(selectionStart);
    expect(state.score.staves()[0].bars()[6].id).toBe(selectionEnd);
  });
  it('deletes the stave if all of the bars are moved to the previous line', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].bars()[3].id;
    state.selection = new ScoreSelection(selectionStart, selectionEnd, false);
    expect(state.score.staves().every((stave) => stave.bars().length === 4)).toBe(
      true
    );
    expect(state.score.staves()).toHaveLength(4);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0].bars().length).toBe(8);
    expect(state.score.staves()[1].bars().length).toBe(4);
    expect(state.score.staves()[2].bars().length).toBe(4);
    expect(state.score.staves()[0].bars()[4].id).toBe(selectionStart);
    expect(state.score.staves()[0].bars()[7].id).toBe(selectionEnd);
  });
});
