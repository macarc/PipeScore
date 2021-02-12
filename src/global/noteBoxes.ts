import { svg } from 'uhtml';
import { lineGap } from './constants';
import { Pitch, pitchToHeight } from './pitch';
import { Svg } from './svg';

// Invisible rectangles that are used to detect note dragging
export function noteBoxes(x: number,y: number,width: number, mouseOver: (pitch: Pitch) => void = () => null, mouseDown: (pitch: Pitch) => void = () => null): Svg {
  const height = lineGap / 2;

  const pitches = [Pitch.G,Pitch.A,Pitch.B,Pitch.C,Pitch.D,Pitch.E,Pitch.F,Pitch.HG,Pitch.HA];

  return svg`<g class="drag-boxes">
    <rect x=${x} y=${y - 4 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseOver(Pitch.HA)} onmousedown=${() => mouseDown(Pitch.HA)} opacity="0" />
    <rect x=${x} y=${y + 3 * lineGap} width=${width} height=${lineGap * 4} onmouseover=${() => mouseOver(Pitch.G)} onmousedown=${() => mouseDown(Pitch.G)} opacity="0" />

    ${pitches.map(n => [n,pitchToHeight(n)] as [Pitch,number]).map(([note,boxY]) =>
      svg`<rect
        x=${x}
        y=${y + lineGap * boxY - lineGap / 2}
        width=${width}
        height=${height}
        onmouseover=${() => mouseOver(note)}
        onmousedown=${() => mouseDown(note)}
        opacity="0"
        />`)}
  </g>`
}
