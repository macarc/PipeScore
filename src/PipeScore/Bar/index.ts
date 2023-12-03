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

import { TimeSignature } from '../TimeSignature';
import { NoteProps, Note, Triplet, lastNote } from '../Note';
import { BaseNote } from '../Note/base';
import { genId, ID, Item } from '../global/id';
import { last, nlast } from '../global/utils';
import width from '../global/width';
import { Pitch } from '../global/pitch';
import { NoteState } from '../Note/state';
import { GracenoteState } from '../Gracenote/state';
import m from 'mithril';
import { setXY } from '../global/xy';
import { addNoteToBarEnd } from '../Events/Note';
import { clickBar } from '../Events/Bar';
import { pitchBoxes } from '../PitchBoxes';
import { mouseOverPitch } from '../Events/PitchBoxes';
import { Barline } from './barline';
import {
  Playback,
  PlaybackNote,
  PlaybackObject,
  PlaybackRepeat,
} from '../Playback';
import { dispatch } from '../Controller';
import { Previews } from '../Preview/previews';
import { SavedBar } from '../SavedModel';

interface BarProps {
  x: number;
  y: number;
  width: number;
  justAddedNote: boolean;
  previousBar: Bar | null;
  shouldRenderLastBarline: boolean;
  mustNotRenderFirstBarline: boolean;
  endOfLastStave: number;
  canResize: (newWidth: number) => boolean;
  resize: (widthChange: number) => void;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

export class Bar extends Item implements Previews<Note> {
  private ts: TimeSignature;
  private _notes: (Note | Triplet)[];
  private frontBarline: Barline;
  private backBarline: Barline;

  public isAnacrusis: boolean;
  public fixedWidth: number | 'auto' = 'auto';

  private previewNote: Note | null = null;

  constructor(timeSignature = new TimeSignature(), isAnacrusis = false) {
    super(genId());
    this.ts = timeSignature.copy();
    this._notes = [];
    this.isAnacrusis = isAnacrusis;
    this.frontBarline = Barline.normal;
    this.backBarline = Barline.normal;
  }
  public static fromJSON(o: SavedBar) {
    const b = new Bar(TimeSignature.fromJSON(o.timeSignature), o.isAnacrusis);
    b._notes = o.notes.map(BaseNote.fromJSON);
    b.id = o.id;
    b.fixedWidth = o.width === undefined ? 'auto' : o.width;
    b.backBarline = Barline.fromJSON(o.backBarline);
    b.frontBarline = Barline.fromJSON(o.frontBarline);
    return b;
  }
  public toJSON(): SavedBar {
    return {
      id: this.id,
      isAnacrusis: this.isAnacrusis,
      notes: this.nonPreviewNotes().map((n) => n.toJSON()),
      backBarline: this.backBarline.toJSON(),
      frontBarline: this.frontBarline.toJSON(),
      timeSignature: this.ts.toJSON(),
      width: this.fixedWidth,
    };
  }
  // Replaces timeSignature with newTimeSignature.
  // It will change the time signature on all bars from
  // timeSignature onwards, until it hits a bar where
  // the time signature is different
  public static setTimeSignatureFrom(
    timeSignature: TimeSignature,
    newTimeSignature: TimeSignature,
    bars: Bar[]
  ) {
    let atTimeSignature = false;
    for (const bar of bars) {
      if (bar.timeSignature() === timeSignature) {
        bar.ts = newTimeSignature;
        atTimeSignature = true;
        continue;
      }
      if (atTimeSignature) {
        if (bar.ts.equals(timeSignature)) {
          bar.ts = newTimeSignature.copy();
        } else {
          break;
        }
      }
    }
  }
  public static nextBar(id: ID, bars: Bar[]) {
    for (let i = 0; i < bars.length - 1; i++) {
      if (bars[i].hasID(id)) return bars[i + 1];
      for (const note of bars[i].notesAndTriplets()) {
        if (note.hasID(id)) return bars[i + 1];
      }
    }
    return null;
  }
  public static previousBar(id: ID, bars: Bar[]) {
    for (let i = 1; i < bars.length; i++) {
      if (bars[i].hasID(id)) return bars[i - 1];
      for (const note of bars[i].notesAndTriplets()) {
        if (note.hasID(id)) return bars[i - 1];
      }
    }
    return last(bars);
  }
  public static nextNote(id: ID, bars: Bar[]) {
    let lastWasIt = false;
    for (const bar of bars) {
      if (bar.hasID(id)) lastWasIt = true;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (lastWasIt) return note;
        if (note.hasID(id)) lastWasIt = true;
      }
    }
    return null;
  }
  public static previousNote(id: ID, bars: Bar[]) {
    let prev: Note | null = null;
    for (const bar of bars) {
      if (bar.hasID(id)) return prev;
      for (const note of bar.notes()) {
        if (note.isPreview()) continue;
        if (note.hasID(id)) return prev;
        prev = note;
      }
    }
    return prev;
  }
  // Puts all the notes in the notes array into the score with the correct bar breaks
  // Does *not* change ids, e.t.c. so notes should already be unique with notes on score
  public static pasteNotes(
    notes: (Note | Triplet | 'bar-break')[],
    start: Bar,
    id: ID,
    bars: Bar[]
  ) {
    let startedPasting = false;
    let onFirst = false;

    for (const bar of bars) {
      if (bar.hasID(start.id)) {
        startedPasting = true;
        onFirst = true;
        if (bar.hasID(id)) bar._notes = [];
      }
      if (startedPasting) {
        // Only delete the current notes if we aren't on the first bar
        // since we should append to the first, then replace for the rest
        if (!onFirst) bar._notes = [];
        else onFirst = false;

        let currentPastingNote = notes.shift();
        while (currentPastingNote && currentPastingNote !== 'bar-break') {
          bar._notes.push(currentPastingNote);
          currentPastingNote = notes.shift();
        }

        if (notes.length === 0) {
          return;
        }
      }
    }
  }

