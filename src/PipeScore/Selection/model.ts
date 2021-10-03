/*
  ScoreSelection format
  Copyright (C) 2021 Archie Maclean
*/
import { ID } from '../global/id';
import { SecondTimingModel } from '../SecondTiming/model';
import { TextBoxModel } from '../TextBox/model';

export type SelectionModel =
  | ScoreSelection
  | TextSelection
  | SecondTimingSelection;

// Using the equivalent of 'case classes'
// This allows using instanceof to check selection type

export class ScoreSelection {
  public start: ID;
  public end: ID;
  constructor(start: ID, end: ID) {
    this.start = start;
    this.end = end;
  }
}

export class TextSelection {
  public text: TextBoxModel;
  constructor(text: TextBoxModel) {
    this.text = text;
  }
}

export class SecondTimingSelection {
  secondTiming: SecondTimingModel;
  constructor(secondTiming: SecondTimingModel) {
    this.secondTiming = secondTiming;
  }
}
