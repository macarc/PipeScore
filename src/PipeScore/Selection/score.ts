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

//  A ScoreSelection is any selection of notes / bars
//  It has considerably more functionality than the other selections
//  so it goes in its own file

import m from 'mithril';
import type { IBar } from '../Bar';
import type { IGracenote } from '../Gracenote';
import type { IMeasure } from '../Measure';
import type { INote, NoteOrTriplet } from '../Note';
import type { IScore } from '../Score';
import type { IStave } from '../Stave';
import type { ITune } from '../Tune';
import type { ID } from '../global/id';
import type { Pitch } from '../global/pitch';
import type { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { foreach, last } from '../global/utils';
import { type XY, getXY, getXYRangeForPage, isItemBefore } from '../global/xy';
import { DraggableSelection } from './dragging';

interface ScoreSelectionProps {
  page: number;
  score: IScore;
  staveStartX: number;
  staveEndX: number;
}

export class ScoreSelection extends DraggableSelection {
  private _start: ID;
  private _end: ID;

  private constructor(start: ID, end: ID, createdByMouseDown: boolean) {
    super(createdByMouseDown);
    this._start = start;
    this._end = end;
  }

  static from(start: ID, end: ID, createdByMouseDown: boolean) {
    if (ScoreSelection.checkIfInSameHarmonyPart(start, end)) {
      return new ScoreSelection(start, end, createdByMouseDown);
    }
    return null;
  }

  start() {
    return this._start;
  }

  end() {
    return this._end;
  }

  setEnd(end: ID) {
    if (ScoreSelection.checkIfInSameHarmonyPart(this._start, this._end)) {
      this._end = end;
    }
  }

  static checkIfInSameHarmonyPart(a: ID, b: ID) {
    if (a === b) return true;

    return getXY(a)?.harmonyIndex === getXY(b)?.harmonyIndex;
  }

  override dragOverPitch(pitch: Pitch, score: IScore) {
    const allNotes = score.notes();
    for (const note of this.notes(score)) {
      note.drag(pitch);
      note.makeCorrectTie(allNotes);
    }
  }

  override delete(score: IScore) {
    let deletingHarmonyIndex = -1;
    let deleteBars = false;
    const newSelection = this.selectedPrevious(score);
    const notesToDelete: [INote, IBar][] = [];
    const measuresToDelete: [IMeasure, IStave, ITune][] = [];

    all: for (const tune of score.tunes()) {
      for (const stave of tune.staves()) {
        for (const measure of stave.measures()) {
          for (const bar of measure.bars()) {
            if (
              deletingHarmonyIndex !== -1 &&
              deletingHarmonyIndex !== bar.harmonyIndex()
            ) {
              continue;
            }

            if (bar.hasID(this._start)) {
              // Delete bars if whole bar is selected AND it isn't in the harmony stave
              // If it's in a harmony stave, clear bars instead
              if (bar.harmonyIndex() === 0) {
                deleteBars = true;
              }
              deletingHarmonyIndex = bar.harmonyIndex();
            }
            for (const note of bar.notes()) {
              if (note.hasID(this._start)) deletingHarmonyIndex = bar.harmonyIndex();
              if (deletingHarmonyIndex !== -1)
                notesToDelete.push([note, measure.bars()[deletingHarmonyIndex]]);
              if (note.hasID(this._end)) break all;
            }
            if (deletingHarmonyIndex !== -1)
              measuresToDelete.push([measure, stave, tune]);
            if (bar.hasID(this._end)) break all;
          }
        }
      }
    }

    const deletedSomething =
      notesToDelete.length > 0 || (deleteBars && measuresToDelete.length > 0);

    // If the next note after the selection is tied, untie it
    if (notesToDelete.length > 0) {
      const lastNote = notesToDelete[notesToDelete.length - 1][0];
      const noteAfterLast = score.nextNote(lastNote.id);
      if (noteAfterLast?.isTied()) {
        noteAfterLast.toggleTie(score.notes());
      }
    }

    for (const [note, bar] of notesToDelete) {
      bar.deleteNote(note);
    }

    if (deleteBars) {
      for (const [measure, stave, tune] of measuresToDelete) {
        stave.deleteMeasure(measure);
        if (stave.numberOfMeasures() === 0) tune.deleteStave(stave);
      }
    }

    if (!deletedSomething) {
      return this;
    }
    if (newSelection) {
      return new ScoreSelection(newSelection, newSelection, false);
    }
    return null;
  }

  lastNoteAndBar(score: IScore): {
    note: INote | null;
    bar: IBar | null;
  } {
    const notes = this.notes(score);
    const bar = score.location(this._end)?.bar || null;
    return { note: last(notes), bar };
  }

  // Selected notes and triplets
  // (these are guaranteed to all be in the same harmony stave)
  notesAndTriplets(score: IScore): NoteOrTriplet[] {
    for (const part of score.bars()) {
      let foundStart = false;
      const notes: NoteOrTriplet[] = [];
      for (const bar of part) {
        if (bar.hasID(this._start)) foundStart = true;
        for (const note of bar.notesAndTriplets()) {
          if (note.hasID(this._start)) foundStart = true;
          if (foundStart) notes.push(note);
          if (note.hasID(this._end)) return notes;
        }
        if (bar.hasID(this._end)) return notes;
      }
    }
    return [];
  }

  // Selected notes, including notes that are part of a triplet
  // (these are guaranteed to all be in the same harmony stave)
  notes(score: IScore): INote[] {
    for (const part of score.bars()) {
      let foundStart = false;
      const notes: INote[] = [];
      for (const bar of part) {
        if (bar.hasID(this._start)) foundStart = true;
        for (const note of bar.notes()) {
          if (note.hasID(this._start)) foundStart = true;
          if (foundStart) notes.push(note);
          if (note.hasID(this._end)) return notes;
        }
        if (bar.hasID(this._end)) return notes;
      }
    }
    return [];
  }

  bars(score: IScore): IBar[] {
    for (const part of score.bars()) {
      const bars = [];
      let foundStart = false;
      for (const bar of part) {
        if (bar.hasID(this._start) || bar.containsNoteWithID(this._start))
          foundStart = true;
        if (foundStart) bars.push(bar);
        if (bar.hasID(this._end) || bar.containsNoteWithID(this._end)) return bars;
      }
    }
    return [];
  }

  measures(score: IScore): IMeasure[] {
    return this.bars(score).map((bar) => bar.measure());
  }

  staves(score: IScore): IStave[] {
    return this.staveLocations(score).map(({ stave }) => stave);
  }

  staveLocations(score: IScore): { tune: ITune; stave: IStave }[] {
    let foundStart = false;
    const staves: { tune: ITune; stave: IStave }[] = [];
    all: for (const tune of score.tunes()) {
      for (const stave of tune.staves()) {
        if (stave.containsID(this._start)) foundStart = true;
        if (foundStart) staves.push({ tune, stave });
        if (stave.containsID(this._end)) break all;
      }
    }
    return staves;
  }

  measureLocations(
    score: IScore
  ): { measure: IMeasure; stave: IStave; tune: ITune }[] {
    let foundStart = false;
    const measures: { measure: IMeasure; stave: IStave; tune: ITune }[] = [];

    all: for (const tune of score.tunes()) {
      for (const stave of tune.staves()) {
        for (const measure of stave.measures()) {
          if (measure.containsID(this._start)) foundStart = true;
          if (foundStart) measures.push({ measure, tune, stave });
          if (measure.containsID(this._end)) break all;
        }
      }
    }

    return measures;
  }

  note(score: IScore): INote | null {
    const notes = this.notes(score);
    if (notes.length > 0) {
      return notes[0];
    }
    return null;
  }

  bar(score: IScore): IBar | null {
    if (this._start === this._end) {
      for (const part of score.bars()) {
        for (const bar of part) {
          if (bar.id === this._start) return bar;
        }
      }
    }
    return null;
  }

  tune(score: IScore): ITune | null {
    return score.location(this._start)?.tune || null;
  }

  gracenote(score: IScore): IGracenote | null {
    const notes = this.notes(score);
    if (notes.length === 1) {
      return notes[0].gracenote();
    }
    return null;
  }

  addAnacrusis(where: Relative, score: IScore) {
    const location = score.location(this._start);
    if (location) {
      const { stave, measure } = location;
      stave.insertMeasure(measure, where, true);
    }
  }

  addMeasure(where: Relative, score: IScore) {
    const location = score.location(this._start);
    if (location) {
      const { measure, stave } = location;
      stave.insertMeasure(measure, where, false);
    }
  }

  // Extend the current selection to include the item
  extend(id: ID) {
    if (ScoreSelection.checkIfInSameHarmonyPart(id, this._start)) {
      if (isItemBefore(this._end, id, 'afterX', 'afterX')) {
        this._end = id;
      } else if (isItemBefore(id, this._start, 'beforeX', 'beforeX')) {
        this._start = id;
      }
    }
  }

  // If selection is:
  // - A single note, find the previous note
  // - A single bar, find the previous bar
  private selectedPrevious(score: IScore): ID | null {
    const n = this.note(score);
    const b = this.bars(score)[0] || null;
    let newSelection: ID | null = null;
    if (this._start === this._end) {
      if (n) {
        const previousNote = score.location(n.id)?.stave.previousNote(n.id);
        newSelection = previousNote?.id || null;
      } else if (b) {
        const previousBar = score.location(b.id)?.stave.previousBar(b);
        newSelection = previousBar?.id || null;
      }
    }
    return newSelection;
  }

  private renderHighlight(start: XY, end: XY, props: ScoreSelectionProps) {
    const height = settings.lineHeightOf(6);
    const borderRadius = 5;

    if (start.y === end.y) {
      const width = end.afterX - start.beforeX;
      return m('g[class=selection]', [
        m('rect', {
          x: start.beforeX,
          y: start.y - settings.lineGap,
          width,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
          rx: borderRadius,
          ry: borderRadius,
        }),
      ]);
    }

    const staves = props.score.staves();
    const startStaveIndex = staves.findIndex((stave) => stave.containsID(start.id));
    const endStaveIndex = staves.findIndex((stave) => stave.containsID(end.id));
    const numStavesBetween = Math.max(endStaveIndex - startStaveIndex - 1, 0);

    return m('g[class=selection]', [
      m('rect', {
        x: start.beforeX,
        y: start.y - settings.lineGap,
        width: props.staveEndX - start.beforeX,
        height,
        fill: 'orange',
        opacity: 0.5,
        'pointer-events': 'none',
        rx: borderRadius,
        ry: borderRadius,
      }),
      m('rect', {
        x: props.staveStartX,
        y: end.y - settings.lineGap,
        width: end.afterX - props.staveStartX,
        height,
        fill: 'orange',
        opacity: 0.5,
        'pointer-events': 'none',
        rx: borderRadius,
        ry: borderRadius,
      }),
      ...foreach(numStavesBetween, (i) => startStaveIndex + i + 1).map((i) =>
        m('rect', {
          x: props.staveStartX,
          y: props.score.staveY(staves[i]) + settings.staveGap - settings.lineGap,
          width: props.staveEndX - props.staveStartX,
          height,
          fill: 'orange',
          opacity: 0.5,
          'pointer-events': 'none',
          rx: borderRadius,
          ry: borderRadius,
        })
      ),
    ]);
  }

  render(props: ScoreSelectionProps): m.Children {
    const { start, end } = getXYRangeForPage(
      this._start,
      this._end,
      props.page,
      props.score,
      false
    );

    if (start && end) {
      return this.renderHighlight(start, end, props);
    }

    return null;
  }
}
