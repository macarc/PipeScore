/*
  ScoreSelection format
  Copyright (C) 2021 Archie Maclean
*/
import { ID } from '../global/id';
import { Note, SingleNote, Triplet, TripletNote } from '../Note/model';
import { SecondTiming } from '../SecondTiming/model';
import { TextBox } from '../TextBox/model';
import { Score } from '../Score/model';
import { getXY } from '../global/xy';
import { svg } from '../../render/h';
import { lineGap } from '../global/constants';

interface ScoreSelectionProps {
  staveStartX: number;
  staveEndX: number;
  staveGap: number;
}

export type Selection = ScoreSelection | TextSelection | SecondTimingSelection;

// Using the equivalent of 'case classes'
// This allows using instanceof to check selection type

export class ScoreSelection {
  public start: ID;
  public end: ID;
  constructor(start: ID, end: ID) {
    this.start = start;
    this.end = end;
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

export class TextSelection {
  public text: TextBox;
  constructor(text: TextBox) {
    this.text = text;
  }
  notes() {
    return [];
  }
  render() {
    // Text selection is shown by making the text orange, so nothing to do
    return svg('g', { class: 'text-selection' });
  }
}

export class SecondTimingSelection {
  secondTiming: SecondTiming;
  constructor(secondTiming: SecondTiming) {
    this.secondTiming = secondTiming;
  }
  notes() {
    return [];
  }
  render() {
    // Second timing selection is shown by making the selected st orange, so nothing to do
    return svg('g', { class: 'second-timing-selection' });
  }
}
