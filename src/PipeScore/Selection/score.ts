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
import { IBar } from '../Bar';
import { Bar } from '../Bar/impl';
import { IGracenote } from '../Gracenote';
import { INote, NoteOrTriplet, flattenTriplets } from '../Note';
import { IScore } from '../Score';
import { IStave } from '../Stave';
import { ID } from '../global/id';
import { Item } from '../global/id';
import { Pitch } from '../global/pitch';
import { Relative } from '../global/relativeLocation';
import { settings } from '../global/settings';
import { car, foreach, last } from '../global/utils';
import { XY, deleteXY, getXYRangeForPage, itemBefore } from '../global/xy';
import { DraggableSelection } from './dragging';

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
    const barsToDelete: [IBar, IStave][] = [];

    all: for (const stave of score.staves()) {
      for (const bar of stave.bars()) {
        if (bar.hasID(this.start)) {
          deleteBars = true;
          started = true;
        }
        for (const note of bar.notes()) {
          if (note.hasID(this.start)) started = true;
          if (started) notesToDelete.push([note, bar]);
          if (note.hasID(this.end)) break all;
        }
        if (started) barsToDelete.push([bar, stave]);
        if (bar.hasID(this.end)) break all;
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
      for (const [bar, stave] of barsToDelete) {
        stave.deleteBar(bar);
        if (stave.numberOfBars() === 0) score.deleteStave(stave);
      }
    }

    this.purgeItems([...notesToDelete.map(car), ...barsToDelete.map(car)], score);

    if (newSelection) {
      return new ScoreSelection(newSelection, newSelection, false);
    }
    return null;
  }

  lastNoteAndBar(score: IScore): { note: INote | null; bar: IBar | null } {
    const notes = this.notes(score);
    const bar = score.location(this.end)?.bar || null;
    return { note: last(notes), bar };
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

  bars(score: IScore): IBar[] {
    const allBars = score.bars();
    let foundStart = false;
    const bars: IBar[] = [];
    for (const bar of allBars) {
      if (bar.hasID(this.start)) foundStart = true;
      if (foundStart) bars.push(bar);
      if (bar.hasID(this.end)) break;
    }
    return bars;
  }

  staves(score: IScore): IStave[] {
    const allStaves = score.staves();
    let foundStart = false;
    const staves: IStave[] = [];

    for (const stave of allStaves) {
      if (stave.includesID(this.start)) foundStart = true;
      if (foundStart) staves.push(stave);
      if (stave.includesID(this.end)) break;
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

  bar(score: IScore): IBar | null {
    if (this.start === this.end) {
      for (const bar of score.bars()) {
        if (bar.id === this.start) return bar;
      }
    }
    return null;
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
      const { stave, bar } = location;
      stave.replaceBar(new Bar(bar.timeSignature(), true), bar, where);
    }
  }

  addBar(where: Relative, score: IScore) {
    const location = score.location(this.start);
    if (location) {
      const { bar, stave } = location;
      stave.replaceBar(new Bar(bar.timeSignature()), bar, where);
    }
  }

  // Extend the current selection to include the item
  extend(id: ID) {
    if (itemBefore(this.end, id)) {
      this.end = id;
    } else if (itemBefore(id, this.start)) {
      this.start = id;
    }
  }

  // If selection is:
  // - A single note, find the previous note
  // - A single bar, find the previous bar
  private selectedPrevious(score: IScore): ID | null {
    const n = this.note(score);
    const b = this.bars(score)[0] || null;
    let newSelection: ID | null = null;
    if (this.start === this.end) {
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

  // Deletes all references to the items in the array
  private purgeItems(items: Item[], score: IScore) {
    score.purgeTimings(items);
    for (const note of items) {
      deleteXY(note.id);
    }
  }

  private collectNotes(score: IScore, splitUpTriplets: boolean): NoteOrTriplet[] {
    const bars = score.bars();
    let foundStart = false;
    const notes: NoteOrTriplet[] = [];
    all: for (const bar of bars) {
      if (bar.hasID(this.start)) foundStart = true;
      const barNotes = splitUpTriplets
        ? flattenTriplets(bar.notesAndTriplets())
        : bar.notesAndTriplets();
      for (const note of barNotes) {
        if (note.hasID(this.start)) foundStart = true;
        if (foundStart && !(note instanceof INote && note.isPreview()))
          notes.push(note);
        if (note.hasID(this.end)) break all;
      }
      if (bar.hasID(this.end)) break;
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
          y:
            props.score.staveY(staves[i]) +
            staves[i].gapAsNumber() -
            settings.lineGap,
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
      props.score
    );

    if (start && end) {
      return this.renderHighlight(start, end, props);
    }

    return null;
  }
}
