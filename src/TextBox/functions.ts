/*
   Copyright (C) 2020 Archie Maclean
 */
import { scoreWidth } from '../global/constants';

import { TextBoxModel } from './model';

function centre(tx: TextBoxModel, pageWidth: number): TextBoxModel {
  // Centre the textbox on the page

  return { ...tx, x: pageWidth / 2 };
}

function setCoords(tx: TextBoxModel, x: number, y: number): TextBoxModel {
  // Set the coordinates of the textbox

  return { ...tx, x, y };
}

const init = (): TextBoxModel => ({
  x: scoreWidth / 2,
  y: 100,
  text: "<Double Click to edit>"
});

export default {
  init,
  setCoords,
  centre
}
