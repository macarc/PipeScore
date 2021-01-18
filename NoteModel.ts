import { svg } from 'uhtml';
import Gracenote, { GracenoteModel } from './Gracenote';
import { Pitch, Svg, noteY } from './all';
import { NoteLength, isFilled, hasDot, hasStem } from './NoteLength';
import { isSelected, isBeingDragged } from './Controller';

export const gracenoteToNoteWidthRatio = 0.6;
export const tailGap = 5;
export const shortTailLength = 10;

export interface NoteModel {
  pitch: Pitch,
  length: NoteLength,
  gracenote: GracenoteModel,
  tied: boolean
}

export interface PreviousNote {
  pitch: Pitch,
  x: number,
  y: number
}

export interface NoteProps {
  x: number,
  y: number,
  previousNote: PreviousNote | null,
  noteWidth: number,
}

export const shouldTie = (note: NoteModel, previous: PreviousNote | null): previous is PreviousNote => note.tied && (previous || false) && previous.pitch === note.pitch;


export const noteAndGracenoteWidth = (notes: NoteModel[], prevNote: Pitch | null) =>
	notes.map((n,i) => 1 + (n.tied ? 0 :
	  (gracenoteToNoteWidthRatio * Gracenote.numberOfNotes(n.gracenote, n.pitch, i === 0 ? prevNote : notes[i - 1].pitch)))
	).reduce((a,b) => a + b, 0);
    
export const initNoteModel = (pitch: Pitch, length: NoteLength, tied: boolean = false) => ({
  pitch,
  length,
  gracenote: Gracenote.init(),
  tied
});

