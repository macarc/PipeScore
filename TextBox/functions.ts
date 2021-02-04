import { TextBoxModel } from './model';
import { scoreWidth } from '../all';

export function centre(tx: TextBoxModel, pageWidth: number): void {
  tx.x = pageWidth / 2;
}

export function setCoords(tx: TextBoxModel, x: number, y: number): void {
  tx.x = x;
  tx.y = y;
}

export const init = (): TextBoxModel => ({
  x: scoreWidth / 2,
  y: 100,
  text: "<Double Click to edit>"
});

export default {
  init,
  setCoords,
  centre
}
