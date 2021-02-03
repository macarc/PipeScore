/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { Svg } from '../all';
import { ScoreEvent } from '../Event';

import { TextBoxModel } from './model';

interface TextBoxProps {
  dispatch: (e: ScoreEvent) => void
}

export default function render(tx: TextBoxModel, props: TextBoxProps): Svg {
  return svg`
    <text x=${tx.x} y=${tx.y} ondblclick=${() => props.dispatch({ name: 'edit text', text: tx })} onmousedown=${() => props.dispatch({ name: 'text clicked', text: tx })} onmouseup=${() => props.dispatch({ name: 'text mouse up' })} >${tx.text}</text>
  `;
}
