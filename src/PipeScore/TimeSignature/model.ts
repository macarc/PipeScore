/*
  TimeSignature format
  Copyright (C) 2021 Archie Maclean
*/
export type Denominator = 2 | 4 | 8;

export type TimeSignatureModel = {
  ts: [number, Denominator] | 'cut time';
  breaks: number[];
};
