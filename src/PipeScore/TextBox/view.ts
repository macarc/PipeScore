/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { svg, h, V } from '../../render/h';

import dialogueBox from '../global/dialogueBox';

import { Dispatch } from '../Event';
import { TextBoxModel } from './model';

export interface TextBoxState {
  selectedText: TextBoxModel | null;
}

interface TextBoxProps {
  dispatch: Dispatch;
  scoreWidth: number;
  state: TextBoxState;
}

function editText(dispatch: Dispatch, currentText: TextBoxModel) {
  dialogueBox(
    [
      h('label', [
        'Text:',
        h('input', { type: 'text', value: currentText.text }),
      ]),
      h('label', [
        'Font size:',
        h('input', {
          type: 'number',
          min: 5,
          max: 50,
          value: currentText.size,
        }),
      ]),
    ],
    (form) => ({
      size: parseInt(
        (form.querySelector('input[type="number"]') as HTMLInputElement).value
      ),
      text: (form.querySelector('input[type="text"]') as HTMLInputElement)
        .value,
    }),
    { size: currentText.size, text: currentText.text }
  ).then(({ size, text }) =>
    dispatch({
      name: 'edit text',
      newText: text,
      newSize: size,
      text: currentText,
    })
  );
}

export default function render(tx: TextBoxModel, props: TextBoxProps): V {
  return svg(
    'text',
    {
      x: tx.x === 'centre' ? props.scoreWidth / 2 : tx.x,
      y: tx.y,
      style: `font-size: ${tx.size}px`,
      'text-anchor': 'middle',
      fill: tx === props.state.selectedText ? 'orange' : '',
    },
    {
      dblclick: () => editText(props.dispatch, tx),
      mousedown: () => props.dispatch({ name: 'click text', text: tx }),
      mouseup: () => props.dispatch({ name: 'text mouse up' }),
    },
    [tx.text || 'Double Click to Edit']
  );
}
