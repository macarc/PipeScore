/*
  Note format
  Copyright (C) 2021 Archie Maclean
 */
import { Pitch } from '../global/pitch';
import { Item } from '../global/id';
import { Gracenote } from '../Gracenote/model';

export interface PreviousNote {
  pitch: Pitch;
  x: number;
  y: number;
}
export interface BaseNote extends Item {
  pitch: Pitch;
  gracenote: Gracenote;
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

/*
Coming soon... :)

export class BaseNote extends Item {
  protected pitch: Pitch;
  protected gracenote: GracenoteModel;
  constructor(pitch: Pitch) {
    super(null);
    this.pitch = pitch;
    this.gracenote = new SingleGracenote();
  }
}

export class NoteModel extends BaseNote {
  private length: NoteLength;
  private tied: boolean;
  constructor(pitch: Pitch, length: NoteLength) {
    super(pitch);
    this.length = length;
    this.tied = false;
  }
}

export class TripletModel extends Item {
  private length: NoteLength;
  private tied: boolean;
  private first: BaseNote;
  private second: BaseNote;
  private third: BaseNote;
  constructor(
    length: NoteLength,
    first: BaseNote,
    second: BaseNote,
    third: BaseNote
  ) {
    super(null);
    this.length = length;
    this.tied = false;
    this.first = first;
    this.second = second;
    this.third = third;
  }
}
*/

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
