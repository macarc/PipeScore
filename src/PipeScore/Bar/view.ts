/*
  Bar/view.ts - defines how to display a bar
  Copyright (C) 2021 Archie Maclean
*/
import { svg, V } from '../../render/h';

import { lineHeightOf } from '../global/constants';
import { noteBoxes } from '../global/noteboxes';
import { Pitch, noteY } from '../global/pitch';
import { setXY, getXY } from '../global/xy';
import { last, nlast, nmap } from '../global/utils';
import width, { Width } from '../global/width';

import { NoteModel, TripletModel, PreviousNote } from '../Note/model';
import { BarModel, Barline } from './model';
import { Dispatch } from '../Controllers/Controller';
import { clickBar } from '../Controllers/Bar';
import { addNoteToBarStart } from '../Controllers/Note';
import { mouseMoveOver } from '../Controllers/Mouse';

import Note from '../Note/functions';
import renderTimeSignature from '../TimeSignature/view';
import TimeSignature, { timeSignatureWidth } from '../TimeSignature/functions';
import { TimeSignatureModel } from '../TimeSignature/model';

import { GracenoteState } from '../Gracenote/state';
import { NoteState } from '../Note/state';
import renderNote, { widthOfNote } from '../Note/view';

interface BarProps {
  x: number;
  y: number;
  width: number;
  previousBar: BarModel | null;
  shouldRenderLastBarline: boolean;
  endOfLastStave: number;
  dispatch: Dispatch;
  noteState: NoteState;
  gracenoteState: GracenoteState;
}

// Returns a parallel array to the bars notes, with how many 'beats widths' from the left that note should be
const beatsOf = (bar: BarModel, previousPitch: Pitch | null): Width[] =>
  bar.notes.reduce(
    (nums, n, index) => {
      const previous =
        index === 0 ? previousPitch : Note.pitchOf(bar.notes[index - 1]);
      return [
        ...nums,
        width.add(nlast(nums), widthOfNote(n, previous || null)),
      ];
    },
    [width.init(0, 1)]
  );

const minimumBeatWidth = 15;

export function widthOfAnacrusis(
  anacrusis: BarModel,
  previousTimeSignature: TimeSignatureModel | null,
  previousPitch: Pitch | null
): number {
  // Finds the width of the bar (assumes it is an anacrusis)

  const beats = beatsOf(anacrusis, previousPitch);
  const totalNumberOfBeats = Math.max(
    (nmap(last(beats), (b) => b.extend) || 1) + 1,
    2
  );
  return (
    minimumBeatWidth * totalNumberOfBeats +
    (previousTimeSignature &&
    !TimeSignature.equal(anacrusis.timeSignature, previousTimeSignature)
      ? 0
      : timeSignatureWidth)
  );
}

function renderBarline(
  type: Barline,
  atStart: boolean,
  x: number,
  y: number
): V {
  // Draws a barline

  const height = lineHeightOf(4);
  const lineOffset = 6;
  const circleXOffset = 10;
  const topCircleY = y + lineHeightOf(1.3);
  const bottomCircleY = y + lineHeightOf(2.7);
  const circleRadius = 2;
  const thickLineWidth = 2.5;
  if (type === Barline.Normal) {
    return svg('line', {
      x1: x,
      x2: x,
      y1: y,
      y2: y + height,
      stroke: 'black',
    });
  } else if (type === Barline.End && atStart) {
    return svg('g', { class: 'barline-end-first', 'pointer-events': 'none' }, [
      svg('rect', { x, y, width: thickLineWidth, height, fill: 'black' }),
      svg('line', {
        x1: x + lineOffset,
        x2: x + lineOffset,
        y1: y,
        y2: y + height,
        stroke: 'black',
      }),
    ]);
  } else if (type === Barline.End) {
    return svg(
      'g',
      { class: 'barline-repeat-last', 'pointer-events': 'none' },
      [
        svg('rect', {
          x: x - thickLineWidth,
          y,
          width: thickLineWidth,
          height,
          fill: 'black',
        }),
        svg('line', {
          x1: x - lineOffset,
          x2: x - lineOffset,
          y1: y,
          y2: y + height,
          stroke: 'black',
        }),
      ]
    );
  } else if (type === Barline.Repeat && atStart) {
    return svg(
      'g',
      { class: 'barline-repeat-first', 'pointer-events': 'none' },
      [
        svg('rect', { x, y, width: thickLineWidth, height, fill: 'black' }),
        svg('line', {
          x1: x + lineOffset,
          x2: x + lineOffset,
          y1: y,
          y2: y + height,
          stroke: 'black',
        }),
        svg('circle', {
          cx: x + circleXOffset,
          cy: topCircleY,
          r: circleRadius,
          fill: 'black',
        }),
        svg('circle', {
          cx: x + circleXOffset,
          cy: bottomCircleY,
          r: circleRadius,
          fill: 'black',
        }),
      ]
    );
  } else if (type === Barline.Repeat) {
    return svg(
      'g',
      { class: 'barline-repeat-last', 'pointer-events': 'none' },
      [
        svg('rect', {
          x: x - thickLineWidth,
          y,
          width: thickLineWidth,
          height,
          fill: 'black',
        }),
        svg('line', {
          x1: x - lineOffset,
          x2: x - lineOffset,
          y1: y,
          y2: y + height,
          stroke: 'black',
        }),
        svg('circle', {
          cx: x - circleXOffset,
          cy: topCircleY,
          r: circleRadius,
          fill: 'black',
        }),
        svg('circle', {
          cx: x - circleXOffset,
          cy: bottomCircleY,
          r: circleRadius,
          fill: 'black',
        }),
      ]
    );
  } else {
    // never
    return type;
  }
}

