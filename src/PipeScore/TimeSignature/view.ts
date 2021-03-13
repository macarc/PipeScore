/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';

import { Dispatch } from '../Event';

import { TimeSignatureModel } from './model';
import TimeSignature from './functions';

interface TimeSignatureProps {
  x: number,
  y: number,
  dispatch: Dispatch
}

export default function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): V {
  const y = props.y + 15;

  const edit = () => TimeSignature.edit(timeSignature).then(newTimeSignature => props.dispatch({ name: 'edit time signature', timeSignature, newTimeSignature }));

  if (timeSignature === 'cut time') {
    return svg('g', { class: 'time-signature' }, [
      svg('text', { style: 'font-family: serif; font-weight: bold;', 'text-anchor': 'middle', x: props.x, y: props.y + 23, 'font-size': 30 }, { click: edit }, ['C'])
    ]);
  } else {
    return svg('g', { class: 'time-signature' }, [
      svg('text',
          { 'text-anchor': 'middle', x: props.x, y, style: 'font-family: serif; font-weight: bold;', 'font-size': 23 },
          { click: edit },
          [timeSignature[0].toString()]),
      svg('text',
          { 'text-anchor': 'middle', x: props.x, y: y + 13, style: 'font-family: serif; font-weight: bold;', 'font-size': 23 },
          { click: edit },
          [timeSignature[1].toString()]),
    ]);
  }
}
