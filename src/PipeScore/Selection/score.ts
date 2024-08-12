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
import type { IBar, IMeasure } from '../Bar';
import type { IGracenote } from '../Gracenote';
import { INote, type NoteOrTriplet, flattenTriplets } from '../Note';
import type { IScore } from '../Score';
import type { IStave } from '../Stave';
import type { ITune } from '../Tune';
import type { ID } from '../global/id';
import type { Pitch } from '../global/pitch';
import type { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { foreach, last } from '../global/utils';
import { type XY, getXYRangeForPage, isItemBefore } from '../global/xy';
import { DraggableSelection } from './dragging';
import { Measure } from '../Bar/impl';

interface ScoreSelectionProps {
  page: number;
  score: IScore;
  staveStartX: number;
  staveEndX: number;
}

export class ScoreSelection extends DraggableSelection {
  start: ID;
  end: ID;

  constructor(start: ID, end: ID, createdByMouseDown: boolean) {
    super(createdByMouseDown);
    this.start = start;
    this.end = end;
  }

  override dragOverPitch(pitch: Pitch, score: IScore) {
    for (const note of this.notes(score)) {
      note.drag(pitch);
      note.makeCorrectTie(score.notes());
    }
  }

  override delete(score: IScore) {
    let started = false;
    let deleteBars = false;
    const newSelection = this.selectedPrevious(score);
    const notesToDelete: [INote, IBar][] = [];
    const measuresToDelete: [IMeasure, IStave, ITune][] = [];

    all: for (const tune of score.tunes()) {
      for (const stave of tune.staves()) {
        for (const measure of stave.measures()) {
          if (measure.hasID(this.start)) {
            deleteBars = true;
            started = true;
          }
          for (const note of measure.bars()[0].notes()) {
            if (note.hasID(this.start)) started = true;
            if (started) notesToDelete.push([note, measure.bars()[0]]);
            if (note.hasID(this.end)) break all;
          }
          if (started) measuresToDelete.push([measure, stave, tune]);
          if (measure.hasID(this.end)) break all;
        }
      }
    }

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

    if (newSelection) {
      return new ScoreSelection(newSelection, newSelection, false);
    }
    return null;
  }

  lastNoteAndMeasure(score: IScore): { note: INote | null; measure: IMeasure | null } {
    const notes = this.notes(score);
    const measure = score.location(this.end)?.measure || null;
    return { note: last(notes), measure };
  }

  // Get all selected notes and triplets
  notesAndTriplets(score: IScore): NoteOrTriplet[] {
    return this.collectNotes(score, false);
  }

  // Get all selected single notes, including notes
  // that are part of a triplet
  notes(score: IScore): INote[] {
    // When true is passed, this will always be a Note[]
    return this.collectNotes(score, true) as INote[];
  }

  measureLocations(score: IScore): { measure: IMeasure; tune: ITune; stave: IStave }[] {
    let foundStart = false;
    const measures: { measure: IMeasure; tune: ITune; stave: IStave }[] = [];
    all: for (const tune of score.tunes()) {
      for (const stave of tune.staves()) {
        for (const measure of stave.measures()) {
          if (measure.hasID(this.start)) foundStart = true;
          if (foundStart) measures.push({ measure, tune, stave });
          if (measure.hasID(this.end)) break all;
        }
      }
    }
    return measures;
  }

  measures(score: IScore): IMeasure[] {
    return this.measureLocations(score).map(({ measure }) => measure);
  }

  staves(score: IScore): IStave[] {
    return this.staveLocations(score).map(({ stave }) => stave);
  }

  staveLocations(score: IScore): { tune: ITune; stave: IStave }[] {
    let foundStart = false;
    const staves: { tune: ITune; stave: IStave }[] = [];
    all: for (const tune of score.tunes()) {
      for (const stave of tune.staves()) {
        if (stave.includesID(this.start)) foundStart = true;
        if (foundStart) staves.push({ tune, stave });
        if (stave.includesID(this.end)) break all;
      }
    }
    return staves;
  }

  note(score: IScore): INote | null {
    const notes = this.notes(score);
    if (notes.length > 0) {
      return notes[0];
    }
    return null;
  }

  measure(score: IScore): IMeasure | null {
    if (this.start === this.end) {
      for (const measure of score.measures()) {
        if (measure.id === this.start) return measure;
      }
    }
    return null;
  }

  tune(score: IScore): ITune | null {
    return score.location(this.start)?.tune || null;
  }

  gracenote(score: IScore): IGracenote | null {
    const notes = this.notes(score);
    if (notes.length === 1) {
      return notes[0].gracenote();
    }
    return null;
  }

  addAnacrusis(where: Relative, score: IScore) {
    const location = score.location(this.start);
    if (location) {
      const { stave, measure } = location;
      stave.insertMeasure(new Measure(measure.timeSignature(), true), measure, where);
    }
  }

  addMeasure(where: Relative, score: IScore) {
    const location = score.location(this.start);
    if (location) {
      const { measure, stave } = location;
      stave.insertMeasure(new Measure(measure.timeSignature()), measure, where);
    }
  }

  // Extend the current selection to include the item
  extend(id: ID) {
    if (isItemBefore(this.end, id, 'afterX', 'afterX')) {
      this.end = id;
    } else if (isItemBefore(id, this.start, 'beforeX', 'beforeX')) {
      this.start = id;
    }
  }


  // If selection is:
  // - A single note, find the previous note
  // - A single measure, find the previous measure
  private selectedPrevious(score: IScore): ID | null {
    const n = this.note(score);
    const b = this.measures(score)[0] || null;
    let newSelection: ID | null = null;
    if (this.start === this.end) {
      if (n) {
        const previousNote = score.location(n.id)?.stave.previousNote(n.id);
        newSelection = previousNote?.id || null;
      } else if (b) {
        const previousBar = score.location(b.id)?.stave.previousMeasure(b);
        newSelection = previousBar?.id || null;
      }
    }
    return newSelection;
  }

  private collectNotes(score: IScore, splitUpTriplets: boolean): NoteOrTriplet[] {
    const measures = score.measures();
    let foundStart = false;
    const notes: NoteOrTriplet[] = [];
    all: for (const measure of measures) {
      if (measure.hasID(this.start)) foundStart = true;
      const barNotes = splitUpTriplets
        ? flattenTriplets(measure.bars()[0].notesAndTriplets())
        : measure.bars()[0].notesAndTriplets();
      for (const note of barNotes) {
        if (note.hasID(this.start)) foundStart = true;
        if (foundStart && !(note instanceof INote && note.isPreview()))
          notes.push(note);
        if (note.hasID(this.end)) break all;
      }
      if (measure.hasID(this.end)) break;
    }
    return notes;
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
    const startStaveIndex = staves.findIndex((stave) => stave.includesID(start.id));
    const endStaveIndex = staves.findIndex((stave) => stave.includesID(end.id));
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
      this.start,
      this.end,
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
