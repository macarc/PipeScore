/*
  ScoreSelection format
  Copyright (C) 2021 macarc
*/
import { Triplet } from '../Note';
import { Timing, TimingPart } from '../SecondTiming';
import { TextBox } from '../TextBox';
import { Score } from '../Score';
import { Pitch } from '../global/pitch';
import { Gracenote, SingleGracenote } from '../Gracenote';
import { GracenoteState } from '../Gracenote/state';
import { changeGracenoteFrom } from '../Events/Gracenote';
import { Drags } from './model';

export { Selection } from './model';
export { ScoreSelection } from './score_selection';

export class TextSelection extends Drags {
  public text: TextBox;

  constructor(text: TextBox) {
    super();
    this.text = text;
  }
  public delete(score: Score) {
    score.deleteTextBox(this.text);
  }
  public mouseDrag(x: number, y: number, score: Score, page: number) {
    score.dragTextBox(this.text, x, y, page);
  }
}

export class BarlineSelection extends Drags {
  public drag_cb: (x: number) => void;

  constructor(drag: (x: number) => void) {
    super();
    this.drag_cb = drag;
  }
  public mouseDrag(x: number) {
    this.drag_cb(x);
  }
}

export class SecondTimingSelection extends Drags {
  secondTiming: Timing;
  private part: TimingPart;

  constructor(secondTiming: Timing, clickedPart: TimingPart) {
    super();
    this.secondTiming = secondTiming;
    this.part = clickedPart;
  }
  public delete(score: Score) {
    score.deleteSecondTiming(this.secondTiming);
  }
  public mouseDrag(x: number, y: number, score: Score, page: number) {
    score.dragSecondTiming(this.secondTiming, this.part, x, y, page);
  }
}

export class TripletLineSelection extends Drags {
  public selected: Triplet;

  constructor(triplet: Triplet) {
    super();
    this.selected = triplet;
  }
  delete(score: Score) {
    const location = score.location(this.selected.id);
    if (location) location.bar.unmakeTriplet(this.selected);
  }
}

export class GracenoteSelection extends Drags {
  private selected: Gracenote;
  private note: number | 'all';

  constructor(gracenote: Gracenote, note: number | 'all') {
    super();
    this.selected = gracenote;
    this.note = note;
  }
  delete(score: Score) {
    changeGracenoteFrom(
      this.selected,
      this.note === 'all'
        ? Gracenote.fromName('none')
        : this.selected.removeSingle(this.note),
      score
    );
  }
  dragOverPitch(pitch: Pitch, score: Score) {
    if (this.note !== 'all') {
      const dragged = this.selected.drag(pitch, this.note);
      changeGracenoteFrom(this.selected, dragged, score);
      this.selected = dragged;
    }
  }
  moveUp() {
    this.single()?.moveUp();
  }
  moveDown() {
    this.single()?.moveDown();
  }
  private single(): SingleGracenote | null {
    if (this.selected instanceof SingleGracenote) return this.selected;

    return null;
  }
  state(): GracenoteState {
    return {
      dragged:
        this.dragging && this.note !== 'all'
          ? { gracenote: this.selected, note: this.note }
          : null,
      selected: { gracenote: this.selected, note: this.note },
    };
  }
}
