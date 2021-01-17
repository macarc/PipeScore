/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
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

export function timeSignatureEqual(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}


interface TimeSignatureProps {
  x: number,
  y: number
}

function render(display: DisplayTimeSignature): Svg {
  return svg`<g class="time-signature">
    <text x=${display.x} y=${display.topY} font-size="25">${display.top}</text>
    <text x=${display.x} y=${display.bottomY} font-size="25">${display.bottom}</text>
  </g>`;
}

export interface DisplayTimeSignature {
  x: number,
  topY: number,
  bottomY: number,
  top: string,
  bottom: string
}

function prerender(timeSignature: TimeSignatureModel, props: TimeSignatureProps): DisplayTimeSignature {
  return ({
    x: props.x,
    topY: props.y + 15,
    bottomY: props.y + 30,
    top: timeSignature[0].toString(),
    bottom: timeSignature[1].toString()
  })
}

const init: () => TimeSignatureModel = () => [2,4];

export const timeSignatureWidth = 30;

export default {
  prerender,
  render,
  init
}
