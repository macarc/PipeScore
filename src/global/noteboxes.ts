import { svg, V } from '../render/h';
import { lineGap } from './constants';
import { Pitch, pitchToHeight } from './pitch';

// Invisible rectangles that are used to detect note dragging
export function noteBoxes(x: number,y: number,width: number, mouseOver: (pitch: Pitch) => void = () => null, mouseDown: (pitch: Pitch) => void = () => null): V {
  const height = lineGap / 2;

  const pitches = [Pitch.G,Pitch.A,Pitch.B,Pitch.C,Pitch.D,Pitch.E,Pitch.F,Pitch.HG,Pitch.HA];

  return svg('g', { class: 'drag-boxes' }, [
    svg('rect', { x, y: y - 4 * lineGap, width, height: lineGap * 4, opacity: 0 }, { mouseover: () => mouseOver(Pitch.HA), mousedown: () => mouseDown(Pitch.HA) }),
    svg('rect', { x, y: y + 3 * lineGap, width, height: lineGap * 4, opacity: 0 }, { mouseover: () => mouseOver(Pitch.G), mousedown: () => mouseDown(Pitch.G) }),
    ...pitches.map(n => [n,pitchToHeight(n)] as [Pitch, number]).map(([note, boxY]) =>
      svg('rect', { x, y: y + lineGap * boxY - lineGap / 2, width, height, opacity: 0 }, { mouseover: () => mouseOver(note), mousedown: () => mouseDown(note) }))
  ]);
}
