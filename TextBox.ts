/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { Svg } from './all';
import { svg } from 'uhtml';
import { dispatch } from './Controller';

export interface TextBoxModel {
  x: number,
  y: number,
  text: string
}


interface TextBoxProps {
}

function widthOf(tx: TextBoxModel) {
  // todo improve this
  return tx.text.length * 5;
}

export function setCoords(tx: TextBoxModel, x: number, y: number){
  tx.x = x - widthOf(tx) / 2;
  tx.y = y;
}

function render(tx: TextBoxModel, props: TextBoxProps): Svg {
  return svg`
    <text x=${tx.x} y=${tx.y} ondblclick=${() => dispatch({ name: 'edit text', text: tx })} onmousedown=${() => dispatch({ name: 'text clicked', text: tx })} onmouseup=${() => dispatch({ name: 'text mouse up' })} >${tx.text}</text>
  `;
}

const init = () => ({
  x: 10,
  y: 100,
  text: "<Double Click to edit>"
});


export default {
  render,
  init
}
