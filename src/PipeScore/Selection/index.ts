/*
  ScoreSelection format
  Copyright (C) 2021 Archie Maclean
*/
import { ID, Item } from '../global/id';
import { Note, SingleNote, Triplet, TripletNote } from '../Note';
import { DraggedSecondTiming, SecondTiming } from '../SecondTiming';
import { TextBox } from '../TextBox';
import { Score } from '../Score';
import { deleteXY, getXY } from '../global/xy';
import { h, svg } from '../../render/h';
import { lineGap } from '../global/constants';
import { Anacrusis, Bar } from '../Bar';
import { Pitch } from '../global/pitch';
import { Update } from '../Controllers/Controller';
import { Gracenote, NoGracenote, SingleGracenote } from '../Gracenote';
import { GracenoteState } from '../Gracenote/state';
import { car } from '../global/utils';
import { Stave } from '../Stave';
import { changeGracenoteFrom } from '../Controllers/Gracenote';

interface ScoreSelectionProps {
  staveStartX: number;
  staveEndX: number;
  staveGap: number;
}

export type Selection =
  | ScoreSelection
  | TextSelection
  | SecondTimingSelection
  | GracenoteSelection;

abstract class BaseSelection<A> {
  abstract delete(score: Score): void;
  abstract mouseDrag(x: number, y: number, score: Score): void;

  protected dragged: A | null = null;
  public drag(a: A) {
    this.dragged = a;
    return this;
  }
  public mouseUp() {
    this.dragged = null;
  }
  public notes(score: Score): (SingleNote | TripletNote)[] {
    return [];
  }
  public render(props: ScoreSelectionProps) {
    return svg('g', { class: 'selection' });
  }
}
// Using the equivalent of 'case classes'
// This allows using instanceof to check selection type
export class ScoreSelection extends BaseSelection<SingleNote | TripletNote> {
  public start: ID;
  public end: ID;

  constructor(start: ID, end: ID) {
    super();
    this.start = start;
    this.end = end;
  }
  // TODO see if we can get rid of this
  public draggedNote() {
    return this.dragged;
  }
  public mouseOverPitch(pitch: Pitch) {
    return this.dragged?.drag(pitch) || Update.NoChange;
  }
  public mouseDrag() {
    // TODO make this empty method unnecessary :)
  }
  public delete(score: Score) {
    let started = false;
    let deletingBars = false;
    const notesToDelete: [Note, Bar][] = [];
    const barsToDelete: [Bar, Stave][] = [];

    all: for (const stave of score.staves()) {
      for (const bar of stave.allBars()) {
        if (bar.hasID(this.start)) {
          deletingBars = true;
          started = true;
        }
        for (const note of bar.notesAndTriplets()) {
          if (note.hasID(this.start)) started = true;
          if (started) notesToDelete.push([note, bar]);
          if (note.hasID(this.end)) break all;
        }
        if (started && deletingBars) barsToDelete.push([bar, stave]);
        if (bar.hasID(this.end)) break all;
      }
    }
    notesToDelete.forEach(([note, bar]) => bar.deleteNote(note));

    for (const [bar, stave] of barsToDelete) {
      stave.deleteBar(bar);
      if (stave.numberOfBars() === 0) score.deleteStave(stave);
    }

    this.purgeItems(
      [...notesToDelete.map(car), ...barsToDelete.map(car)],
      score
    );
  }
  private purgeItems(items: Item[], score: Score) {
    // Deletes all references to the items in the array
    score.purgeSecondTimings(items);
    for (const note of items) {
      deleteXY(note.id);
    }
  }
  public notesAndTriplets(score: Score): Note[] {
    const bars = score.bars();
    let foundStart = false;
    const notes: Note[] = [];
    for (const bar of bars) {
      if (bar.hasID(this.start)) foundStart = true;
      for (const note of bar.notesAndTriplets()) {
        if (note.hasID(this.start)) foundStart = true;
        if (foundStart) notes.push(note);
        if (note.hasID(this.end)) break;
      }
      if (bar.hasID(this.end)) break;
    }
    return notes;
  }
  public notes(score: Score): (SingleNote | TripletNote)[] {
    return Triplet.flatten(this.notesAndTriplets(score));
  }
  public addAnacrusis(before: boolean, score: Score) {
    const { bar, stave } = score.location(this.start);
    stave.insertBar(new Anacrusis(bar.timeSignature()), bar, before);
  }
  public addBar(before: boolean, score: Score) {
    const { bar, stave } = score.location(this.start);
    stave.insertBar(new Bar(bar.timeSignature()), bar, before);
  }

