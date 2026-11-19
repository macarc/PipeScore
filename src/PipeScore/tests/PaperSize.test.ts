import { expect, test } from 'bun:test';
import { Update } from '../Events/types';
import { Score } from '../Score/impl';
import { MovableTextBox } from '../TextBox/impl';
import { Settings, settings } from '../global/settings';

test('changing paper keeps text position and on-screen page width proportional', () => {
  const previous = settings.paperSize;
  try {
    settings.paperSize = 'A4';
    const score = Score.blank();
    const text = new MovableTextBox(
      'Label',
      false,
      score.width() / 4,
      score.height() / 2,
      12
    );
    score.addText(text);
    const displayWidth = score.width() * score.zoom;
    expect(score.setPaperSize('Letter')).toBe(Update.ShouldSave);
    expect(score.width()).toBeCloseTo(1397);
    expect(text.x() / score.width()).toBeCloseTo(0.25);
    expect(text.y() / score.height()).toBeCloseTo(0.5);
    expect(score.width() * score.zoom).toBeCloseTo(displayWidth);
    expect(score.setPaperSize('Letter')).toBe(Update.NoChange);
  } finally {
    settings.paperSize = previous;
  }
});

test('old and unrecognised paper sizes load with the original A4 dimensions', () => {
  const settings = new Settings();
  expect(settings.paperSize).toBe('A4');
  const { paperSize, ...legacy } = settings.toJSON();
  for (const saved of [legacy, { ...legacy, paperSize: 'unknown' }]) {
    settings.paperSize = 'Letter';
    settings.fromJSON(saved);
    expect(settings.toJSON().paperSize).toBe('A4');
    expect(settings.pageShortSideLength).toBe(1050);
    expect(settings.pageLongSideLength).toBe(1485);
  }
});

test('Letter round-trips with matching print and editor dimensions', () => {
  const original = new Settings();
  original.paperSize = 'Letter';
  const loaded = new Settings();
  loaded.fromJSON(original.toJSON());
  expect(loaded.paperSize).toBe('Letter');
  expect(loaded.pageShortSidePrintLength()).toBeCloseTo(215.9);
  expect(loaded.pageLongSidePrintLength()).toBeCloseTo(279.4);
  expect(loaded.pageShortSideLength).toBeCloseTo(1079.5);
  expect(loaded.pageLongSideLength).toBeCloseTo(1397);
});
