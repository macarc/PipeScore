/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg, V } from '../render/h';

import dialogueBox from '../global/dialogueBox';
import { Dispatch } from '../Event';

import { TimeSignatureModel } from './model';
import TimeSignature from './functions';

interface TimeSignatureProps {
  x: number,
  y: number,
  dispatch: Dispatch
}

function edit(timeSignature: TimeSignatureModel, dispatch: Dispatch) {
  // Makes a dialogue box for the user to edit the text, then updates the text

  dialogueBox(`<input type="number" name="numerator" value="${timeSignature[0]}" /><br /><input type="number" name="denominator" value="${timeSignature[1]}" />`, form => {
    const numElement = form.querySelector('input[name = "numerator"]');
    const denomElement = form.querySelector('input[name = "denominator"]');
    if (numElement && denomElement && numElement instanceof HTMLInputElement && denomElement instanceof HTMLInputElement) {
      const num = parseInt(numElement.value);
      const denom = TimeSignature.parseDenominator(denomElement.value);
      if (num && denom) return TimeSignature.from([num,denom]);
    } else {
      return null;
    }
  }, timeSignature)
  .then(newTimeSignature => newTimeSignature && dispatch({ name: 'edit time signature', timeSignature, newTimeSignature }));
}

export default function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): V {
  const y = props.y + 15;
  return svg('g', { class: 'time-signature' }, [
    svg('text',
        { 'text-anchor': 'middle', x: props.x, y, 'font-size': 25 },
        { click: () => edit(timeSignature, props.dispatch) },
        [timeSignature[0].toString()]),
    svg('text',
        { 'text-anchor': 'middle', x: props.x, y: y + 15, 'font-size': 25 },
        { click: () => edit(timeSignature, props.dispatch) },
        [timeSignature[1].toString()]),
  ]);
}