  public render(props: ScoreSelectionProps) {
    const start = getXY(this.start);
    const end = getXY(this.end);
    if (!start || !end) {
      console.error('Invalid note in selection');
      return svg('g');
    }

    const height = 6 * lineGap;

    if (end.y !== start.y) {
      const higher = start.y > end.y ? end : start;
      const lower = start.y > end.y ? start : end;
      const numStavesBetween =
        Math.round((lower.y - higher.y) / props.staveGap) - 1;
      return svg('g', { class: 'selection' }, [
        svg('rect', {
          x: higher.beforeX,
          y: higher.y - lineGap,
          width: props.staveEndX - higher.beforeX,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
        }),
        svg('rect', {
          x: props.staveStartX,
          y: lower.y - lineGap,
          width: lower.afterX - props.staveStartX,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
        }),
        ...[...Array(numStavesBetween).keys()]
          .map((i) => i + 1)
          .map((i) =>
            svg('rect', {
              x: props.staveStartX,
              y: higher.y + i * props.staveGap - lineGap,
              width: props.staveEndX - props.staveStartX,
              height,
              fill: 'orange',
              opacity: 0.5,
              'pointer-events': 'none',
            })
          ),
      ]);
    } else {
      const width = end.afterX - start.beforeX;
      return svg('g', { class: 'selection' }, [
        svg('rect', {
          x: start.beforeX,
          y: start.y - lineGap,
          width,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
        }),
      ]);
    }
  }
}

export class TextSelection extends BaseSelection<TextBox> {
  public text: TextBox;

  constructor(text: TextBox) {
    super();
    this.text = text;
  }
  public delete(score: Score) {
    score.deleteTextBox(this.text);
  }
  public mouseDrag(x: number, y: number, score: Score) {
    if (this.dragged) score.dragTextBox(this.dragged, x, y);
  }
}

export class SecondTimingSelection {
  secondTiming: SecondTiming;
  private dragged: DraggedSecondTiming | null = null;

  constructor(secondTiming: SecondTiming) {
    this.secondTiming = secondTiming;
  }
  public delete(score: Score) {
    score.deleteSecondTiming(this.secondTiming);
  }
  public mouseUp() {
    this.dragged = null;
  }
  public drag(part: 'start' | 'middle' | 'end') {
    this.dragged = { secondTiming: this.secondTiming, dragged: part };
    return this;
  }
  public mouseDrag(x: number, y: number, score: Score) {
    if (this.dragged) score.dragSecondTiming(this.dragged, x, y);
  }
  public notes() {
    return [];
  }
  public render() {
    return h('g');
  }
}

export class GracenoteSelection extends BaseSelection<Gracenote> {
  public selected: Gracenote;

  constructor(gracenote: Gracenote) {
    super();
    this.selected = gracenote;
  }
  public mouseDrag() {
    // TODO make this empty method unnecessary :)
  }
  public delete(score: Score) {
    changeGracenoteFrom(this.selected, new NoGracenote(), score);
  }
  public drag(gracenote: Gracenote) {
    this.selected = gracenote;
    this.dragged = gracenote instanceof SingleGracenote ? gracenote : null;
    return this;
  }
  public mouseOverPitch(pitch: Pitch) {
    return this.dragged ? this.dragged.drag(pitch) : Update.NoChange;
  }
  public state(): GracenoteState {
    return {
      dragged: this.dragged instanceof SingleGracenote ? this.dragged : null,
      selected: this.selected,
    };
  }
}
