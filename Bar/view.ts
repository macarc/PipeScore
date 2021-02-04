/*
  Bar/view.ts - defines how to display a bar
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { lineHeightOf, Pitch, Svg, noteBoxes, noteY }  from '../all';
import renderNote, { lastNoteXOffset, totalBeatWidth } from '../Note/view';
import { PreviousNote } from '../Note/model';
import Note from '../Note/functions';
import TimeSignature from '../TimeSignature/view';
import { timeSignatureWidth, timeSignatureEqual } from '../TimeSignature/functions';

import { setXY } from '../global';
import { GroupNoteModel } from '../Note/model';
import { ScoreEvent } from '../Event';

import { BarModel, Barline } from './model';
import { lastNoteOfBar, lastNoteIndexOfBar, numberOfGroupNotes } from './functions';




interface BarProps {
  x: number,
  y: number,
  width: number,
  previousBar: BarModel | null,
  lastNoteX: number | null,
  shouldRenderLastBarline: boolean,
  dispatch: (e: ScoreEvent) => void
}

export const beatsOf = (bar: BarModel, previousNote: Pitch | null): number[] => bar.notes
    .reduce((nums, n, index) => {
      const previous = index === 0 ? previousNote : Note.lastNoteOfGroupNote(bar.notes[index - 1]);
      return [...nums, nums[nums.length - 1] + totalBeatWidth(n,previous || null)];
    },
    [1]);


const minimumBeatWidth = 30;


export function xOffsetOfLastNote(bar: BarModel, width: number, previousBar: BarModel | null): number {
  const lastNoteIndex = lastNoteIndexOfBar(bar);
  const lastNote = lastNoteOfBar(bar);
  const previousBarLastNote = previousBar ? lastNoteOfBar(previousBar) : null;
  if (lastNote !== null) {
    const beats = beatsOf(bar, null)
    const totalNumberOfBeats = beats[beats.length - 1];
    const beatWidth = width / totalNumberOfBeats;
    return beatWidth * beats[lastNoteIndex] + lastNoteXOffset(beatWidth, bar.notes[lastNoteIndex], (numberOfGroupNotes(bar) === 1 ? previousBarLastNote : Note.lastNoteOfGroupNote(bar.notes[lastNoteIndex - 1])) || null);
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

export default function render(bar: BarModel,props: BarProps): Svg {
  setXY(bar.id, props.x, props.x + props.width, props.y);
  const staveY = props.y;
  const hasTimeSignature = props.previousBar !== null ? !(timeSignatureEqual(props.previousBar.timeSignature, bar.timeSignature)) : true;
  const width = props.width - (hasTimeSignature ? timeSignatureWidth : 0) - barlineWidth(bar.frontBarline) - barlineWidth(bar.backBarline);
  const xAfterTimeSignature = props.x + (hasTimeSignature ? timeSignatureWidth : 0);
  const xAfterBarline = xAfterTimeSignature + barlineWidth(bar.frontBarline);



  const previousWholeNote = props.previousBar ? (() => {
    const last = props.previousBar.notes[props.previousBar.notes.length - 1];
    if (Note.numberOfNotes(last) === 0) {
      // if all the notes add up to an even number, then the final note in the bar will have 0 length
      // so in that case, return the second last note
      return props.previousBar.notes[props.previousBar.notes.length - 2];
    } else {
      return last;
    }
  })() : null;
  const previousNote = previousWholeNote ? Note.lastNoteOfGroupNote(previousWholeNote) : null;

  const beats = beatsOf(bar, previousNote);


  const totalNumberOfBeats = beats[beats.length - 1];
  const beatWidth = width / totalNumberOfBeats;

  const getX = (noteIndex: number) => xAfterBarline + beatWidth * beats[noteIndex];


  function previousNoteData(index: number): PreviousNote | null {
    const lastNote = (index > 0) ? Note.lastNoteOfGroupNote(bar.notes[index - 1]) : null;
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
      const noteBeforeThat = (index < 2) ? null : Note.lastNoteOfGroupNote(bar.notes[index - 2]);
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
    selectedNotes: [],
    dispatch: props.dispatch
  });


  // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes
  return svg`
    <g class="bar">
      ${noteBoxes(xAfterBarline, staveY, width, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'note added', index: 0, pitch, groupNote: bar.notes[0] }))}
      ${bar.notes.map(
        (note,idx) => svg.for(note)`${renderNote(note,noteProps(note,idx))}`
      )}

      ${renderBarline(bar.frontBarline, xAfterTimeSignature, props.y)}
      ${((bar.backBarline !== Barline.Normal) || props.shouldRenderLastBarline) ? renderBarline(bar.backBarline, props.x + props.width, props.y) : null}
      ${hasTimeSignature ? TimeSignature(bar.timeSignature, { x: props.x + 10, y: props.y, dispatch: props.dispatch }) : null}
    </g>`;

}
