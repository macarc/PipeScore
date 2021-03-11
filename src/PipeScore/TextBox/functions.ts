/*
   Copyright (C) 2021 Archie Maclean
 */
import { TextBoxModel } from './model';

function centre(tx: TextBoxModel, pageWidth: number): TextBoxModel {
  // Centre the textbox on the page

  return { ...tx, x: 'centre' };
}

function setCoords(tx: TextBoxModel, x: number, y: number): TextBoxModel {
  // Set the coordinates of the textbox

  return { ...tx, x, y };
}

const init = (text = '<Double Click to Edit>', predictable = false): TextBoxModel => ({
  x: predictable ? 'centre' : Math.random() * 100,
  y: predictable ? 100 : Math.random() * 150,
  size: 20,
  text
});

export default {
  init,
  setCoords,
  centre
}
