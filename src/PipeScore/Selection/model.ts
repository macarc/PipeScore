/*
  ScoreSelection format
  Copyright (C) 2021 Archie Maclean
*/
import { ID } from '../global/id';
import { GracenoteModel } from '../Gracenote/model';
import { SecondTimingModel } from '../SecondTiming/model';
import { TextBoxModel } from '../TextBox/model';

export type SelectionModel = ScoreSelection | TextSelection;

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

export type SecondTimingSelection = {
  type: 'second timing selected';
  secondTiming: SecondTimingModel;
};
