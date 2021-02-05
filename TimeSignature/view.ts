/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from '../all';
import { Dispatch } from '../Event';

import { TimeSignatureModel } from './model';

interface TimeSignatureProps {
  x: number,
  y: number,
  dispatch: Dispatch
}

export default function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): Svg {
  const y = props.y + 15;
  return svg`<g class="time-signature">
    <text text-anchor="middle" x=${props.x} y=${y} font-size="25" onclick=${() => props.dispatch({ name: 'edit time signature numerator', timeSignature })}>${timeSignature[0]}</text>
    <text text-anchor="middle" x=${props.x} y=${y + 15} font-size="25" onclick=${() => props.dispatch({ name: 'edit time signature denominator', timeSignature })}>${timeSignature[1]}</text>
  </g>`;
}
