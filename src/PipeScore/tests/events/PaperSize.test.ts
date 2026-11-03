import { afterEach, describe, expect, it } from 'bun:test';
import { setPaperSize } from '../../Events/Misc';
import { Update } from '../../Events/types';
import { Score } from '../../Score/impl';
import { MovableTextBox } from '../../TextBox/impl';
import { Settings, settings } from '../../global/settings';
import { emptyState } from './common';

// settings is a global singleton, so reset it between tests
afterEach(() => {
  settings.paperSize = 'A4';
});

// Default settings, as saved before paper sizes were added
const { paperSize: _, ...savedSettings } = new Settings().toJSON();

describe('paper size settings', () => {
  it('defaults to A4', () => {
    expect(settings.paperSize).toBe('A4');
    expect(settings.pageShortSidePrintLength()).toBe(210);
    expect(settings.pageLongSidePrintLength()).toBe(297);
  });

  it('falls back to A4 when loading a score saved without a paper size', () => {
    settings.fromJSON({ ...savedSettings, paperSize: 'Letter' });
    settings.fromJSON(savedSettings);
    expect(settings.paperSize).toBe('A4');
  });

  it('falls back to A4 when loading an unknown paper size', () => {
    settings.fromJSON({ ...savedSettings, paperSize: 'B5' });
    expect(settings.paperSize).toBe('A4');
  });

  it('loads and saves Letter', () => {
    settings.fromJSON({ ...savedSettings, paperSize: 'Letter' });
    expect(settings.paperSize).toBe('Letter');
    expect(settings.toJSON().paperSize).toBe('Letter');
  });

  it('uses Letter dimensions when Letter is selected', () => {
    settings.paperSize = 'Letter';
    expect(settings.pageShortSidePrintLength()).toBe(215.9);
    expect(settings.pageLongSidePrintLength()).toBe(279.4);
    expect(settings.pageShortSideLength).toBeCloseTo(215.9 * 5);
    expect(settings.pageLongSideLength).toBeCloseTo(279.4 * 5);
  });
});

describe('setPaperSize', () => {
  it('changes the page dimensions of the score', async () => {
    const state = emptyState(Score.blank());
    state.score.makePortrait();
    expect(await setPaperSize('Letter')(state)).toBe(Update.ShouldSave);
    expect(state.score.width()).toBeCloseTo(215.9 * 5);
    expect(state.score.height()).toBeCloseTo(279.4 * 5);
    expect(state.score.printWidth()).toBe(215.9);
    expect(state.score.printHeight()).toBe(279.4);
  });

  it('does nothing when the paper size is already selected', async () => {
    const state = emptyState(Score.blank());
    expect(await setPaperSize('A4')(state)).toBe(Update.NoChange);
  });

  it('keeps text boxes in the same relative position on the page', async () => {
    const state = emptyState(Score.blank());
    const text = new MovableTextBox('hello', false, 0, 0);
    text.setX(state.score.width() / 2);
    text.setY(state.score.height() / 4);
    state.score.addText(text);

    await setPaperSize('Letter')(state);

    expect(text.x()).toBeCloseTo(state.score.width() / 2);
    expect(text.y()).toBeCloseTo(state.score.height() / 4);
  });
});