function barlineWidth(barline: Barline) {
  // Finds the width of the barline (

  return barline === Barline.Normal ? 1 : 10;
}

export default function render(bar: BarModel, props: BarProps): V {
  setXY(bar.id, props.x, props.x + props.width, props.y);
  const staveY = props.y;
  const hasTimeSignature =
    props.previousBar !== null
      ? !TimeSignature.equal(props.previousBar.timeSignature, bar.timeSignature)
      : true;
  const barWidth =
    props.width -
    (hasTimeSignature ? timeSignatureWidth : 0) -
    barlineWidth(bar.frontBarline) -
    barlineWidth(bar.backBarline);
  const xAfterTimeSignature =
    props.x + (hasTimeSignature ? timeSignatureWidth : 0);
  const xAfterBarline = xAfterTimeSignature + barlineWidth(bar.frontBarline);

  const groupedNotes = Note.groupNotes(
    bar.notes,
    TimeSignature.beatDivision(bar.timeSignature)
  );

  const previousNote = nmap(props.previousBar, (b) => last(b.notes));
  const previousPitch = props.previousBar
    ? nmap(last(props.previousBar.notes), (n) => Note.pitchOf(n))
    : null;
  const beats = beatsOf(bar, previousPitch);

  const totalNumberOfBeats = nmap(last(beats), (b) => b.extend) || 1;
  const beatWidth =
    (barWidth - (nmap(last(beats), (b) => b.min) || 0)) / totalNumberOfBeats;

  if (beatWidth < 0) {
    console.error('bar too small');
  }

  const xOf = (noteIndex: number) =>
    xAfterBarline + width.reify(beats[noteIndex], beatWidth);

  function previousNoteData(
    groupNoteIndex: number,
    noteIndex: number
  ): PreviousNote | null {
    // this function assumes that it is being passed the noteIndex corresponding to the start of the groupNoteIndex
    // enforce it somehow?

    const lastNoteModel = bar.notes[noteIndex - 1];
    const lastNote = noteIndex > 0 ? Note.pitchOf(lastNoteModel) : null;
    if (lastNoteModel && Note.isTriplet(lastNoteModel)) {
      const xy = getXY(lastNoteModel.third.id);
      return nmap(xy, (xy) => ({
        pitch: lastNoteModel.third.pitch,
        x: xy.afterX,
        y: noteY(xy.y, lastNoteModel.third.pitch),
      }));
    } else if (groupNoteIndex === 0) {
      if (previousPitch !== null && previousNote !== null) {
        if (previousNote) {
          const pitch = Note.isNoteModel(previousNote)
            ? previousNote.pitch
            : previousNote.third.pitch;
          const id = Note.isNoteModel(previousNote)
            ? previousNote.id
            : previousNote.third.id;
          const xy = getXY(id);
          return nmap(xy, (xy) => ({
            pitch,
            x: xy.afterX,
            y: noteY(xy.y, pitch),
          }));
        } else {
          return null;
        }
      } else {
        return null;
      }
    } else if (lastNote !== null) {
      const xy = getXY(lastNoteModel.id);
      return nmap(xy, (xy) => ({
        pitch: lastNote,
        x: xy.afterX,
        y: noteY(xy.y, lastNote),
      }));
    } else {
      throw new Error('groupNoteIndex !== 0 && lastNote === null');
      return null;
    }
  }

  const noteProps = (notes: NoteModel[] | TripletModel, index: number) => {
    const firstNote = Note.isTriplet(notes) ? notes : notes[0];
    return {
      x: xOf(bar.notes.indexOf(firstNote)),
      y: staveY,
      noteWidth: beatWidth,
      previousNote: previousNoteData(index, bar.notes.indexOf(firstNote)),
      selectedNotes: [],
      endOfLastStave: props.endOfLastStave,
      dispatch: props.dispatch,
      onlyNoteInBar: !bar.isAnacrusis && bar.notes.length === 1,
      state: props.noteState,
      gracenoteState: props.gracenoteState,
    };
  };

  const clickNoteBox = (pitch: Pitch, mouseEvent: MouseEvent) =>
    props.noteState.inputtingNotes
      ? props.dispatch(addNoteToBarStart(pitch, bar))
      : props.dispatch(clickBar(bar, mouseEvent));
  // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes
  // but not if placing notes, because that causes strange behaviour where clicking in-between gracenote and
  // note adds a note to the start of the bar
  return svg('g', { class: 'bar' }, [
    noteBoxes(
      xAfterBarline,
      staveY,
      props.noteState.inputtingNotes ? beatWidth : barWidth,
      (pitch) => props.dispatch(mouseMoveOver(pitch)),
      clickNoteBox
    ),
    ...groupedNotes.map((notes, idx) =>
      renderNote(notes, noteProps(notes, idx))
    ),

    renderBarline(bar.frontBarline, true, xAfterTimeSignature, props.y),
    bar.backBarline !== Barline.Normal || props.shouldRenderLastBarline
      ? renderBarline(bar.backBarline, false, props.x + props.width, props.y)
      : null,
    hasTimeSignature
      ? renderTimeSignature(bar.timeSignature, {
          x: props.x + 10,
          y: props.y,
          dispatch: props.dispatch,
        })
      : null,
  ]);
}
