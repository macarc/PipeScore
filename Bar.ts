/*
  Bar.ts - Bar (measure) implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { lineHeightOf, lineGap, Svg, Pitch, pitchToHeight, noteBoxes, noteY } from './all';
import { log, log2, unlog, unlog2 } from './all';
import Note, { numberOfNotes, DisplayNote } from './Note';
import {  GroupNoteModel, groupNotes, lastNoteOfGroupNote, totalBeatWidth, lastNoteXOffset } from './GroupNote';
import { NoteModel, PreviousNote, initNoteModel } from './NoteModel';
import TimeSignature, { TimeSignatureModel, timeSignatureWidth, timeSignatureEqual, DisplayTimeSignature, timeSignatureToBeatDivision } from './TimeSignature';
import { dispatch } from './Controller';


/* MODEL */
enum Barline {
  RepeatFirst, RepeatLast, Normal
}

type FrontBarline = Barline.RepeatFirst | Barline.Normal;
type BackBarline = Barline.RepeatLast | Barline.Normal;

export interface BarModel {
  timeSignature: TimeSignatureModel,
  notes: NoteModel[],
  frontBarline: FrontBarline,
  backBarline: BackBarline
}

const init: () => BarModel = () => ({
  timeSignature: TimeSignature.init(),
  notes: [],
  frontBarline: Barline.Normal,
  backBarline: Barline.Normal
})



/* FUNCTIONS */
const beatsOf = (notes: GroupNoteModel[], previousNote: Pitch | null) => notes
    .reduce((nums, n, index) => {
      const previous = index === 0 ? previousNote : lastNoteOfGroupNote(notes[index - 1]);
      return [...nums, nums[nums.length - 1] + totalBeatWidth(n,previous || null)];
    },
    [1]);

const barlineWidth = (barline: Barline) => barline === Barline.Normal ? 1 : 10;


function lastNoteIndexOf(notes: GroupNoteModel[]): number {
  let lastNoteIndex = notes.length - 1;
  if (numberOfNotes(notes[notes.length - 1]) === 0) lastNoteIndex = notes.length - 2;
  return lastNoteIndex;
}

/* PRERENDER */
interface BarProps {
  x: number,
  y: number,
  width: number,
  previousNote: PreviousNote | null,
  previousTimeSignature: TimeSignatureModel | null,
  shouldRenderLastBarline: boolean
}

function prerender(bar: BarModel, props: BarProps): DisplayBar {

  function previousNoteData(index: number): PreviousNote | null {
    const lastNote = (index > 0) ? lastNoteOfGroupNote(groupedNotes[index - 1]) : null;
    if (index === 0) {
      return props.previousNote;
    } else if (lastNote !== null) {
      const noteBeforeThat = (index < 2) ? null : lastNoteOfGroupNote(groupedNotes[index - 2]);
      return ({
        pitch: lastNote,
        x: getX(index - 1) + lastNoteXOffset(beatWidth, groupedNotes[index - 1], noteBeforeThat),
        y: noteY(props.y, lastNote)
      })
    } else {
      return null;
    }
  }

  const hasTimeSignature = props.previousTimeSignature !== null ? !(timeSignatureEqual(props.previousTimeSignature, bar.timeSignature)) : true;
  const width = props.width - (hasTimeSignature ? timeSignatureWidth : 0) - barlineWidth(bar.frontBarline) - barlineWidth(bar.backBarline);
  const xAfterTimeSignature = props.x + (hasTimeSignature ? timeSignatureWidth : 0);
  const xAfterBarline = xAfterTimeSignature + barlineWidth(bar.frontBarline);


  const groupedNotes = groupNotes(bar.notes, timeSignatureToBeatDivision(bar.timeSignature));
  const beats = beatsOf(groupedNotes, props.previousNote && props.previousNote.pitch);

  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = width / totalNumberOfBeats;

  const getX = (noteIndex: number) => xAfterBarline + beatWidth * beats[noteIndex];


  const noteProps = (note: GroupNoteModel,index: number) => ({
    x: getX(index),
    y: props.y,
    noteWidth: beatWidth,
    previousNote: previousNoteData(index),
    selectedNotes: []
  });

  const finalPrevious = previousNoteData(lastNoteIndexOf(groupedNotes) + 1);

  return ({
    y: props.y,
    barLeft: xAfterBarline,
    barRight: props.x + props.width,
    endNoteBoxWidth: beatWidth,
    mouseOverPitch: pitch => dispatch({ name: 'mouse over pitch', pitch }),
    noteAddedToEnd: pitch => dispatch({ name: 'note added', index: 0, pitch, note: groupedNotes[0] }),
    notes: groupedNotes.map((note, idx) => Note.prerender(note, noteProps(note, idx))),
    frontBarline: {
      display: true,
      type: bar.frontBarline,
      x: xAfterTimeSignature,
      y: props.y
    },
    backBarline: {
      display: (bar.backBarline !== Barline.Normal) || props.shouldRenderLastBarline,
      type: bar.backBarline,
      x: props.x + props.width,
      y: props.y
    },
    timeSignature: hasTimeSignature ? TimeSignature.prerender(bar.timeSignature, { x: props.x + 10, y: props.y }) : null,
    lastNote: finalPrevious
  });
}

/* RENDER */
export interface DisplayBar {
  y: number,
  barLeft: number,
  barRight: number,
  endNoteBoxWidth: number,
  mouseOverPitch: (pitch: Pitch) => void,
  noteAddedToEnd: (pitch: Pitch) => void,
  notes: DisplayNote[],
  frontBarline: DisplayBarline,
  backBarline: DisplayBarline,
  timeSignature: DisplayTimeSignature | null,
  lastNote: PreviousNote | null,
}

interface DisplayBarline {
  display: boolean,
  type: Barline,
  x: number,
  y: number
}

function renderBarline(display: DisplayBarline): Svg {
  if (! display.display) return svg``;
  const x = display.x;
  const y = display.y;
  const type = display.type;
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

function render(display: DisplayBar): Svg {
  return svg`
    <g class="bar">
      ${noteBoxes(display.barLeft, display.y, display.barRight - display.barLeft, display.mouseOverPitch)}
      ${noteBoxes(display.barLeft, display.y, display.endNoteBoxWidth, display.mouseOverPitch, display.noteAddedToEnd)}
      ${display.notes.map(note => svg.for(note)`${Note.render(note)}`)}

      ${renderBarline(display.frontBarline)}
      ${renderBarline(display.backBarline)}
      ${(display.timeSignature !== null) ? TimeSignature.render(display.timeSignature) : null}
    </g>`;

}

/* EXPORTS */
export default {
  prerender,
  render,
  init,
  groupNotes: (bar: BarModel) => bar.notes
}
