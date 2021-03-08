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

  const top = timeSignature === 'cut time' ? 2 : timeSignature[0];
  const bottom = timeSignature === 'cut time' ? 4 : timeSignature[1];
  const isCutTime = timeSignature === 'cut time';

  dialogueBox(`<input type="number" name="numerator" value="${top}" /><br /><input type="number" name="denominator" value="${bottom}" /><label>Cut time <input type="checkbox" ${isCutTime ? 'checked' : ''}/></label>`, form => {
    const numElement = form.querySelector('input[name = "numerator"]');
    const denomElement = form.querySelector('input[name = "denominator"]');
    const isCutTime = form.querySelector('input[type="checkbox"]');
    if (isCutTime && isCutTime instanceof HTMLInputElement && isCutTime.checked) {
      return 'cut time';
    } else if (numElement && denomElement && numElement instanceof HTMLInputElement && denomElement instanceof HTMLInputElement) {
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

  if (timeSignature === 'cut time') {
    return svg('g', { class: 'time-signature' }, [
      svg('text', { 'text-anchor': 'middle', x: props.x, y: props.y + 23, 'font-size': 30 }, { click: () => edit(timeSignature, props.dispatch) }, ['C'])
    ]);
  } else {
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
}
