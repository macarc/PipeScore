import { expect, test } from 'bun:test';
import { Settings } from '../global/settings';

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
