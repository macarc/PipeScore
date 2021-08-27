/*
  Note format
  Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { Item } from '../global/id';
import { GracenoteModel } from '../Gracenote/model';

export interface PreviousNote {
  pitch: Pitch;
  x: number;
  y: number;
}

export interface BaseNote extends Item {
  pitch: Pitch;
  gracenote: GracenoteModel;
}

export interface NoteModel extends BaseNote {
  length: NoteLength;
  tied: boolean;
}

export interface TripletModel extends Item {
  length: NoteLength;
  tied: boolean;
  first: BaseNote;
  second: BaseNote;
  third: BaseNote;
}

// todo - dottedHemiDemiSemiQuaver should probably be removed since if it is used it is impossible for
// it to be finished unless used with another dottedHemiDemiSemiQuaver which is pretty unlikely
export const enum NoteLength {
  Semibreve = 'sb',
  DottedMinim = 'dm',
  Minim = 'm',
  DottedCrotchet = 'dc',
  Crotchet = 'c',
  DottedQuaver = 'dq',
  Quaver = 'q',
  DottedSemiQuaver = 'dsq',
  SemiQuaver = 'sq',
  DottedDemiSemiQuaver = 'dssq',
  DemiSemiQuaver = 'ssq',
  DottedHemiDemiSemiQuaver = 'dhdsq',
  HemiDemiSemiQuaver = 'hdsq',
}
