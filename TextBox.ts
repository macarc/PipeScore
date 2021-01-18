/*
  TextBox.ts - Text Box functionality for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { Svg } from './all';
import { svg } from 'uhtml';
import { dispatch } from './Controller';

/* MODEL */
export interface TextBoxModel {
  x: number,
  y: number,
  text: string
}
const init = () => ({
  x: 10,
  y: 100,
  text: "<Double Click to edit>"
});

/* FUNCTIONS */
export function setCoords(tx: TextBoxModel, x: number, y: number){
  tx.x = x - widthOf(tx) / 2;
  tx.y = y;
}

function widthOf(tx: TextBoxModel) {
  // todo improve this
  return tx.text.length * 5;
}

/* PRERENDER */
interface TextBoxProps { }

function prerender(tx: TextBoxModel, props: TextBoxProps): DisplayTextBox {
  return ({
    x: tx.x,
    y: tx.y,
    text: tx.text,
    editText: () => dispatch({ name: 'edit text', text: tx }),
    clickText: () => dispatch({ name: 'text clicked', text: tx }),
    mouseUpText: () => dispatch({ name: 'text mouse up' })
  })
}

/* RENDER */
export interface DisplayTextBox {
  x: number,
  y: number,
  text: string,
  editText: () => void,
  clickText: () => void,
  mouseUpText: () => void
}

function render(display: DisplayTextBox): Svg {
  return svg`
    <text x=${display.x} y=${display.y} ondblclick=${display.editText} onmousedown=${display.clickText} onmouseup=${display.mouseUpText} >${display.text}</text>
  `;
}


/* EXPORTS */
export default {
  prerender,
  render,
  init
}
