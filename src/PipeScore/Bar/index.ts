/*
  Define format for bar
  Copyright (C) 2021 macarc
 */
import { TimeSignature } from '../TimeSignature';
import { BaseNote, Note, NoteProps, SingleNote, Triplet } from '../Note';
import { genId, ID, Item } from '../global/id';
import { first, last, nlast, Obj } from '../global/utils';
import width from '../global/width';
import { Pitch } from '../global/pitch';
import { NoteState } from '../Note/state';
import { GracenoteState } from '../Gracenote/state';
import m from 'mithril';
import { setXY } from '../global/xy';
import { addNoteToBarEnd } from '../Controllers/Note';
import { clickBar } from '../Controllers/Bar';
import { noteBoxes } from '../global/noteboxes';
import { mouseOverPitch } from '../Controllers/Mouse';
import bl, { Barline } from './barline';
import { Previewable } from '../DemoNote/previewable';
import { dispatch } from '../Controller';

export interface BarProps {
  x: number;
  y: number;
  width: number;
  justAddedNote: boolean;
  previousBar: Bar | null;
  shouldRenderLastBarline: boolean;
  shouldRenderFirstBarline: boolean;
  endOfLastStave: number;
  resize: (x: number) => boolean;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

export class Bar extends Item implements Previewable<SingleNote> {
  protected ts: TimeSignature;
  protected notes: Note[];
  protected frontBarline: Barline;
  protected backBarline: Barline;

  public fixedWidth: number | 'auto' = 'auto';

  protected previewNote: SingleNote | null = null;

