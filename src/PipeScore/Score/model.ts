/*
  Score format
  Copyright (C) 2021 Archie Maclean
*/
import { Stave } from '../Stave/model';
import { TextBoxModel } from '../TextBox/model';
import { SecondTimingModel } from '../SecondTiming/model';

export interface ScoreModel {
  name: string;
  width: number;
  height: number;
  staves: Stave[];
  // an array rather than a set since it makes rendering easier (with map)
  textBoxes: TextBoxModel[];
  secondTimings: SecondTimingModel[];
}
