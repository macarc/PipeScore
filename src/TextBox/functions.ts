import { scoreWidth } from '../global/constants';

import { TextBoxModel } from './model';

function centre(tx: TextBoxModel, pageWidth: number): TextBoxModel {
  return { ...tx, x: pageWidth / 2 };
}

function setCoords(tx: TextBoxModel, x: number, y: number): TextBoxModel {
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
