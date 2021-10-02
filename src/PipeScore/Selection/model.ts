/*
  ScoreSelection format
  Copyright (C) 2021 Archie Maclean
*/
import { ID } from '../global/id';
import { GracenoteModel } from '../Gracenote/model';
import { SecondTimingModel } from '../SecondTiming/model';
import { TextBoxModel } from '../TextBox/model';

export type SelectionModel = ScoreSelection | TextSelection;

export type ScoreSelection = {
  type: 'score selected';
  start: ID;
  end: ID;
};

export type TextSelection = {
  type: 'text selected';
  text: TextBoxModel;
};

export type SecondTimingSelection = {
  type: 'second timing selected';
  secondTiming: SecondTimingModel;
};
