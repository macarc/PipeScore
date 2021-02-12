import { Pitch } from '../global/pitch';
import { Item } from '../global/types';
import { GracenoteModel } from '../Gracenote/model';

export interface PreviousNote {
  pitch: Pitch,
  x: number,
  y: number
}

export interface NoteModel extends Item {
  pitch: Pitch,
  length: NoteLength,
  gracenote: GracenoteModel,
  tied: boolean
}

export interface GroupNoteModel {
  notes: NoteModel[],
  triplet: boolean
}

interface TripletNoteModel extends Item {
  pitch: Pitch,
  gracenote: GracenoteModel
}

export interface TripletModel {
  length: NoteLength,
  first: TripletNoteModel,
  second: TripletNoteModel,
  third: TripletNoteModel
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