  public startBarline(barline: Barline) {
    return this.frontBarline === barline;
  }
  public endBarline(barline: Barline) {
    return this.backBarline === barline;
  }
  public setPreview(note: Note, _: Note | null, noteAfter: Note | null) {
    if (noteAfter && noteAfter.isPreview()) {
      this._notes.splice(this._notes.indexOf(noteAfter), 1, note);
      this.previewNote = note;
    } else {
      if (this.previewNote) this.removePreview();
      this.previewNote = note;

      if (noteAfter) {
        let index = this._notes.indexOf(noteAfter);
        // If it is a note within a triplet, we need to do this
        if (index === -1)
          index = this._notes.findIndex((note) => note.hasID(noteAfter.id));
        this._notes.splice(index, 0, this.previewNote);
      } else this._notes.push(this.previewNote);
    }
  }
  public hasPreview() {
    return this.previewNote !== null;
  }
  public makePreviewReal(notes: Note[]) {
    this.previewNote?.makeUnPreview().makeCorrectTie(notes);
    this.previewNote = null;
  }
  public removePreview() {
    if (this.previewNote)
      this._notes.splice(this._notes.indexOf(this.previewNote), 1);
    this.previewNote = null;
  }
  public copy() {
    const b = new Bar(this.ts);
    b._notes = this._notes; //.map((n) => n.copy());
    b.frontBarline = this.frontBarline;
    b.backBarline = this.backBarline;
  }
  public numberOfNotes() {
    return this._notes.length;
  }
  private lastPitch() {
    const lastNote = this.lastNote();
    return lastNote && lastNote.pitch();
  }
  public lastNote() {
    return last(this.notes());
  }
  public previousNote(note: Note) {
    return this._notes[this._notes.indexOf(note) - 1] || null;
  }
  public notes(): Note[] {
    return Triplet.flatten(this._notes);
  }
  public insertNote(noteBefore: Note | null, note: Note) {
    let ind = noteBefore
      ? this._notes.findIndex((note) => note.hasID(noteBefore.id)) + 1
      : 0;
    if (noteBefore?.isPreview() && ind > 0) ind -= 1;

    this._notes.splice(ind, 0, note);
  }
  public deleteNote(note: Note) {
    const ind = this._notes.findIndex((n) => n.hasID(note.id));
    const noteToDelete = this._notes[ind];
    if (noteToDelete instanceof Triplet) {
      this.unmakeTriplet(noteToDelete);
      this.deleteNote(note);
    } else {
      this._notes.splice(ind, 1);
    }
  }
  public makeTriplet(first: Note, second: Note, third: Note) {
    this._notes.splice(
      this._notes.indexOf(first),
      3,
      Note.toTriplet(first, second, third)
    );
  }
  public unmakeTriplet(tr: Triplet) {
    this._notes.splice(this._notes.indexOf(tr), 1, ...tr.tripletSingleNotes());
  }
  public includesNote(id: ID) {
    for (const note of this.notesAndTriplets()) {
      if (note.hasID(id)) {
        return true;
      }
    }
    return false;
  }
  public notesAndTriplets() {
    return this._notes;
  }
  public timeSignature() {
    return this.ts;
  }
  public adjustWidth(ratio: number) {
    this.fixedWidth =
      this.fixedWidth === 'auto' ? 'auto' : this.fixedWidth * ratio;
  }
  public setBarline(position: 'start' | 'end', barline: Barline) {
    if (position === 'start') {
      this.frontBarline = barline;
    } else {
      this.backBarline = barline;
    }
  }
  public anacrusisWidth(previousBar: Bar | null) {
    if (this.fixedWidth !== 'auto') return this.fixedWidth;
    return this.minWidth(previousBar);
  }
  public minWidth(previousBar: Bar | null) {
    const previousPitch = previousBar && previousBar.lastPitch();
    const { total } = this.noteOffsets(previousPitch, this.nonPreviewNotes());
    const previousTimeSignature = previousBar && previousBar.timeSignature();
    const drawTimeSignature =
      previousTimeSignature && !this.ts.equals(previousTimeSignature);
    return Math.max(
      width.reify(total, 5) + (drawTimeSignature ? 0 : this.ts.width()),
      60
    );
  }
  // Returns an array where the nth item is the offset of the nth note
  // from the start of the bar.
  private noteOffsets(previousPitch: Pitch | null, notes: (Note | Triplet)[]) {
    const widths = notes.reduce(
      (soFar, n, index) => [
        ...soFar,
        width.add(
          nlast(soFar),
          n.width(
            index === 0 ? previousPitch : lastNote(notes[index - 1]).pitch()
          )
        ),
      ],
      [width.zero()]
    );
    return {
      widths,
      total: width.addAll(
        nlast(widths),
        Note.spacerWidth(),
        notes.length === 1 && notes[0] instanceof Note
          ? Note.invisibleWidth()
          : width.zero()
      ),
    };
  }
  private nonPreviewNotes() {
    return this.notesAndTriplets().filter((note) => note !== this.previewNote);
  }
  public play(previous: Bar | null): Playback[] {
    const start = this.frontBarline.isRepeat()
      ? [new PlaybackRepeat('start')]
      : [];
    const end = this.backBarline.isRepeat() ? [new PlaybackRepeat('end')] : [];
    const beatRatio = 1 / this.timeSignature().crotchetsPerBeat();
    return [
      ...start,
      new PlaybackObject('start', this.id),
      ...this._notes.flatMap((note, i) =>
        note
          .play(
            i === 0
              ? previous && previous.lastPitch()
              : lastNote(this._notes[i - 1]).pitch()
          )
          .map((p) =>
            p.type === 'note'
              ? new PlaybackNote(p.pitch, p.tied, p.duration * beatRatio)
              : p
          )
      ),
      new PlaybackObject('end', this.id),
      ...end,
    ];
  }

