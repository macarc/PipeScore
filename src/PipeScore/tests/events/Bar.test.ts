import { moveBarToNextLine, moveBarToPreviousLine } from '../../Events/Bar';
import { ScoreSelection } from '../../Selection/score';
import { emptyState } from './common';

describe('moveBarToNextLine', () => {
  it('does nothing with nothing selected', async () => {
    const state = emptyState();
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('does nothing if a bar in the middle of a line is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('does nothing if the last bar is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[3].measures()[3].bars()[0].id;
    const selectionEnd = state.score.staves()[3].measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('moves a single bar to next line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[3].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(3);
    expect(state.score.staves()[2].measures().length).toBe(5);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[2].measures()[0].bars()[0].id).toBe(selectionStart);
  });
  it('moves multiple bars to next line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(1);
    expect(state.score.staves()[2].measures().length).toBe(7);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[2].measures()[0].bars()[0].id).toBe(selectionStart);
    expect(state.score.staves()[2].measures()[2].bars()[0].id).toBe(selectionEnd);
  });
  it('deletes the stave if all of the bars are moved to the next line', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    expect(state.score.staves()).toHaveLength(4);
    await moveBarToNextLine()(state);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(8);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[1].measures()[0].bars()[0].id).toBe(selectionStart);
    expect(state.score.staves()[1].measures()[3].bars()[0].id).toBe(selectionEnd);
  });

  it('does nothing if a harmony bar in the middle of a line is selected', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('does nothing if the last harmony bar is selected', async () => {
    const state = emptyState();
    state.score.staves()[3].addHarmony()
    const selectionStart = state.score.staves()[3].measures()[3].bars()[1].id;
    const selectionEnd = state.score.staves()[3].measures()[3].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('moves a single bar to next line if harmony bar is selected and next stave has harmony', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    state.score.staves()[2].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[3].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(3);
    expect(state.score.staves()[2].measures().length).toBe(5);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[2].measures()[0].bars()[1].id).toBe(selectionStart);
  });
  it('moves multiple bars to next line if harmony bars are selected and next stave has harmony', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    state.score.staves()[2].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(1);
    expect(state.score.staves()[2].measures().length).toBe(7);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[2].measures()[0].bars()[1].id).toBe(selectionStart);
    expect(state.score.staves()[2].measures()[2].bars()[1].id).toBe(selectionEnd);
  });
  it('adds a harmony to the next stave if harmony bar is moved to it', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[3].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(3);
    expect(state.score.staves()[2].measures().length).toBe(5);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[2].measures()[0].bars()[1].id).toBe(selectionStart);
  });
  it('adds a harmony to the next stave if multiple harmony bars are moved to it', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToNextLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(1);
    expect(state.score.staves()[2].measures().length).toBe(7);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[2].measures()[0].bars()[1].id).toBe(selectionStart);
    expect(state.score.staves()[2].measures()[2].bars()[1].id).toBe(selectionEnd);
  });
  it('deletes the stave if all of the harmony bars are moved to the next line', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    expect(state.score.staves()).toHaveLength(4);
    await moveBarToNextLine()(state);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0].measures().length).toBe(4);
    expect(state.score.staves()[1].measures().length).toBe(8);
    expect(state.score.staves()[2].measures().length).toBe(4);
  });
});

describe('moveBarToPreviousLine', () => {
  it('does nothing with nothing selected', async () => {
    const state = emptyState();
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('does nothing if a bar in the middle of a line is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('does nothing if the first bar is selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[0].measures()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[0].measures()[0].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('moves a single bar to previous line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[0].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(5);
    expect(state.score.staves()[1].measures().length).toBe(3);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[0].id).toBe(selectionStart);
  });
  it('moves multiple bars to previous line if selected', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(7);
    expect(state.score.staves()[1].measures().length).toBe(1);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[0].id).toBe(selectionStart);
    expect(state.score.staves()[0].measures()[6].bars()[0].id).toBe(selectionEnd);
  });
  it('deletes the stave if all of the bars are moved to the previous line', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    expect(state.score.staves()).toHaveLength(4);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0].measures().length).toBe(8);
    expect(state.score.staves()[1].measures().length).toBe(4);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[0].id).toBe(selectionStart);
    expect(state.score.staves()[0].measures()[7].bars()[0].id).toBe(selectionEnd);
  });
  
  it('does nothing if a harmony bar in the middle of a line is selected', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[1].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('does nothing if the first harmony bar is selected', async () => {
    const state = emptyState();
    state.score.staves()[0].addHarmony();
    const selectionStart = state.score.staves()[0].measures()[0].bars()[1].id;
    const selectionEnd = state.score.staves()[0].measures()[0].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
  });
  it('moves a bar to previous line if harmony bar is selected and previous has harmony', async () => {
    const state = emptyState();
    state.score.staves()[0].addHarmony();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[0].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(5);
    expect(state.score.staves()[1].measures().length).toBe(3);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[1].id).toBe(selectionStart);
  });
  it('moves multiple bars to previous line if harmony bars are selected and previous has harmony', async () => {
    const state = emptyState();
    state.score.staves()[0].addHarmony();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(7);
    expect(state.score.staves()[1].measures().length).toBe(1);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[1].id).toBe(selectionStart);
    expect(state.score.staves()[0].measures()[6].bars()[1].id).toBe(selectionEnd);
  });
  it('adds harmony to the previous stave if harmony bar is moved to it', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[0].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(5);
    expect(state.score.staves()[1].measures().length).toBe(3);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[1].id).toBe(selectionStart);
  });
  it('adds harmony to the previous stave if multiple harmony bars are moved to it', async () => {
    const state = emptyState();
    state.score.staves()[1].addHarmony();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[1].id;
    const selectionEnd = state.score.staves()[1].measures()[2].bars()[1].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()[0].measures().length).toBe(7);
    expect(state.score.staves()[1].measures().length).toBe(1);
    expect(state.score.staves()[2].measures().length).toBe(4);
    expect(state.score.staves()[3].measures().length).toBe(4);
    expect(state.score.staves()[0].measures()[4].bars()[1].id).toBe(selectionStart);
    expect(state.score.staves()[0].measures()[6].bars()[1].id).toBe(selectionEnd);
  });
  it('deletes the stave if all of the harmony bars are moved to the previous line', async () => {
    const state = emptyState();
    const selectionStart = state.score.staves()[1].measures()[0].bars()[0].id;
    const selectionEnd = state.score.staves()[1].measures()[3].bars()[0].id;
    state.selection = ScoreSelection.from(selectionStart, selectionEnd, false);
    expect(
      state.score.staves().every((stave) => stave.measures().length === 4)
    ).toBe(true);
    expect(state.score.staves()).toHaveLength(4);
    await moveBarToPreviousLine()(state);
    expect(state.score.staves()).toHaveLength(3);
    expect(state.score.staves()[0].measures().length).toBe(8);
    expect(state.score.staves()[1].measures().length).toBe(4);
    expect(state.score.staves()[2].measures().length).toBe(4);
  });
});