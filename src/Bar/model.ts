/*
  Bar/model.ts - Defines the Bar model
  Copyright (C) 2020 Archie Maclean
*/
import { TimeSignatureModel } from '../TimeSignature/model';
import { GroupNoteModel } from '../Note/model';
import { ID } from '../all';

export enum Barline {
  RepeatFirst, RepeatLast, Normal
}

export type FrontBarline = Barline.RepeatFirst | Barline.Normal;
export type BackBarline = Barline.RepeatLast | Barline.Normal;

export interface BarModel {
  timeSignature: TimeSignatureModel,
  notes: GroupNoteModel[],
  frontBarline: FrontBarline,
  backBarline: BackBarline,
  isAnacrusis: boolean,
  id: ID
}
