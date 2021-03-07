/*
   Copyright (C) 2020 Archie Maclean
 */
import { TimeSignatureModel } from '../TimeSignature/model';
import { NoteModel, TripletModel } from '../Note/model';
import { Item } from '../global/types';

export enum Barline {
  RepeatFirst, RepeatLast, Normal
}

export type FrontBarline = Barline.RepeatFirst | Barline.Normal;
export type BackBarline = Barline.RepeatLast | Barline.Normal;

export interface BarModel extends Item {
  timeSignature: TimeSignatureModel,
  notes: (NoteModel | TripletModel)[],
  frontBarline: FrontBarline,
  backBarline: BackBarline,
  isAnacrusis: boolean
}
