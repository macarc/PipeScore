import { TextBoxModel } from './model';

function widthOf(tx: TextBoxModel) {
  // todo improve this
  return tx.text.length * 5;
}

export function setCoords(tx: TextBoxModel, x: number, y: number): void {
  tx.x = x - widthOf(tx) / 2;
  tx.y = y;
}

export const init = (): TextBoxModel => ({
  x: 10,
  y: 100,
  text: "<Double Click to edit>"
});

export default {
  init,
  setCoords
}