  constructor(timeSignature = new TimeSignature()) {
    super(genId());
    this.ts = timeSignature.copy();
    this.notes = [];
    this.frontBarline = 'normal';
    this.backBarline = 'normal';
  }
  public static fromJSON(o: Obj) {
    const b = o.isAnacrusis
      ? new Anacrusis(TimeSignature.fromJSON(o.timeSignature))
      : new Bar(TimeSignature.fromJSON(o.timeSignature));
    b.notes = o.notes.map(BaseNote.fromJSON);
    b.id = o.id;
    b.fixedWidth = o.width === undefined ? 'auto' : o.width;
    b.backBarline = bl.fromJSON(o.backBarline);
    b.frontBarline = bl.fromJSON(o.frontBarline);
    return b;
  }
  public toJSON() {
    return {
      id: this.id,
      isAnacrusis: this instanceof Anacrusis,
      notes: this.notes
        .filter((n) => n !== this.previewNote)
        .map((n) => n.toJSON()),
      backBarline: bl.toJSON(this.backBarline),
      frontBarline: bl.toJSON(this.frontBarline),
      timeSignature: this.ts.toJSON(),
      width: this.fixedWidth,
    };
  }
  public static setTimeSignatureFrom(
    timeSignature: TimeSignature,
    newTimeSignature: TimeSignature,
    bars: Bar[]
  ) {
    // Replaces timeSignature with newTimeSignature, and flows forward

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
    let lastWasIt = false;
    for (const bar of bars) {
      if (lastWasIt) return bar;
      if (bar.hasID(id)) {
        lastWasIt = true;
        continue;
      }
      for (const note of bar.notes) {
        if (note.hasID(id)) {
          lastWasIt = true;
          break;
        }
      }
    }
    return null;
  }
  public static previousBar(id: ID, bars: Bar[]) {
    let prev: Bar | null = null;
    for (const bar of bars) {
      if (bar.hasID(id)) return prev;
      prev = bar;
      for (const note of bar.notes) {
        if (note.hasID(id)) return prev;
      }
    }
    return prev;
  }
  public static nextNote(id: ID, bars: Bar[]) {
    let lastWasIt = false;
    for (const bar of bars) {
      if (bar.hasID(id)) lastWasIt = true;
      for (const note of bar.notes) {
        if (lastWasIt && !note.isDemo()) return note;
        if (note.hasID(id)) lastWasIt = true;
      }
    }
    return null;
  }
  public static previousNote(id: ID, bars: Bar[]) {
    let prev: Note | null = null;
    for (const bar of bars) {
      if (bar.hasID(id)) return prev;
      for (const note of bar.notes) {
        if (note.hasID(id)) return prev;
        if (!note.isDemo()) prev = note;
      }
    }
    return prev;
  }
  public static pasteNotes(
    notes: (Note | 'bar-break')[],
    start: Bar,
    id: ID,
    bars: Bar[]
  ) {
    // Puts all the notes in the notes array into the score with the correct bar breaks
    // Does *not* change ids, e.t.c. so notes should already be unique with notes on score

    let startedPasting = false;
    let onFirst = false;

    for (const bar of bars) {
      if (bar.hasID(start.id)) {
        startedPasting = true;
        onFirst = true;
        if (bar.hasID(id)) bar.notes = [];
      }
      if (startedPasting) {
        // Only delete the current notes if we aren't on the first bar
        // since we should append to the first, then replace for the rest
        if (!onFirst) bar.notes = [];
        else onFirst = false;

        let currentPastingNote = notes.shift();
        while (currentPastingNote && currentPastingNote !== 'bar-break') {
          bar.notes.push(currentPastingNote);
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
  public setPreview(noteBefore: SingleNote | null, note: SingleNote) {
    if (noteBefore && noteBefore.isDemo()) {
      this.notes.splice(this.notes.indexOf(noteBefore), 1, note);
      this.previewNote = note;
    } else {
      if (this.previewNote) this.removePreview();
      this.previewNote = note;

      if (noteBefore) {
        let index = this.notes.indexOf(noteBefore);
        // If it is a note within a triplet, we need to do this
        if (index === -1)
          index = this.notes.findIndex((note) => note.hasID(noteBefore.id));
        this.notes.splice(index, 0, this.previewNote);
      } else this.notes.push(this.previewNote);
    }
  }
  public hasPreview() {
    return this.previewNote !== null;
  }
  public makePreviewReal() {
    this.previewNote?.unDemo();
    this.previewNote = null;
  }
  public removePreview() {
    if (this.previewNote)
      this.notes.splice(this.notes.indexOf(this.previewNote), 1);
    this.previewNote = null;
  }
  public copy() {
    const b = new Bar(this.ts);
    b.notes = this.notes; //.map((n) => n.copy());
    b.frontBarline = this.frontBarline;
    b.backBarline = this.backBarline;
  }
  public numberOfNotes() {
    return this.notes.length;
  }
  public firstNote() {
    const n = first(this.notes);
    return n && n.firstSingle();
  }
  public lastPitch() {
    const lastNote = this.lastNote();
    return lastNote && lastNote.lastPitch();
  }
  public lastNote() {
    return last(this.notes);
  }
  public previousNote(note: Note) {
    return this.notes[this.notes.indexOf(note) - 1] || null;
  }
  public insertNote(noteBefore: Note | null, note: Note) {
    if (noteBefore?.isDemo()) {
      noteBefore = this.notes[this.notes.indexOf(noteBefore) - 1] || null;
    }
    const ind = noteBefore ? this.notes.indexOf(noteBefore) + 1 : 0;
    this.notes.splice(ind, 0, note);
  }
  public deleteNote(note: Note) {
    this.notes.splice(this.notes.indexOf(note), 1);
  }
  public makeTriplet(first: SingleNote, second: SingleNote, third: SingleNote) {
    this.notes.splice(
      this.notes.indexOf(first),
      3,
      SingleNote.toTriplet(first, second, third)
    );
  }
  public unmakeTriplet(tr: Triplet) {
    this.notes.splice(this.notes.indexOf(tr), 1, ...tr.tripletSingleNotes());
  }
  public location(id: ID) {
    for (const note of this.notes) {
      if (note.hasID(id)) {
        return true;
      }
    }
    return false;
  }
  // Not ecstatic about this, but it's need to loop over them in Selection.notesAndTriplets()
  // Also in allNotesAndTriplets
  public notesAndTriplets() {
    return this.notes;
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
  // Returns a parallel array to the bars notes, with how many 'beats widths' from the left that note should be
  // Returned array is guaranteed to have at least one element
  protected beats(previousPitch: Pitch | null, notes = this.notes) {
    const beats = notes.reduce(
      (nums, n, index) => [
        ...nums,
        width.add(
          nlast(nums),
          n.width(index === 0 ? previousPitch : notes[index - 1].lastPitch())
        ),
      ],
      [width.zero() /*width.init(0, 1)*/]
    );
    return [
      ...beats,
      width.addAll(
        nlast(beats),
        SingleNote.spacerWidth(),
        notes.length === 1 && notes[0] instanceof SingleNote
          ? SingleNote.invisibleWidth()
          : width.zero()
      ),
    ];
  }
  public play(previous: Bar | null) {
    return this.notes.flatMap((note, i) =>
      note.play(
        i === 0
          ? previous && previous.lastPitch()
          : this.notes[i - 1].lastPitch()
      )
    );
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
      SingleNote.width -
      bl.width(this.frontBarline) -
      bl.width(this.backBarline);
    const xAfterTimeSignature =
      props.x + (hasTimeSignature ? this.ts.width() : 0);
    const xAfterBarline = xAfterTimeSignature + bl.width(this.frontBarline);

    const actualNotes = this.notes.filter((note) => note !== this.previewNote);

    const groupedNotes = SingleNote.groupNotes(
      actualNotes,
      this.ts.beatDivision()
    );

    const previousNote = props.previousBar && props.previousBar.lastNote();
    const previousPitch = props.previousBar && props.previousBar.lastPitch();

    const beats = this.beats(previousPitch, actualNotes);
    const numberOfBeats = nlast(beats).extend;
    const beatWidth = (barWidth - nlast(beats).min) / numberOfBeats;

    // Commented out for performance - yes, it makes quite a big difference
    // if (beatWidth < 0) {
    //   console.error('bar too small');
    // }

    const xOf = (i: number) => xAfterBarline + width.reify(beats[i], beatWidth);

    // There are a few special cases to deal with single notes being further
    // forward than they should be.
    const previewX = this.previewNote
      ? this.notes.length === 1
        ? xAfterBarline - barWidth / 5
        : this.notes.length === 2
        ? this.notes[0] === this.previewNote
          ? xAfterBarline
          : xOf(this.notes.indexOf(this.previewNote)) + beatWidth / 2
        : xOf(this.notes.indexOf(this.previewNote)) -
          2 * SingleNote.noteHeadRadius
      : 0;

    const noteProps = (notes: SingleNote[] | Triplet): NoteProps => {
      const firstNote = notes instanceof Triplet ? notes : notes[0];
      const index = actualNotes.indexOf(firstNote);
      return {
        x: xOf(index),
        y: staveY,
        justAddedNote: props.justAddedNote,
        boxToLast: index === 0 ? xAfterBarline : 'lastnote',
        noteWidth: beatWidth,
        previousNote:
          this.notes[index - 1]?.lastSingle() || previousNote?.lastSingle(),
        endOfLastStave: props.endOfLastStave,
        state: props.noteState,
        gracenoteState: props.gracenoteState,
      };
    };

    // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes
    // but not if placing notes, because that causes strange behaviour where clicking in-between gracenote and
    // note adds a note to the start of the bar
    return m('g[class=bar]', [
      noteBoxes(
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
          : SingleNote.renderMultiple(notes, noteProps(notes))
      ),
      this.previewNote
        ? this.previewNote.render({
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

      bl.mustDraw(this.frontBarline) ||
      props.shouldRenderFirstBarline ||
      hasTimeSignature
        ? bl.render(this.frontBarline, {
            x: xAfterTimeSignature,
            y: props.y,
            atStart: true,
            drag: () => null,
          })
        : null,
      bl.mustDraw(this.backBarline) || props.shouldRenderLastBarline
        ? bl.render(this.backBarline, {
            x: props.x + props.width,
            y: props.y,
            atStart: false,
            drag: (x) => {
              const newWidth = x - props.x;
              if (props.resize(newWidth - props.width))
                this.fixedWidth = newWidth;
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
export class Anacrusis extends Bar {
  public width(previousBar: Bar | null) {
    if (this.fixedWidth !== 'auto') return this.fixedWidth;
    const previousPitch = previousBar && previousBar.lastPitch();
    const previousTimeSignature = previousBar && previousBar.timeSignature();
    const beats = this.beats(
      previousPitch,
      this.notes.filter((note) => note !== this.previewNote)
    );
    return Math.max(
      width.reify(nlast(beats), 5) +
        (previousTimeSignature && !this.ts.equals(previousTimeSignature)
          ? 0
          : this.ts.width()),
      60
    );
  }
}
