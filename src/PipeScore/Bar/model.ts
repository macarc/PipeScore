/*
  Define format for bar
  Copyright (C) 2021 Archie Maclean
 */
import { TimeSignatureModel } from '../TimeSignature/model';
import { NoteModel, TripletModel } from '../Note/model';
import { Item } from '../global/id';

export enum Barline {
  Repeat,
  Normal,
  End,
}

export interface BarModel extends Item {
  timeSignature: TimeSignatureModel;
  notes: (NoteModel | TripletModel)[];
  frontBarline: Barline;
  backBarline: Barline;
  isAnacrusis: boolean;
}
