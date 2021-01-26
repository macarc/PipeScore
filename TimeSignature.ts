/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from './all';
import { NoteLength } from './NoteLength';

/* MODEL */
type Denominator = 4 | 8;
export type TimeSignatureModel = [number, Denominator];

const init: () => TimeSignatureModel = () => [2,4];

/* CONSTANTS */
export const timeSignatureWidth = 30;

/* FUNCTIONS */
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

export function timeSignatureEqual(ts0: TimeSignatureModel, ts1: TimeSignatureModel): boolean {
  return ts0[0] === ts1[0] && ts0[1] === ts1[1];
}


/* PRERENDER */
interface TimeSignatureProps {
  x: number,
  y: number
}

function prerender(timeSignature: TimeSignatureModel, props: TimeSignatureProps): DisplayTimeSignature {
  return ({
    x: props.x,
    topY: props.y + 15,
    bottomY: props.y + 30,
    top: timeSignature[0].toString(),
    bottom: timeSignature[1].toString()
  })
<<<<<<< HEAD
}

/* RENDER */
export interface DisplayTimeSignature {
  x: number,
  topY: number,
  bottomY: number,
  top: string,
  bottom: string
}

function render(display: DisplayTimeSignature): Svg {
  return svg`<g class="time-signature">
    <text x=${display.x} y=${display.topY} font-size="25">${display.top}</text>
    <text x=${display.x} y=${display.bottomY} font-size="25">${display.bottom}</text>
  </g>`;
}

<<<<<<< HEAD
=======
}

/* RENDER */
export interface DisplayTimeSignature {
  x: number,
  topY: number,
  bottomY: number,
  top: string,
  bottom: string
}

<<<<<<< HEAD
function render(display: DisplayTimeSignature): Svg {
  return svg`<g class="time-signature">
    <text x=${display.x} y=${display.topY} font-size="25">${display.top}</text>
    <text x=${display.x} y=${display.bottomY} font-size="25">${display.bottom}</text>
  </g>`;
}
=======
>>>>>>> adb75441999bc90fe4e1dce8c57573f92e4827fc
const init: () => TimeSignatureModel = () => [6,8];
>>>>>>> before-refactor

<<<<<<< HEAD
export const timeSignatureWidth = 30;
=======
>>>>>>> 630626b (Continue refactor)
=======
>>>>>>> adb75441999bc90fe4e1dce8c57573f92e4827fc

/* EXPORTS */
export default {
  prerender,
  render,
  init
}
