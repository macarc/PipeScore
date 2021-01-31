/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from '../all';

import { TextBoxModel } from './model';
import { dispatch } from './controller';

export default function render(tx: TextBoxModel): Svg {
  return svg`
    <text x=${tx.x} y=${tx.y} ondblclick=${() => dispatch({ name: 'edit text', text: tx })} onmousedown=${() => dispatch({ name: 'text clicked', text: tx })} onmouseup=${() => dispatch({ name: 'text mouse up' })} >${tx.text}</text>
  `;
}
