/*
  Draw text box
  Copyright (C) 2021 Archie Maclean
*/
import { svg, h, V } from '../../render/h';

import dialogueBox from '../global/dialogueBox';

import { Dispatch } from '../Controllers/Controller';
import { clickText, changeText, textMouseUp } from '../Controllers/Text';
import { TextBoxModel } from './model';
import { SelectionModel, TextSelection } from '../Selection/model';

interface TextBoxProps {
  dispatch: Dispatch;
  scoreWidth: number;
  selection: SelectionModel | null;
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
  ).then(({ size, text }) => dispatch(changeText(text, size, currentText)));
}

export default function render(tx: TextBoxModel, props: TextBoxProps): V {
  const selected =
    props.selection instanceof TextSelection && props.selection.text === tx;
  return svg(
    'text',
    {
      x: tx.x === 'centre' ? props.scoreWidth / 2 : tx.x,
      y: tx.y,
      style: `font-size: ${tx.size}px`,
      'text-anchor': 'middle',
      fill: selected ? 'orange' : '',
    },
    {
      dblclick: () => editText(props.dispatch, tx),
      mousedown: () => props.dispatch(clickText(tx)),
      mouseup: () => props.dispatch(textMouseUp()),
    },
    [tx.text || 'Double Click to Edit']
  );
}
