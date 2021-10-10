/*
  Define format for bar
  Copyright (C) 2021 Archie Maclean
 */
import { TimeSignature } from '../TimeSignature';
import { Note, SingleNote, Triplet } from '../Note';
import { genId, ID, Item } from '../global/id';
import { first, last, nlast } from '../global/utils';
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
    this.ts = timeSignature;
    this.notes = [];
    this.frontBarline = new NormalB();
    this.backBarline = new NormalB();
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

    for (const bar of bars) {
      if (bar.hasID(start.id) || startedPasting) {
        if (bar.hasID(start.id)) {
          if (bar.hasID(id)) {
            bar.notes = [
              ...bar.notes,
              ...(notes.filter((note) => note !== 'bar-break') as Note[]),
            ];
            return;
          }
        } else {
          bar.notes = [];
        }
        startedPasting = true;
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

  public setPreview(noteBefore: SingleNote | null, note: SingleNote) {
    if (noteBefore && noteBefore.isDemo()) {
      this.notes.splice(this.notes.indexOf(noteBefore), 1, note);
      this.previewNote = note;
    } else {
      if (this.previewNote) this.removePreview();
      this.previewNote = note;
      if (noteBefore)
        this.notes.splice(this.notes.indexOf(noteBefore), 0, this.previewNote);
      else this.notes.push(this.previewNote);
    }
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
    this.notes.splice(this.notes.indexOf(tr), 3, ...tr.tripletSingleNotes());
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
  protected beats(previousPitch: Pitch | null) {
    const beats = this.notes.reduce(
      (nums, n, index) => [
        ...nums,
        width.add(
          nlast(nums),
          n.width(
            index === 0 ? previousPitch : this.notes[index - 1].lastPitch()
          )
        ),
      ],
      [width.zero() /*width.init(0, 1)*/]
    );
    return [...beats, width.add(nlast(beats), SingleNote.spacerWidth())];
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
      this.frontBarline.width() -
      this.backBarline.width();
    const xAfterTimeSignature =
      props.x + (hasTimeSignature ? this.ts.width() : 0);
    const xAfterBarline = xAfterTimeSignature + this.frontBarline.width();

    const groupedNotes = SingleNote.groupNotes(
      this.notes,
      this.ts.beatDivision()
    );

    const previousNote = props.previousBar && props.previousBar.lastNote();
    const previousPitch = props.previousBar && props.previousBar.lastPitch();

    const beats = this.beats(previousPitch);

    const totalNumberOfBeats = nlast(beats).extend;
    const beatWidth = (barWidth - nlast(beats).min) / totalNumberOfBeats;

    if (beatWidth < 0) {
      console.error('bar too small');
    }

    const xOf = (i: number) => xAfterBarline + width.reify(beats[i], beatWidth);

    const noteProps = (notes: SingleNote[] | Triplet, index: number) => {
      const firstNote = notes instanceof Triplet ? notes : notes[0];
      return {
        x: xOf(this.notes.indexOf(firstNote)),
        y: staveY,
        noteWidth: beatWidth,
        previousNote: this.notes[index - 1] || previousNote,
        selectedNotes: [],
        endOfLastStave: props.endOfLastStave,
        dispatch: props.dispatch,
        onlyNoteInBar: !(this instanceof Anacrusis) && this.notes.length === 1,
        state: props.noteState,
        gracenoteState: props.gracenoteState,
      };
    };

    const clickNoteBox = (pitch: Pitch, mouseEvent: MouseEvent) =>
      props.noteState.inputtingNotes
        ? props.dispatch(addNoteToBarEnd(pitch, this))
        : props.dispatch(clickBar(this, mouseEvent));
    // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes
    // but not if placing notes, because that causes strange behaviour where clicking in-between gracenote and
    // note adds a note to the start of the bar
    return svg('g', { class: 'bar' }, [
      noteBoxes(
        xAfterBarline,
        staveY,
        barWidth,
        (pitch) => props.dispatch(mouseOverPitch(pitch, this)),
        clickNoteBox
      ),
      ...groupedNotes.map((notes, idx) =>
        notes instanceof Triplet
          ? notes.render(noteProps(notes, idx))
          : SingleNote.renderMultiple(notes, noteProps(notes, idx))
      ),

      this.frontBarline.render(xAfterTimeSignature, props.y, true),
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
