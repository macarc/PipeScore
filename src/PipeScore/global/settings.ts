import { Obj } from './utils';

/*
  Document settings singleton
  Copyright (C) 2021 macarc
*/
export class Settings {
  staveGap = 100;
  lineGap = 7;
  margin = 80;
  topOffset = 200;

  fromJSON(o: Obj) {
    this.staveGap = o.staveGap;
    this.lineGap = o.lineGap;
    this.margin = o.margin;
    this.topOffset = o.topOffset;
  }
  toJSON() {
    return {
      staveGap: this.staveGap,
      lineGap: this.lineGap,
      margin: this.margin,
      topOffset: this.topOffset,
    };
  }
  validate<T extends keyof Settings>(key: T, value: number) {
    switch (key) {
      case 'staveGap':
        return Math.max(value, this.lineHeightOf(5));
      case 'lineGap':
        return Math.max(value, 1);
      case 'margin':
        return Math.max(Math.min(value, 300), 0);
      case 'topOffset':
        return Math.max(Math.min(value, 500), 0);
      default:
        return false;
    }
  }
  lineHeightOf(n: number) {
    return n * this.lineGap;
  }
}

export const settings = new Settings();
