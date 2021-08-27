/*
  TextBox methods
  Copyright (C) 2021 Archie Maclean
*/
import { TextBoxModel } from './model';

function toggleCentre(tx: TextBoxModel, pageWidth: number): TextBoxModel {
  // Toggle centring the textbox on the page

  return { ...tx, x: tx.x === 'centre' ? pageWidth / 2 : 'centre' };
}

function setCoords(tx: TextBoxModel, x: number, y: number): TextBoxModel {
  // Set the coordinates of the textbox

  return { ...tx, x, y };
}

const init = (text = '', predictable = false): TextBoxModel => ({
  x: predictable ? 'centre' : Math.random() * 100,
  y: predictable ? 100 : Math.random() * 150,
  size: 20,
  text,
});

export default {
  init,
  setCoords,
  toggleCentre,
};
