/*
  Bar/view.ts - defines how to display a bar
  Copyright (C) 2020 Archie Maclean
*/
import { svg } from 'uhtml';
import { lineHeightOf } from '../global/constants';
import { noteBoxes } from '../global/noteboxes';
import { Pitch, noteY } from '../global/pitch';
import { setXY } from '../global/state';
import { Svg } from '../global/svg';
import { last, nlast, nmap } from '../global/utils';

import { NoteModel, PreviousNote } from '../Note/model';
import { BarModel, Barline } from './model';
import { Dispatch } from '../Event';

import Note from '../Note/functions';
import renderTimeSignature from '../TimeSignature/view';
import TimeSignature, { timeSignatureWidth }  from '../TimeSignature/functions';

import renderNote, { lastNoteXOffset, widthOfNote, noteHeadOffset } from '../Note/view';

interface BarProps {
  x: number,
  y: number,
  width: number,
  previousBar: BarModel | null,
  lastNoteX: number | null,
  shouldRenderLastBarline: boolean,
  dispatch: Dispatch
}

const beatsOf = (bar: BarModel, previousNote: Pitch | null): number[] => bar.notes
    .reduce((nums, n, index) => {
      const previous = (index === 0) ? previousNote : bar.notes[index - 1].pitch;
      return [...nums, nlast(nums) + widthOfNote(n,previous || null)];
    },
    [1]);


const minimumBeatWidth = 30;


export function xOffsetOfLastNote(bar: BarModel, width: number, previousBar: BarModel | null): number {
  // TODO this is probably wrong, I haven't checked it in a while
  const lastNoteIndex = bar.notes.length - 1;
  const lastNote = last(bar.notes);
  const previousBarLastNote = nmap(previousBar, n => last(n.notes));
  const previousNote = nmap(previousBarLastNote, n => n.pitch);
  if (lastNote !== null) {
    const beats = beatsOf(bar, previousNote)
    const totalNumberOfBeats = last(beats);
    if (! totalNumberOfBeats) return 0;
    const beatWidth = width / totalNumberOfBeats;
    return beatWidth * beats[lastNoteIndex];
  } else {
    return 0;
  }
}

export function widthOfAnacrusis(anacrusis: BarModel, previousNote: Pitch | null): number {
  const beats = beatsOf(anacrusis, previousNote);
  const totalNumberOfBeats = Math.max(last(beats) || 1, 2);
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
  const hasTimeSignature = props.previousBar !== null ? !(TimeSignature.equal(props.previousBar.timeSignature, bar.timeSignature)) : true;
  const width = props.width - (hasTimeSignature ? timeSignatureWidth : 0) - barlineWidth(bar.frontBarline) - barlineWidth(bar.backBarline);
  const xAfterTimeSignature = props.x + (hasTimeSignature ? timeSignatureWidth : 0);
  const xAfterBarline = xAfterTimeSignature + barlineWidth(bar.frontBarline);

  const groupedNotes = Note.groupNotes(bar.notes, TimeSignature.beatDivision(bar.timeSignature));

  const previousNote = props.previousBar ? nmap(last(props.previousBar.notes), n => n.pitch) : null;
  const beats = beatsOf(bar, previousNote);


  const totalNumberOfBeats = last(beats) || 1;
  const beatWidth = width / totalNumberOfBeats;

  const xOf = (noteIndex: number) => xAfterBarline + beatWidth * beats[noteIndex];


  function previousNoteData(groupNoteIndex: number, noteIndex: number): PreviousNote | null {
    // this function assumes that it is being passed the noteIndex corresponding to the start of the groupNoteIndex
    // enforce it somehow?

    const lastNote = (noteIndex > 0) ? bar.notes[noteIndex - 1].pitch : null;
    if (groupNoteIndex === 0) {
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
      if (noteIndex === 0) throw new Error('noteIndex === 0');
      const x =
        (noteIndex === 1)
          ? xOf(noteIndex - 1) + noteHeadOffset(beatWidth, bar.notes[noteIndex - 1], previousNote)
          : xOf(noteIndex - 1) + noteHeadOffset(beatWidth, bar.notes[noteIndex - 1], bar.notes[noteIndex - 2].pitch);
      return ({
        pitch: lastNote,
        x,
        y: noteY(props.y, lastNote)
      })
    } else {
      throw new Error('groupNoteIndex !== 0 && lastNote === null');
      return null;
    }
  }

  const noteProps = (notes: NoteModel[],index: number) => ({
    x: xOf(bar.notes.indexOf(notes[0])),
    y: staveY,
    noteWidth: beatWidth,
    previousNote: previousNoteData(index, bar.notes.indexOf(notes[0])),
    selectedNotes: [],
    dispatch: props.dispatch
  });

  // note that the noteBoxes must extend the whole width of the bar because they are used to drag notes

  // TODO this won't work if there are no notes in the bar - have a separate event for that
  return svg`
    <g class="bar">
      ${noteBoxes(xAfterBarline, staveY, width, pitch => props.dispatch({ name: 'mouse over pitch', pitch }), pitch => props.dispatch({ name: 'add note to beginning of bar', pitch, bar }))}
      ${groupedNotes.map((notes,idx) => svg.for(notes)`${renderNote(notes,noteProps(notes,idx))}`)}

      ${renderBarline(bar.frontBarline, xAfterTimeSignature, props.y)}
      ${((bar.backBarline !== Barline.Normal) || props.shouldRenderLastBarline) ? renderBarline(bar.backBarline, props.x + props.width, props.y) : null}
      ${hasTimeSignature ? renderTimeSignature(bar.timeSignature, { x: props.x + 10, y: props.y, dispatch: props.dispatch }) : null}
    </g>`;

}
