/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg, V } from '../render/h';

import { ScoreEvent } from '../Event';
import { TextBoxModel } from './model';


export interface TextBoxState {
  selectedText: TextBoxModel | null
}

interface TextBoxProps {
  dispatch: (e: ScoreEvent) => void,
  state: TextBoxState
}

export default function render(tx: TextBoxModel, props: TextBoxProps): V {
  return svg('text',
             { x: tx.x, y: tx.y, 'text-anchor': 'middle', fill: (tx === props.state.selectedText) ? 'orange' : '' },
             { dblclick: () => props.dispatch({ name: 'edit text', text: tx }), mousedown: () => props.dispatch({ name: 'text clicked', text: tx }), mouseup: () => props.dispatch({ name: 'text mouse up' }) },
            [tx.text])
}
