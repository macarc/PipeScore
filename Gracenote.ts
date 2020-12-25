import { Pitch, RestOrPitch, lineGap, noteY, Svg } from './all';
import { svg } from 'uhtml';

type GracenoteFn = (note: Pitch, prev: RestOrPitch) => Pitch[];

const gracenotes: Map<string, GracenoteFn> = new Map();

gracenotes.set('throw-d', (note: Pitch,_: RestOrPitch) => note === Pitch.D ? [Pitch.G,Pitch.D,Pitch.C] : []);
gracenotes.set('doubling', (note: Pitch,prev: RestOrPitch) => {
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
    // ['HA', note, 'HA'] or ['HG','F'] ?
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


interface ReactiveGracenote {
  type: 'reactive',
  // todo make typesafe
  name: string
}

interface SingleGracenote {
  type: 'single',
  note: Pitch,
}



const tailXOffset: number = 3;

function numberOfNotes(gracenote: GracenoteModel, thisNote: RestOrPitch, previousNote: RestOrPitch): number {
  return notes(gracenote,thisNote,previousNote).length;
};

function notes(gracenote: GracenoteModel, thisNote: RestOrPitch, previousNote: RestOrPitch): Pitch[] {
  if (thisNote === 'rest') return [];
  else if (gracenote.type === 'single') {
    return [gracenote.note];
  } else if (gracenote.type === 'reactive') {
    const notes = gracenotes.get(gracenote.name);
    if (notes) {
      return notes(thisNote,previousNote);
    }
    return [];
  } else {
    return [];
  }
}

function head(x: number,y: number, note: Pitch, beamY: number): Svg {
  const ledgerLeft = 5;
  const ledgerRight = 5.2;
  // todo: make ledger line the correct length
  const rotateText = "rotate(-30 " + x + " " + y + ")";
  return svg`<g class="gracenote-head">
    ${note === Pitch.HA ? svg`<line x1=${x - ledgerLeft} x2=${x + ledgerRight} y1=${y} y2=${y} stroke="black" />` : null}
    <ellipse cx=${x} cy=${y} rx="3.5" ry="2.5" transform="${rotateText}" fill="black" pointer-events="none" />

    <line x1=${x + tailXOffset} y1=${y} x2=${x + tailXOffset} y2=${beamY} stroke="black" /> 
  </g>`;
};

const stemXOf = (x: number) => x + 3;
const stemYOf = (y: number) => y - 2;

function single(note: Pitch, x: number, staveY:number): Svg {
  const y = noteY(staveY, note);
  return svg`<g class="gracenote">
    ${head(x,y, note, y - 3 * lineGap)}

    <line x1=${stemXOf(x)} x2=${stemXOf(x)} y1=${stemYOf(y)} y2=${stemYOf(y) - 20} stroke="black" />

    ${[0,1,2].map(n => svg`<line x1=${stemXOf(x)} x2=${stemXOf(x) + 5} y1=${stemYOf(y) - 20 + 3 * n} y2=${stemYOf(y) - 16 + 3 * n} stroke="black" />`)}
  </g>`;
}

interface GracenoteProps {
  thisNote: RestOrPitch,
  previousNote: RestOrPitch,
  y: number,
  x: number,
  gracenoteWidth: number,
}

function render(gracenote: GracenoteModel, props: GracenoteProps): Svg {
  if (gracenote.type === 'single') {
    return single(gracenote.note, props.x, props.y);
  } else if (gracenote.type === 'reactive') {
    // notes must be mapped to objects so that .indexOf will give
    // the right answer (so it will compare by reference
    // rather than by value)
    const uniqueNotes: { note: Pitch }[] = notes(gracenote, props.thisNote, props.previousNote).map(note => ({ note }));
    if (uniqueNotes.length === 1) {
      return single(uniqueNotes[0].note, props.x, props.y);
    } else {
      const xOf = (noteObj: { note: Pitch}) => props.x + uniqueNotes.indexOf(noteObj) * props.gracenoteWidth * 0.6 - props.gracenoteWidth * 0.3;
      const y = (note: Pitch) => noteY(props.y, note);
      return svg`<g class="reactive-gracenote">
        ${[0,2,4].map(i => svg`<line x1=${xOf(uniqueNotes[0]) + tailXOffset} x2=${xOf(uniqueNotes[uniqueNotes.length - 1]) + tailXOffset} y1=${props.y - 3.5 * lineGap + i} y2=${props.y - 3.5 * lineGap + i} stroke="black" />`
        )}
        ${uniqueNotes.map(
          noteObj => head(xOf(noteObj), y(noteObj.note), noteObj.note, props.y - 3.5 * lineGap)
        )}
      </g>`;
    }
  } else {
    return svg`<g></g>`;
  }
}

const init: () => GracenoteModel = () => ({
  type: 'reactive',
  name: 'doubling'
});


export type GracenoteModel = ReactiveGracenote | SingleGracenote;
export default {
  render,
  init,
  numberOfNotes
}
