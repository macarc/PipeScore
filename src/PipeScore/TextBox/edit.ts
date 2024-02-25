import m from 'mithril';
import { Font, ITextBox } from '.';
import { Update } from '../Events/types';
import dialogueBox from '../global/dialogueBox';

export async function editTextBox(tx: ITextBox) {
  const form = await dialogueBox('Edit Text Box', [
    m('section', [
      m('label', ['Text:', m('input', { type: 'text', value: tx.text() })]),
      m('label', [
        'Font size:',
        m('input', {
          type: 'number',
          min: 5,
          max: 50,
          value: tx.fontSize(),
        }),
      ]),
      m('label', [
        'Font:',
        m('select', [
          m(
            'option',
            {
              value: 'serif',
              style: 'font-family: serif;',
              selected: tx.font() === 'serif',
            },
            'Serif'
          ),
          m(
            'option',
            {
              value: 'sans-serif',
              style: 'font-family: sans-serif;',
              selected: tx.font() === 'sans-serif',
            },
            'Sans Serif'
          ),
        ]),
      ]),
    ]),
  ]);
  if (form) {
    const size = parseInt(
      (form.querySelector('input[type="number"]') as HTMLInputElement).value
    );
    const text = (form.querySelector('input[type="text"]') as HTMLInputElement)
      .value;

    const font = (form.querySelector('select') as HTMLSelectElement).value as Font;
    return tx.set(text, size, font);
  }
  return Update.NoChange;
}
