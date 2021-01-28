/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from './all';
import { NoteLength } from './NoteLength';
import { dispatch } from './Controller';

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
      return 1.5;
  }
}

export function parseDenominator(text: string): Denominator | null {
  switch (text) {
    case '4': return 4;
    case '8': return 8;
    default: return null;
  }
}

export function timeSignatureEqual(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}


interface TimeSignatureProps {
  x: number,
  y: number
}

function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): Svg {
  const y = props.y + 15;
  return svg`<g class="time-signature">
    <text text-anchor="middle" x=${props.x} y=${y} font-size="25" onclick=${() => dispatch({ name: 'edit time signature numerator', timeSignature })}>${timeSignature[0]}</text>
    <text text-anchor="middle" x=${props.x} y=${y + 15} font-size="25" onclick=${() => dispatch({ name: 'edit time signature denominator', timeSignature })}>${timeSignature[1]}</text>
  </g>`;
}


const init: () => TimeSignatureModel = () => [2,4];

export const timeSignatureWidth = 30;

export default {
  render,
  init
}
