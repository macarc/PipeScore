import { TimeSignature, Denominator } from './index';
import dialogueBox from '../global/dialogueBox';
import m from 'mithril';

function textDialogue(ts: TimeSignature) {
  const denominatorOption = (i: Denominator) =>
    m(
      'option',
      { value: i, name: 'denominator', selected: ts.bottom() === i },
      i.toString()
    );

  return [
    m('input', {
      type: 'number',
      name: 'num',
      min: 1,
      value: ts.top(),
    }),
    m('br'),
    m('select', { name: 'denominator' }, [
      denominatorOption(2),
      denominatorOption(4),
      denominatorOption(8),
    ]),
    m('label', [
      'Cut time ',
      m('input', { type: 'checkbox', checked: ts.cutTime() }),
    ]),
    m('details', [
      m('summary', 'Advanced'),
      m('label', [
        'Custom grouping (the number of quavers in each group, separated by `,`)',
        m('input', {
          type: 'text',
          name: 'breaks',
          // Need to do \. for the pattern regex
          pattern: '^([1-9][0-9]*(,\\s*[1-9][0-9]*)*|())$',
          value: ts.breaksString(),
        }),
      ]),
    ]),
  ];
}

// Makes a dialogue box for the user to edit the text, then updates the text
export async function edit(ts: TimeSignature): Promise<TimeSignature> {
  let form = await dialogueBox(textDialogue(ts));
  let newTimeSignature: TimeSignature = ts;

  try {
    if (form) {
      const numInput = form.querySelector(
        'input[name = "num"]'
      ) as HTMLInputElement;
      const num = Math.max(parseInt(numInput.value), 1);

      const denomInput = form.querySelector('select') as HTMLSelectElement;
      const denom = TimeSignature.parseDenominator(denomInput.value);

      const cutTimeInput = form.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      const isCutTime = cutTimeInput.checked;

      const breaksInput = form.querySelector(
        'input[name="breaks"]'
      ) as HTMLInputElement;
      const breaks = breaksInput.value
        .split(/,\s*/)
        .filter((l) => l.length > 0)
        // map(parseInt) passes in the index as a radix :)
        // glad I knew that already and didn't have to debug...
        .map((i) => parseInt(i));

      if (denom)
        newTimeSignature = new TimeSignature(
          isCutTime ? 'cut time' : [num, denom],
          breaks
        );
    }
  } finally {
    return newTimeSignature;
  }
}
