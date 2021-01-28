/*
  Bar.ts - Bar (measure) implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { lineHeightOf, lineGap, Svg, Pitch, pitchToHeight, noteBoxes, noteY, ID, genId } from './all';
import { log, log2, unlog, unlog2 } from './all';
import Note, { GroupNoteModel, NoteModel, PreviousNote, lastNoteOfGroupNote, totalBeatWidth, lastNoteXOffset, numberOfNotes } from './Note';
import TimeSignature, { TimeSignatureModel, timeSignatureWidth, timeSignatureEqual } from './TimeSignature';
import { dispatch, setXY } from './Controller';


enum Barline {
  RepeatFirst, RepeatLast, Normal
}

type FrontBarline = Barline.RepeatFirst | Barline.Normal;
type BackBarline = Barline.RepeatLast | Barline.Normal;

export interface BarModel {
  timeSignature: TimeSignatureModel,
  notes: GroupNoteModel[],
  frontBarline: FrontBarline,
  backBarline: BackBarline,
  isAnacrusis: boolean,
  id: ID
}


interface BarProps {
  x: number,
  y: number,
  width: number,
  previousBar: BarModel | null,
  lastNoteX: number | null,
  shouldRenderLastBarline: boolean
}

const beatsOf = (bar: BarModel, previousNote: Pitch | null) => bar.notes
    .reduce((nums, n, index) => {
      const previous = index === 0 ? previousNote : lastNoteOfGroupNote(bar.notes[index - 1]);
      return [...nums, nums[nums.length - 1] + totalBeatWidth(n,previous || null)];
    },
    [1]);

const minimumBeatWidth = 30;

function groupNotes(bar: BarModel) {
  return bar.notes;
}

function lastNoteIndexOfBar(bar: BarModel): number {
  let lastNoteIndex = bar.notes.length - 1;
  if (numberOfNotes(bar.notes[bar.notes.length - 1]) === 0) lastNoteIndex = bar.notes.length - 2;
  return lastNoteIndex;
}

function lastNoteOfBar(bar: BarModel): Pitch | null {
  const lastGroupNote = bar.notes[lastNoteIndexOfBar(bar)] || null;
  if (lastGroupNote !== null) {
    return lastNoteOfGroupNote(lastGroupNote);
  } else {
    return null;
  }
}

function numberOfGroupNotes(bar: BarModel): number {
  return lastNoteIndexOfBar(bar) + 1;
}

export function xOffsetOfLastNote(bar: BarModel, width: number, previousBar: BarModel | null): number {
  const lastNoteIndex = lastNoteIndexOfBar(bar);
  const lastNote = lastNoteOfBar(bar);
  const previousBarLastNote = previousBar ? lastNoteOfBar(previousBar) : null;
  if (lastNote !== null) {
    const beats = beatsOf(bar, null)
    const totalNumberOfBeats = beats[beats.length - 1];
    const beatWidth = width / totalNumberOfBeats;
    return beatWidth * beats[lastNoteIndex] + lastNoteXOffset(beatWidth, bar.notes[lastNoteIndex], (numberOfGroupNotes(bar) === 1 ? previousBarLastNote : lastNoteOfGroupNote(bar.notes[lastNoteIndex - 1])) || null);
  } else {
    return 0;
  }
}

export function widthOfAnacrusis(anacrusis: BarModel, previousNote: Pitch | null): number {
  const beats = beatsOf(anacrusis, previousNote);
  const totalNumberOfBeats = Math.max(beats[beats.length - 1], 2);
  return minimumBeatWidth * totalNumberOfBeats;
}


function renderBarline(type: Barline, x: number, y: number): Svg {
  const height = lineHeightOf(4);
  const lineOffset = 6;
  const circleXOffset = 10;
  const topCircleY = y + lineHeightOf(1);
  const bottomCircleY = y + lineHeightOf(3);
  const circleRadius = 2;
  const thickLineWidth = 2.5;
  if (type === Barline.Normal) {
    return svg`
      <line x1=${x} x2=${x} y1=${y} y2=${y + height} stroke="black" />
    `;
  } else if (type === Barline.RepeatFirst) {
    return svg`<g class="barline-repeat-first">
      <rect x=${x} y=${y} width=${thickLineWidth} height=${height} fill="black" />
      <line x1=${x + lineOffset} x2=${x + lineOffset} y1=${y} y2=${y + height} stroke="black" />
      <circle cx=${x + circleXOffset} cy=${topCircleY} r=${circleRadius} fill="black" />
      <circle cx=${x + circleXOffset} cy=${bottomCircleY} r=${circleRadius} fill="black" />
    </g>`;
  } else if (type === Barline.RepeatLast) {
    return svg`<g class="barline-repeat-last">
      <rect x=${x - thickLineWidth} y=${y} width=${thickLineWidth} height=${height} fill="black" />
      <line x1=${x - lineOffset} x2=${x - lineOffset} y1=${y} y2=${y + height} stroke="black" />
      <circle cx=${x - circleXOffset} cy=${topCircleY} r=${circleRadius} fill="black" />
      <circle cx=${x - circleXOffset} cy=${bottomCircleY} r=${circleRadius} fill="black" />
    </g>`;
  } else {
    // never
    return type;
  }
}

function barlineWidth(barline: Barline) {
  return (barline === Barline.Normal ? 1 : 10);
}

function render(bar: BarModel,props: BarProps): Svg {
  setXY(bar.id, props.x, props.x + props.width, props.y);
  const staveY = props.y;
  const hasTimeSignature = props.previousBar !== null ? !(timeSignatureEqual(props.previousBar.timeSignature, bar.timeSignature)) : true;
  const width = props.width - (hasTimeSignature ? timeSignatureWidth : 0) - barlineWidth(bar.frontBarline) - barlineWidth(bar.backBarline);
  const xAfterTimeSignature = props.x + (hasTimeSignature ? timeSignatureWidth : 0);
  const xAfterBarline = xAfterTimeSignature + barlineWidth(bar.frontBarline);



  const previousWholeNote = props.previousBar ? (() => {
    const last = props.previousBar.notes[props.previousBar.notes.length - 1];
    if (numberOfNotes(last) === 0) {
      // if all the notes add up to an even number, then the final note in the bar will have 0 length
      // so in that case, return the second last note
      return props.previousBar.notes[props.previousBar.notes.length - 2];
    } else {
      return last;
    }
  })() : null;
  const previousNote = previousWholeNote ? lastNoteOfGroupNote(previousWholeNote) : null;
  const previousNoteOf = (noteIndex: number) => noteIndex === 0
    ? previousNote
    : lastNoteOfGroupNote(bar.notes[noteIndex - 1]) || null;

  const beats = beatsOf(bar, previousNote);
  
  
  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = width / totalNumberOfBeats;

  const getX = (noteIndex: number) => xAfterBarline + beatWidth * beats[noteIndex];


  function previousNoteData(index: number): PreviousNote | null {
    const lastNote = (index > 0) ? lastNoteOfGroupNote(bar.notes[index - 1]) : null;
    if (index === 0) {
      if (previousNote !== null && props.lastNoteX !== null) {
        return ({
          pitch: previousNote,
          x: props.lastNoteX,
          y: noteY(props.y, previousNote)
        });
      } else {
        return null;
      }
    } else if (lastNote !== null) {
      const noteBeforeThat = (index < 2) ? null : lastNoteOfGroupNote(bar.notes[index - 2]);
      const x = getX(index - 1) + lastNoteXOffset(beatWidth, bar.notes[index - 1], noteBeforeThat);
      return ({
        pitch: lastNote,
        x,
        y: noteY(props.y, lastNote)
      })
    } else {
      return null;
    }
  }

  const noteProps = (note: GroupNoteModel,index: number) => ({
    x: getX(index),
    y: staveY,
    noteWidth: beatWidth,
    previousNote: previousNoteData(index),
    selectedNotes: []
  });


  return svg`
    <g class="bar">
      ${noteBoxes(xAfterBarline,staveY, width, pitch => dispatch({ name: 'mouse over pitch', pitch }))}
      ${noteBoxes(xAfterBarline, staveY, beatWidth, pitch => dispatch({ name: 'mouse over pitch', pitch }), pitch => dispatch({ name: 'note added', index: 0, pitch, note: bar.notes[0] }))}
      ${bar.notes.map(
        (note,idx) => svg.for(note)`${Note.render(note,noteProps(note,idx))}`
      )}

      ${renderBarline(bar.frontBarline, xAfterTimeSignature, props.y)}
      ${((bar.backBarline !== Barline.Normal) || props.shouldRenderLastBarline) ? renderBarline(bar.backBarline, props.x + props.width, props.y) : null}
      ${hasTimeSignature ? TimeSignature.render(bar.timeSignature, { x: props.x + 10, y: props.y }) : null}
    </g>`;

}
const init = (isAnacrusis: boolean = false): BarModel => ({
  timeSignature: TimeSignature.init(),
  notes: [Note.init(),Note.init()],
  frontBarline: Barline.Normal,
  backBarline: Barline.Normal,
  isAnacrusis,
  id: genId()
})

export default {
  render,
  init,
  groupNotes
}