  public render(props: BarProps): m.Children {
    setXY(this.id, props.x, props.x + props.width, props.y);
    const staveY = props.y;
    const hasTimeSignature =
      props.previousBar !== null
        ? !props.previousBar.timeSignature().equals(this.ts)
        : true;
    const barWidth =
      props.width -
      (hasTimeSignature ? this.ts.width() : 0) -
      Note.width -
      this.frontBarline.width() -
      this.backBarline.width();
    const xAfterTimeSignature =
      props.x + (hasTimeSignature ? this.ts.width() : 0);
    const xAfterBarline = xAfterTimeSignature + this.frontBarline.width();

    const actualNotes = this.nonPreviewNotes();

    const groupedNotes = Note.groupNotes(actualNotes, this.ts.beatDivision());

    const previousNote = props.previousBar && props.previousBar.lastNote();
    const previousPitch = props.previousBar && props.previousBar.lastPitch();

    const beats = this.noteOffsets(previousPitch, actualNotes);
    const numberOfBeats = beats.total.extend;
    const beatWidth = (barWidth - beats.total.min) / numberOfBeats;

    const xOf = (i: number) =>
      xAfterBarline + width.reify(beats.widths[i], beatWidth);

    // There are a few special cases to deal with single notes being further
    // forward than they should be.
    const previewX = this.previewNote
      ? this.notes().length === 1
        ? xAfterBarline - barWidth / 5
        : this.notes().length === 2
        ? this.notes()[0] === this.previewNote
          ? this.isAnacrusis
            ? xAfterBarline - 10
            : xAfterBarline
          : xOf(this._notes.indexOf(this.previewNote)) + beatWidth / 2
        : xOf(this._notes.indexOf(this.previewNote)) - 2 * Note.noteHeadRadius
      : 0;

    const noteProps = (notes: Note[] | Triplet): NoteProps => {
      const firstNote = notes instanceof Triplet ? notes : notes[0];
      const index = actualNotes.indexOf(firstNote);
      return {
        x: xOf(index),
        y: staveY,
        justAddedNote: props.justAddedNote,
        boxToLast: index === 0 ? xAfterBarline : 'lastnote',
        noteWidth: beatWidth,
        previousNote:
          index === 0 ? previousNote : lastNote(actualNotes[index - 1]),
        endOfLastStave: props.endOfLastStave,
        state: props.noteState,
        gracenoteState: props.gracenoteState,
      };
    };

    // note that the pitch boxes must extend the whole width of the bar because they are used to drag notes
    // but not if placing notes, because that causes strange behaviour where clicking in-between gracenote and
    // note adds a note to the start of the bar
    return m('g[class=bar]', [
      pitchBoxes(
        xAfterBarline,
        staveY,
        barWidth,
        (pitch) => dispatch(mouseOverPitch(pitch, this)),
        (pitch, e) =>
          props.noteState.inputtingNotes
            ? dispatch(addNoteToBarEnd(pitch, this))
            : dispatch(clickBar(this, e)),
        props.justAddedNote
      ),
      ...groupedNotes.map((notes) =>
        notes instanceof Triplet
          ? notes.render(noteProps(notes))
          : Note.renderGroup(notes, noteProps(notes))
      ),
      this.previewNote
        ? Note.renderGroup([this.previewNote], {
            x: previewX,
            y: props.y,
            justAddedNote: props.justAddedNote,
            boxToLast: 'lastnote',
            noteWidth: beatWidth / 2,
            previousNote: null,
            endOfLastStave: props.endOfLastStave,
            state: props.noteState,
            gracenoteState: props.gracenoteState,
          }) || null
        : null,

      this.frontBarline.mustDraw() ||
      (hasTimeSignature && !props.mustNotRenderFirstBarline)
        ? this.frontBarline.render({
            x: xAfterTimeSignature,
            y: props.y,
            atStart: true,
            drag: () => null,
          })
        : null,
      this.backBarline.mustDraw() || props.shouldRenderLastBarline
        ? this.backBarline.render({
            x: props.x + props.width,
            y: props.y,
            atStart: false,
            drag: (x) => {
              const newWidth = x - props.x;
              // The reason we can't just do props.width here is that when
              // this is called in the future, props.width may be out of date
              const oldWidth =
                this.fixedWidth === 'auto' ? props.width : this.fixedWidth;
              if (props.canResize(newWidth)) {
                props.resize(newWidth - oldWidth);
                this.fixedWidth = newWidth;
              }
            },
          })
        : null,
      hasTimeSignature
        ? this.ts.render({
            x: props.x + 10,
            y: props.y,
          })
        : null,
    ]);
  }
}
