/*
   Copyright (C) 2020 Archie Maclean
 */
import { svg, V } from '../../render/h';
import { lineGap } from './constants';
import { Pitch, pitchToHeight } from './pitch';

export function noteBoxes(x: number,y: number,width: number, mouseOver: (pitch: Pitch, event: MouseEvent) => void = () => null, mouseDown: (pitch: Pitch, event: MouseEvent) => void = () => null): V {
  // Invisible rectangles that are used to detect note dragging, clicking, e.t.c. on different pitches

  const height = lineGap / 2;

  const pitches = [Pitch.G,Pitch.A,Pitch.B,Pitch.C,Pitch.D,Pitch.E,Pitch.F,Pitch.HG,Pitch.HA];

  return svg('g', { class: 'drag-boxes' }, [
    svg('rect', { x, y: y - 4 * lineGap, width, height: lineGap * 4, opacity: 0 }, { mouseover: (e) => mouseOver(Pitch.HA, e as MouseEvent), mousedown: (e) => mouseDown(Pitch.HA, e as MouseEvent) }),
    svg('rect', { x, y: y + 3 * lineGap, width, height: lineGap * 4, opacity: 0 }, { mouseover: (e) => mouseOver(Pitch.G, e as MouseEvent), mousedown: (e) => mouseDown(Pitch.G, e as MouseEvent) }),
    ...pitches.map(n => [n,pitchToHeight(n)] as [Pitch, number]).map(([note, boxY]) =>
      svg('rect', { x, y: y + lineGap * boxY - lineGap / 2, width, height, opacity: 0 }, { mouseover: (e) => mouseOver(note, e as MouseEvent), mousedown: (e) => mouseDown(note, e as MouseEvent) }))
  ]);
}
