/*
  Invisible rectangles that are used to detect note dragging, clicking, e.t.c. on different pitches
  Copyright (C) 2021 macarc
*/
import { svg, V } from '../../render/h';
import { settings } from './settings';
import { Pitch, pitchToHeight } from './pitch';

export function noteBoxes(
  x: number,
  y: number,
  width: number,
  mouseOver: (pitch: Pitch, event: MouseEvent) => void = () => null,
  mouseDown: (pitch: Pitch, event: MouseEvent) => void = () => null
): V {
  // Need to add 0.1 for Firefox since if it is exact then the boxes don't overlap
  // and there are 0 pixel gaps between that can nevertheless be hovered over
  const height = settings.lineGap / 2 + 0.1;

  const pitches = [
    Pitch.G,
    Pitch.A,
    Pitch.B,
    Pitch.C,
    Pitch.D,
    Pitch.E,
    Pitch.F,
    Pitch.HG,
    Pitch.HA,
  ];

  const gap = settings.lineHeightOf(4);

  const heightOfBetweenBoxes =
    (settings.staveGap - settings.lineHeightOf(4) - gap) / 2;

  return svg('g', { class: 'drag-boxes' }, [
    svg(
      'rect',
      {
        x,
        y: y - settings.lineGap - heightOfBetweenBoxes,
        width,
        height: heightOfBetweenBoxes,
        opacity: 0,
      },
      {
        mouseover: (e) => mouseOver(Pitch.HA, e as MouseEvent),
        mousedown: (e) => mouseDown(Pitch.HA, e as MouseEvent),
      }
    ),
    svg(
      'rect',
      {
        x,
        y: y + settings.lineHeightOf(3),
        width,
        height: heightOfBetweenBoxes,
        opacity: 0,
      },
      {
        mouseover: (e) => mouseOver(Pitch.G, e as MouseEvent),
        mousedown: (e) => mouseDown(Pitch.G, e as MouseEvent),
      }
    ),
    ...pitches
      .map((n) => [n, pitchToHeight(n)] as [Pitch, number])
      .map(([note, boxY]) =>
        svg(
          'rect',
          {
            x,
            y: y + settings.lineGap * boxY - settings.lineGap / 2,
            width,
            height,
            opacity: 0,
          },
          {
            mouseover: (e) => mouseOver(note, e as MouseEvent),
            mousedown: (e) => mouseDown(note, e as MouseEvent),
          }
        )
      ),
  ]);
}
