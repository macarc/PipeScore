/*
  ScoreSelection format
  Copyright (C) 2021 Archie Maclean
*/
import { ID } from '../global/id';
import { Note, SingleNote, Triplet, TripletNote } from '../Note/model';
import { SecondTimingModel } from '../SecondTiming/model';
import { TextBoxModel } from '../TextBox/model';
import Score from '../Score/functions';
import { ScoreModel } from '../Score/model';

export type SelectionModel =
  | ScoreSelection
  | TextSelection
  | SecondTimingSelection;

// Using the equivalent of 'case classes'
// This allows using instanceof to check selection type

export class ScoreSelection {
  public start: ID;
  public end: ID;
  constructor(start: ID, end: ID) {
    this.start = start;
    this.end = end;
  }
  public notesAndTriplets(score: ScoreModel): Note[] {
    const bars = Score.bars(score);
    let foundStart = false;
    const notes: Note[] = [];
    for (const bar of bars) {
      if (bar.hasID(this.start)) foundStart = true;
      for (const note of bar.notes) {
        if (note.hasID(this.start)) foundStart = true;
        if (foundStart) notes.push(note);
        if (note.hasID(this.end)) break;
      }
      if (bar.hasID(this.end)) break;
    }
    return notes;
  }
  public notes(score: ScoreModel): (SingleNote | TripletNote)[] {
    return Triplet.flatten(this.notesAndTriplets(score));
  }
}

export class TextSelection {
  public text: TextBoxModel;
  constructor(text: TextBoxModel) {
    this.text = text;
  }
  notes() {
    return [];
  }
}

export class SecondTimingSelection {
  secondTiming: SecondTimingModel;
  constructor(secondTiming: SecondTimingModel) {
    this.secondTiming = secondTiming;
  }
  notes() {
    return [];
  }
}
