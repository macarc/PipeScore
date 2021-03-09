/*
   Copyright (C) 2021 Archie Maclean
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

const init = (text = '<Double Click to Edit>', predictable = false): TextBoxModel => ({
  x: predictable ? scoreWidth / 2 : Math.random() * scoreWidth,
  y: predictable ? 100 : Math.random() * 150,
  size: 20,
  text
});

export default {
  init,
  setCoords,
  centre
}
