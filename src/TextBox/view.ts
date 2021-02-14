/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg, V } from '../render/h';

import { ScoreEvent } from '../Event';
import { selectedText } from '../global/state';
import { TextBoxModel } from './model';


interface TextBoxProps {
  dispatch: (e: ScoreEvent) => void
}

export default function render(tx: TextBoxModel, props: TextBoxProps): V {
  return svg('text',
             { x: tx.x, y: tx.y, 'text-anchor': 'middle', fill: (tx === selectedText) ? 'orange' : '' },
             { dblclick: () => props.dispatch({ name: 'edit text', text: tx }), mousedown: () => props.dispatch({ name: 'text clicked', text: tx }), mouseup: () => props.dispatch({ name: 'text mouse up' }) },
            [tx.text])
  /*
  return svg`
    <text x=${tx.x} y=${tx.y} text-anchor="middle" ondblclick=${() => props.dispatch({ name: 'edit text', text: tx })} onmousedown=${() => props.dispatch({ name: 'text clicked', text: tx })} onmouseup=${() => props.dispatch({ name: 'text mouse up' })} fill=${tx === selectedText ? 'orange' : null}>${tx.text}</text>
  `;
  */
}
