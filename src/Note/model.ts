import { Pitch, ID } from '../all';
import { GracenoteModel } from '../Gracenote/model';

export interface PreviousNote {
  pitch: Pitch,
  x: number,
  y: number
}

export interface NoteModel {
  pitch: Pitch,
  length: NoteLength,
  gracenote: GracenoteModel,
  tied: boolean,
  id: ID
}

export interface GroupNoteModel {
  notes: NoteModel[],
  triplet: boolean
}

// todo - dottedHemiDemiSemiQuaver should probably be removed since if it is used it is impossible for
// it to be finished unless used with another dottedHemiDemiSemiQuaver which is pretty unlikely
export const enum NoteLength {
  Semibreve = 'sb',
  DottedMinim = 'dm', Minim = 'm',
  DottedCrotchet = 'dc', Crotchet = 'c',
  DottedQuaver = 'dq', Quaver = 'q',
  DottedSemiQuaver = 'dsq', SemiQuaver = 'sq',
  DottedDemiSemiQuaver = 'dssq', DemiSemiQuaver = 'ssq',
  DottedHemiDemiSemiQuaver = 'dhdsq', HemiDemiSemiQuaver = 'hdsq'
}
