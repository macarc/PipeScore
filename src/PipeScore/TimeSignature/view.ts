/*
  TimeSignature.ts - Time Signature implementation for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { svg, h, V } from '../../render/h';

import { Dispatch } from '../Event';

import { TimeSignatureModel, Denominator } from './model';
import TimeSignature from './functions';

import dialogueBox from '../global/dialogueBox';

interface TimeSignatureProps {
  x: number,
  y: number,
  dispatch: Dispatch
}

export function editTimeSignature(timeSignature: TimeSignatureModel): Promise<TimeSignatureModel> {
  // Makes a dialogue box for the user to edit the text, then updates the text

  const isCutTime = timeSignature.ts === 'cut time';
  const oldTop = isCutTime ? 2 : TimeSignature.top(timeSignature);
  const oldBottom = isCutTime ? 4 : TimeSignature.bottom(timeSignature);

  // TODO selected and checked (further down) won't work

  const denominatorOption = (i: Denominator) => h('option', { value: i, name: 'denominator', selected: oldBottom === i }, [i.toString()]);

  return new Promise((res, _) =>
     dialogueBox([
       h('input', { type: 'number', name: 'numerator', min: 1, value: oldTop }),
       h('br'),
       h('select', { name: 'denominator' }, [
         denominatorOption(2),
         denominatorOption(4),
         denominatorOption(8),
       ]),
       h('label', [
         'Cut time ',
         h('input', { type: 'checkbox', checked: isCutTime }),
       ]),
       h('details', [
         h('summary', ['Advanced']),
         h('label', [
           'Custom grouping (the number of quavers in each group, separated by `,`)',
           h('input', {
             type: 'text',
             name: 'breaks',
             // Need to do \. for the pattern regex
             pattern: '^([1-9][0-9]*(,\\s*[1-9][0-9]*)*|())$',
             value: timeSignature.breaks.toString()
           })
         ])
       ])
     ],
     form => {
    const numElement = form.querySelector('input[name = "numerator"]');
    const denomElement = form.querySelector('select');
    const isCutTime = form.querySelector('input[type="checkbox"]');
    const breaksElement = form.querySelector('input[name="breaks"]');
    const breaks = (breaksElement && breaksElement instanceof HTMLInputElement) ?
      // map(parseInt) passes in the index as a radix :)
      // glad I new that already and didn't have to debug...
      breaksElement.value.split(/,\s*/).filter(l => l.length > 0).map(i => parseInt(i))
    : timeSignature.breaks;
    if (isCutTime && isCutTime instanceof HTMLInputElement && isCutTime.checked) {
      return { ...TimeSignature.from('cut time'), breaks };
    } else if (numElement && denomElement && numElement instanceof HTMLInputElement && denomElement instanceof HTMLSelectElement) {
      const num = parseInt(numElement.value);
      const denom = TimeSignature.parseDenominator(denomElement.value);
      if (num && denom) return { ...TimeSignature.from([num,denom]), breaks };
    } else {
      return null;
    }
  }, timeSignature)
  .then(newTimeSignature => res(newTimeSignature || timeSignature)));
}


export default function render(timeSignature: TimeSignatureModel, props: TimeSignatureProps): V {
  const y = props.y + 14;

  const edit = () => editTimeSignature(timeSignature).then(newTimeSignature => props.dispatch({ name: 'edit time signature', timeSignature, newTimeSignature }));

  if (timeSignature.ts === 'cut time') {
    return svg('g', { class: 'time-signature' }, [
      svg('text', { style: 'font-family: serif; font-weight: bold;', 'text-anchor': 'middle', x: props.x, y: props.y + 23, 'font-size': 30 }, { click: edit }, ['C'])
    ]);
  } else {
    return svg('g', { class: 'time-signature' }, [
      svg('text',
          { 'text-anchor': 'middle', x: props.x, y, style: 'font-family: serif; font-weight: bold;', 'font-size': 22 },
          { click: edit },
          [TimeSignature.top(timeSignature).toString()]),
      svg('text',
          { 'text-anchor': 'middle', x: props.x, y: y + 13, style: 'font-family: serif; font-weight: bold;', 'font-size': 22 },
          { click: edit },
          [TimeSignature.bottom(timeSignature).toString()]),
    ]);
  }
}
