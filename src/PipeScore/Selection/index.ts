//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Gracenote, NoGracenote } from '../Gracenote';
import { GracenoteState } from '../Gracenote/state';
import { Triplet } from '../Note';
import { Score } from '../Score';
import { TextBox } from '../TextBox';
import { Timing, TimingPart } from '../Timing';
import { Pitch } from '../global/pitch';
import { Selection } from './model';

export { Selection } from './model';
export { ScoreSelection } from './score_selection';

export class TextSelection extends Selection {
  public text: TextBox;

  constructor(text: TextBox, createdByMouseDown: boolean) {
    super(createdByMouseDown);
    this.text = text;
  }
  public delete(score: Score) {
    score.deleteTextBox(this.text);
    return null;
  }
  public mouseDrag(x: number, y: number, score: Score, page: number) {
    score.dragTextBox(this.text, x, y, page);
  }
}

export class BarlineSelection extends Selection {
  public drag_cb: (x: number) => void;

  constructor(drag: (x: number) => void, createdByMouseDown: boolean) {
    super(createdByMouseDown);
    this.drag_cb = drag;
  }
  public mouseDrag(x: number) {
    this.drag_cb(x);
  }
}

export class TimingSelection extends Selection {
  timing: Timing;
  private part: TimingPart;

  constructor(
    timing: Timing,
    clickedPart: TimingPart,
    createdByMouseDown: boolean
  ) {
    super(createdByMouseDown);
    this.timing = timing;
    this.part = clickedPart;
  }
  public delete(score: Score) {
    score.deleteTiming(this.timing);
    return null;
  }
  public mouseDrag(x: number, y: number, score: Score, page: number) {
    score.dragTiming(this.timing, this.part, x, y, page);
  }
}

export class TripletLineSelection extends Selection {
  public selected: Triplet;

  constructor(triplet: Triplet, createdByMouseDown: boolean) {
    super(createdByMouseDown);
    this.selected = triplet;
  }
  public delete(score: Score) {
    const location = score.location(this.selected.id);
    if (location) location.bar.unmakeTriplet(this.selected);
    return null;
  }
}

export class GracenoteSelection extends Selection {
  private selected: Gracenote;
  private note: number | 'all';

  constructor(
    gracenote: Gracenote,
    note: number | 'all',
    createdByMouseDown: boolean
  ) {
    super(createdByMouseDown);
    this.selected = gracenote;
    this.note = note;
  }

  public changeGracenote(newGracenote: Gracenote, score: Score) {
    for (const note of score.notes()) {
      note.replaceGracenote(this.selected, newGracenote);
    }
    this.selected = newGracenote;
  }

  public delete(score: Score) {
    if (this.note === 'all') {
      this.changeGracenote(new NoGracenote(), score);
      return null;
    }
    const updated = this.selected.removeSingle(this.note);
    this.changeGracenote(updated, score);
    if (this.note > 0) {
      this.note--;
    }
    if (updated.numberOfNotes() === 0) return null;
    return this;
  }

  public dragOverPitch(pitch: Pitch, score: Score) {
    if (this.note !== 'all') {
      const dragged = this.selected.drag(pitch, this.note);
      this.changeGracenote(dragged, score);
    }
  }

  public moveUp(score: Score) {
    if (this.note !== 'all') {
      const changed = this.selected.moveUp(this.note);
      if (changed) this.changeGracenote(changed, score);
    }
  }

  public moveDown(score: Score) {
    if (this.note !== 'all') {
      const changed = this.selected.moveDown(this.note);
      if (changed) this.changeGracenote(changed, score);
    }
  }

  public nextNote() {
    if (this.note !== 'all' && this.note < this.selected.notes().length - 1)
      this.note++;
  }

  public previousNote() {
    if (this.note !== 'all' && this.note > 0) this.note--;
  }

  public gracenote() {
    return this.selected;
  }

  public state(): GracenoteState {
    return {
      dragged:
        this.dragging && this.note !== 'all'
          ? { gracenote: this.selected, note: this.note }
          : null,
      selected: { gracenote: this.selected, note: this.note },
    };
  }
}
