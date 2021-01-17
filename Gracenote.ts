/*
  Gracenote.ts - Gracenote implementation for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { Pitch, lineGap, noteY, Svg, log } from './all';
import { svg } from 'uhtml';

type Gracenote = Pitch[];

interface InvalidGracenote {
  gracenote: Gracenote
}

function isInvalid(gracenote: Gracenote | InvalidGracenote): gracenote is InvalidGracenote {
  return (gracenote as InvalidGracenote).gracenote != null;
}
type GracenoteFn = (note: Pitch, prev: Pitch | null) => Gracenote | InvalidGracenote;

const invalidateIf = (pred: boolean, gracenote: Gracenote): Gracenote | InvalidGracenote => pred ? ({ gracenote }) : gracenote;

const gracenotes: Map<string, GracenoteFn> = new Map();


gracenotes.set('throw-d', note => invalidateIf(note !== Pitch.D, [Pitch.G,Pitch.D,Pitch.C]));
gracenotes.set('doubling', (note, prev) => {
  let init = [];
  if (note === Pitch.G || note === Pitch.A || note === Pitch.B || note === Pitch.C) {
    init = [Pitch.HG, note, Pitch.D];
  } else if (note === Pitch.D) {
    init = [Pitch.HG, note, Pitch.E];
  } else if (note === Pitch.E){
    init = [Pitch.HG, note, Pitch.F];
  } else if (note === Pitch.F) {
    init = [Pitch.HG, note, Pitch.HG];
  } else if (note === Pitch.HG) {
    // [HA, note, HA] or [HG,F] ?
    init = [Pitch.HA,note,Pitch.HA];
  } else if (note === Pitch.HA)  {
    init = [Pitch.HA, Pitch.HG];
  } else {
    return [];
  }

  if (prev === Pitch.HG && (note !== Pitch.HA && note !== Pitch.HG)) {
    init[0] = Pitch.HA;
  } else if (prev === Pitch.HA) {
    init = init.splice(1);

    if (note === Pitch.HG) init = [Pitch.HG,Pitch.F];
  }

  return init;
});
gracenotes.set('grip', note => {
  if (note === Pitch.D) {
    return [Pitch.G, Pitch.B, Pitch.G];
  } else {
    return [Pitch.G, Pitch.D, Pitch.G];
  }
})
gracenotes.set('toarluath', (note, prev) => {
  let notes = [];
  if (prev === Pitch.D) {
    notes = [Pitch.G, Pitch.B, Pitch.G, Pitch.E]
  } else {
    notes = [Pitch.G, Pitch.D, Pitch.G, Pitch.E]
  }
  if (note === Pitch.E || note === Pitch.F || note === Pitch.HG || note === Pitch.HA) {
    notes = notes.slice(0,3);
  }
  return notes;
});
gracenotes.set('birl', (note, prev) => {
  return invalidateIf(note !== Pitch.A, prev === Pitch.A ? [Pitch.G, Pitch.A, Pitch.G] : [Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
});
gracenotes.set('g-gracenote-birl', (note, prev) => {
  if (prev === Pitch.HA) {
    return invalidateIf(note !== Pitch.A, [Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  } else if (prev === Pitch.HG) {
    return invalidateIf(note !== Pitch.A, [Pitch.HA, Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  } else {
    return invalidateIf(note !== Pitch.A, [Pitch.HG, Pitch.A, Pitch.G, Pitch.A, Pitch.G]);
  }
});


interface ReactiveGracenote {
  type: 'reactive',
  name: string
}

interface SingleGracenote {
  type: 'single',
  note: Pitch,
}

interface NoGracenote {
  type: 'none'
}

export type GracenoteModel = ReactiveGracenote | SingleGracenote | NoGracenote;


const tailXOffset: number = 3;
// actually this is half of the head width
const gracenoteHeadWidth = 3.5;

function numberOfNotes(gracenote: GracenoteModel, thisNote: Pitch, previousNote: Pitch | null): number {
  const grace = notes(gracenote,thisNote,previousNote);
  if (isInvalid(grace)) {
    return grace.gracenote.length + 1;
  } else {
    return grace.length + 1;
  }
};

function notes(gracenote: GracenoteModel, thisNote: Pitch, previousNote: Pitch | null): Pitch[] | InvalidGracenote {
  if (gracenote.type === 'single') {
    return [gracenote.note];
  } else if (gracenote.type === 'reactive') {
    const notes = gracenotes.get(gracenote.name);
    if (notes) {
      return notes(thisNote,previousNote);
    }
    return [];
  } else if (gracenote.type === 'none') {
    return [];
  } else {
    // never
    return gracenote;
  }
}

function head(x: number,y: number, note: Pitch, beamY: number, isValid: boolean): Svg {
  const ledgerLeft = 5;
  const ledgerRight = 5.2;
  // todo: make ledger line the correct length
  const rotateText = "rotate(-30 " + x + " " + y + ")";
  return svg`<g class="gracenote-head">
    ${note === Pitch.HA ? svg`<line x1=${x - ledgerLeft} x2=${x + ledgerRight} y1=${y} y2=${y} stroke="black" />` : null}
    <ellipse cx=${x} cy=${y} rx=${gracenoteHeadWidth} ry="2.5" transform="${rotateText}" fill=${isValid ? "black" : "red"} pointer-events="none" />

    <line x1=${x + tailXOffset} y1=${y} x2=${x + tailXOffset} y2=${beamY} stroke="black" /> 
  </g>`;
};

const stemXOf = (x: number) => x + 3;
const stemYOf = (y: number) => y - 2;

function single(note: Pitch, x: number, staveY:number): Svg {
  const y = noteY(staveY, note);
  return svg`<g class="gracenote">
    ${head(x,y, note, y - 3 * lineGap, true)}

    <line x1=${stemXOf(x)} x2=${stemXOf(x)} y1=${stemYOf(y)} y2=${stemYOf(y) - 20} stroke="black" />

    ${[0,1,2].map(n => svg`<line x1=${stemXOf(x)} x2=${stemXOf(x) + 5} y1=${stemYOf(y) - 20 + 3 * n} y2=${stemYOf(y) - 16 + 3 * n} stroke="black" />`)}
  </g>`;
}

export interface GracenoteProps {
  thisNote: Pitch,
  previousNote: Pitch | null,
  y: number,
  x: number,
  gracenoteWidth: number,
}

function render(display: DisplayGracenote): Svg {
  const { gracenote, props } = display;
  if (gracenote.type === 'single') {
    return single(gracenote.note, props.x, props.y);
  } else if (gracenote.type === 'reactive') {
    // notes must be mapped to objects so that .indexOf will give
    // the right answer (so it will compare by reference
    // rather than by value)
    const grace = notes(gracenote, props.thisNote, props.previousNote);
    const uniqueNotes: { note: Pitch }[] = isInvalid(grace) ? grace.gracenote.map(note => ({ note })) : grace.map(note => ({ note }));

    const xOf = (noteObj: { note: Pitch}) => props.x + uniqueNotes.indexOf(noteObj) * props.gracenoteWidth + gracenoteHeadWidth;
    const y = (note: Pitch) => noteY(props.y, note);
    if (uniqueNotes.length === 1) {
      return single(uniqueNotes[0].note, xOf(uniqueNotes[0]), props.y);
    } else {
      return svg`<g class="reactive-gracenote">
        ${[0,2,4].map(i => svg`<line x1=${xOf(uniqueNotes[0]) + tailXOffset} x2=${xOf(uniqueNotes[uniqueNotes.length - 1]) + tailXOffset} y1=${props.y - 3.5 * lineGap + i} y2=${props.y - 3.5 * lineGap + i} stroke="black" />`
        )}
        ${uniqueNotes.map(
          noteObj => head(xOf(noteObj), y(noteObj.note), noteObj.note, props.y - 3.5 * lineGap, ! isInvalid(grace))
        )}
      </g>`;
    }
  } else if (gracenote.type === 'none') {
    return svg`<g class="no-gracenote"></g>`;
  } else {
    return gracenote;
  }
}

export interface DisplayGracenote {
  // TODO this is just a quick hack so it doesn't display errors
  gracenote: GracenoteModel,
  props: GracenoteProps
}

function prerender(gracenote: GracenoteModel, props: GracenoteProps): DisplayGracenote {
  return ({
    gracenote,
    props
  });
}

const init: () => GracenoteModel = () => ({
  type: 'none',
});

export default {
  prerender,
  render,
  init,
  numberOfNotes
}
