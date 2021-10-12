/*
  Document settings singleton
  Copyright (C) 2021 Archie Maclean
*/
export class Settings {
  staveGap = 100;
  lineGap = 7;
  margin = 80;
  topOffset = 200;

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
