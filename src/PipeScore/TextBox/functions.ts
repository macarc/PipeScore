/*
  TextBox methods
  Copyright (C) 2021 Archie Maclean
*/
import { TextBoxModel } from './model';

function toggleCentre(tx: TextBoxModel) {
  // Toggle centring the textbox on the page

  tx.centred = !tx.centred;
}

function setCoords(tx: TextBoxModel, x: number, y: number) {
  // Set the coordinates of the textbox

  tx.x = x;
  tx.y = y;
}

const init = (text = '', predictable = false): TextBoxModel => ({
  centred: predictable,
  x: Math.random() * 100,
  y: predictable ? 100 : Math.random() * 150,
  size: 20,
  text,
});

export default {
  init,
  setCoords,
  toggleCentre,
};
