/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from '../all';

import { TimeSignatureModel } from './model';
import { dispatch } from './controller';



interface TimeSignatureProps {
  x: number,
  y: number
}

export default function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): Svg {
  const y = props.y + 15;
  return svg`<g class="time-signature">
    <text text-anchor="middle" x=${props.x} y=${y} font-size="25" onclick=${() => dispatch({ name: 'edit numerator', timeSignature })}>${timeSignature[0]}</text>
    <text text-anchor="middle" x=${props.x} y=${y + 15} font-size="25" onclick=${() => dispatch({ name: 'edit denominator', timeSignature })}>${timeSignature[1]}</text>
  </g>`;
}
