/*
   Copyright (C) 2021 Archie Maclean
 */
import { StaveModel } from '../Stave/model';
import { TextBoxModel } from '../TextBox/model';
import { SecondTimingModel } from '../SecondTiming/model';

export interface ScoreModel {
  name: string,
  staves: StaveModel[],
  // an array rather than a set since it makes rendering easier (with map)
  textBoxes: TextBoxModel[],
  secondTimings: SecondTimingModel[]
}
