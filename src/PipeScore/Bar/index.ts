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
import { Dispatch } from '../Controllers/Controller';
import { NoteState } from '../Note/state';
import { GracenoteState } from '../Gracenote/state';
import { svg, V } from '../../render/h';
import { setXY } from '../global/xy';
import { addNoteToBarEnd } from '../Controllers/Note';
import { clickBar } from '../Controllers/Bar';
import { noteBoxes } from '../global/noteboxes';
import { mouseOverPitch } from '../Controllers/Mouse';
import { Barline, NormalB } from './barline';
import { Previewable } from '../DemoNote/previewable';

export interface BarProps {
  x: number;
  y: number;
  width: number;
  previousBar: Bar | null;
  shouldRenderLastBarline: boolean;
  shouldRenderFirstBarline: boolean;
  endOfLastStave: number;
  dispatch: Dispatch;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

const minimumBeatWidth = 15;

export class Bar extends Item implements Previewable<SingleNote> {
  protected ts: TimeSignature;
  protected notes: Note[];
  protected frontBarline: Barline;
  protected backBarline: Barline;

  // TODO when saving, ensure that this is removed from the array
  // We don't want to save the preview note!
  private previewNote: SingleNote | null = null;

  constructor(timeSignature = new TimeSignature()) {
    super(genId());
    this.ts = timeSignature.copy();
    this.notes = [];
    this.frontBarline = new NormalB();
    this.backBarline = new NormalB();
  }
  public static fromJSON(o: Obj) {
    const b = o.isAnacrusis
      ? new Anacrusis(TimeSignature.fromJSON(o.timeSignature))
      : new Bar(TimeSignature.fromJSON(o.timeSignature));
    b.notes = o.notes.map(BaseNote.fromJSON);
    b.id = o.id;
    b.backBarline = Barline.fromJSON(o.backBarline);
    b.frontBarline = Barline.fromJSON(o.frontBarline);
    return b;
  }
  public toJSON() {
    return {
      id: this.id,
      isAnacrusis: this instanceof Anacrusis,
      notes: this.notes.map((n) => n.toJSON()),
      backBarline: this.backBarline.toJSON(),
      frontBarline: this.frontBarline.toJSON(),
      timeSignature: this.ts.toJSON(),
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

  public startBarline(barline: typeof Barline) {
    return this.frontBarline instanceof barline;
  }
  public endBarline(barline: typeof Barline) {
    return this.backBarline instanceof barline;
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

  public render(props: BarProps): V {
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
      this.frontBarline.width() -
      this.backBarline.width();
    const xAfterTimeSignature =
      props.x + (hasTimeSignature ? this.ts.width() : 0);
    const xAfterBarline = xAfterTimeSignature + this.frontBarline.width();

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

    if (beatWidth < 0) {
      console.error('bar too small');
    }

    const xOf = (i: number) => xAfterBarline + width.reify(beats[i], beatWidth);

    // There are a few special cases to deal with single notes being further
    // forward than they should be.
    const previewX = this.previewNote
      ? this.notes.length === 1
        ? xAfterBarline - barWidth / 4
        : this.notes.length === 2
        ? xOf(this.notes.indexOf(this.previewNote)) + beatWidth / 2
        : xOf(this.notes.indexOf(this.previewNote)) -
          2 * SingleNote.noteHeadRadius
      : 0;

    const noteProps = (notes: SingleNote[] | Triplet): NoteProps => {
      const firstNote = notes instanceof Triplet ? notes : notes[0];
      const index = actualNotes.indexOf(firstNote);
      return {
        x: xOf(index),
        y: staveY,
        boxToLast: index === 0 ? xAfterBarline : 'lastnote',
        noteWidth: beatWidth,
        previousNote:
          this.notes[index - 1]?.lastSingle() || previousNote?.lastSingle(),
        endOfLastStave: props.endOfLastStave,
        dispatch: props.dispatch,
        state: props.noteState,
        gracenoteState: props.gracenoteState,
      };
    };

    // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes
    // but not if placing notes, because that causes strange behaviour where clicking in-between gracenote and
    // note adds a note to the start of the bar
    return svg('g', { class: 'bar' }, [
      noteBoxes(
        xAfterBarline,
        staveY,
        barWidth,
        (pitch) => props.dispatch(mouseOverPitch(pitch, this)),
        (pitch, e) =>
          props.noteState.inputtingNotes
            ? props.dispatch(addNoteToBarEnd(pitch, this))
            : props.dispatch(clickBar(this, e))
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
            boxToLast: 'lastnote',
            noteWidth: beatWidth / 2,
            previousNote: null,
            endOfLastStave: props.endOfLastStave,
            state: props.noteState,
            gracenoteState: props.gracenoteState,
            dispatch: props.dispatch,
          }) || null
        : null,

      !this.frontBarline.symmetric ||
      props.shouldRenderFirstBarline ||
      hasTimeSignature
        ? this.frontBarline.render(xAfterTimeSignature, props.y, true)
        : null,
      !this.backBarline.symmetric || props.shouldRenderLastBarline
        ? this.backBarline.render(props.x + props.width, props.y, false)
        : null,
      hasTimeSignature
        ? this.ts.render({
            x: props.x + 10,
            y: props.y,
            dispatch: props.dispatch,
          })
        : null,
    ]);
  }
}
export class Anacrusis extends Bar {
  public width(previousBar: Bar | null) {
    const previousPitch = previousBar && previousBar.lastPitch();
    const previousTimeSignature = previousBar && previousBar.timeSignature();
    const beats = this.beats(previousPitch);
    const totalNumberOfBeats = Math.max(nlast(beats).extend, 2);
    return (
      minimumBeatWidth * totalNumberOfBeats +
      (previousTimeSignature && !this.ts.equals(previousTimeSignature)
        ? 0
        : this.ts.width())
    );
  }
}
