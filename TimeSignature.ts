import { svg } from 'uhtml';
import { Svg } from './all';
import { NoteLength } from './NoteLength';

// todo more denominators
type Denominator = 4 | 8;
export type TimeSignatureModel = [number, Denominator];

export function timeSignatureToNumberOfBeats(ts: TimeSignatureModel): number {
  switch (ts[1]) {
    case 4:
      return ts[0];
    case 8:
      return Math.ceil(ts[0] / 3);
  }
}

export function timeSignatureToBeatDivision(ts: TimeSignatureModel): number {
  switch (ts[1]) {
    case 4:
      return 1;
    case 8:
      return 3;
  }
}


interface TimeSignatureProps {
  x: number,
  y: number
}

function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): Svg {
  const y = props.y + 15;
  return svg`<g class="time-signature">
    <text x=${props.x} y=${y} font-size="25">${timeSignature[0]}</text>
    <text x=${props.x} y=${y + 15} font-size="25">${timeSignature[1]}</text>
  </g>`;
}


const init: () => TimeSignatureModel = () => [2,4];

export const timeSignatureWidth = 30;

export default {
  render,
  init
}
