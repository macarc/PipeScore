import { expect, test } from 'bun:test';
import { Update } from '../Events/types';
import { minWidth } from '../Measure/view';
import { Score } from '../Score/impl';
import { trebleClefWidth } from '../Stave';
import { computeBarWidths } from '../Stave/view';
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

test('reopening a portrait Letter score fits its saved page to the window', () => {
  const previous = settings.toJSON();
  try {
    settings.paperSize = 'Letter';
    const score = Score.blank();
    score.makePortrait();
    const saved = score.toJSON();
    settings.paperSize = 'A4';
    const loaded = Score.fromJSON(saved);
    expect((loaded.width() * loaded.zoom) / 100).toBeCloseTo(
      0.9 * Math.max(window.innerWidth, 800)
    );
  } finally {
    settings.fromJSON(previous);
  }
});

test('fixed bars leave room for the last automatic bar on Letter paper', () => {
  const previous = settings.toJSON();
  try {
    settings.paperSize = 'A4';
    settings.margin = 80;
    const score = Score.blank();
    const stave = score.staves()[0];
    const bars = stave.measures();
    const last = bars.length - 1;
    const minimum = minWidth(bars[last], bars[last - 1]);
    const staveWidth = () => score.width() - 2 * settings.margin;
    for (const bar of bars.slice(0, last)) {
      bar.fixedWidth = (staveWidth() - trebleClefWidth - minimum - 8) / last;
    }
    const lastWidth = () =>
      computeBarWidths(stave, staveWidth(), (i) => bars[i - 1] ?? null)[last];
    expect(lastWidth()).toBeCloseTo(minimum + 8);
    score.setPaperSize('Letter');
    expect(lastWidth()).toBeGreaterThanOrEqual(minimum);
    score.setPaperSize('A4');
    expect(lastWidth()).toBeCloseTo(minimum + 8);
  } finally {
    settings.fromJSON(previous);
  }
});

test('old and unrecognised paper sizes load with the original A4 dimensions', () => {
  const settings = new Settings();
  const { paperSize, ...legacy } = settings.toJSON();
  expect(paperSize).toBe('A4');
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
