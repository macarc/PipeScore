/* Singleton implementation */
import { Svg, noteY } from './all';
import { svg } from 'uhtml';
import { hasStem, noteLengthToNumTails } from './NoteLength';
import { NoteModel, PreviousNote, NoteProps, shouldTie } from './NoteModel';
import { noteHead, noteHeadWidth } from './NoteHead';
import Gracenote, { DisplayGracenote } from './Gracenote';
import Tie, { DisplayTie } from './Tie';
import { dispatch } from './Controller';

/*

To do in this file:

- remove note from DisplaySingleton
  - add noteHead
- add noteBoxes

*/

/* MODEL */
export type SingletonModel = NoteModel;


/* PRERENDER */
function prerender(singleton: NoteModel, props: NoteProps): DisplaySingleton {
  const headX = props.x + Gracenote.numberOfNotes(singleton.gracenote, singleton.pitch, props.previousNote && props.previousNote.pitch) * 0.6 * props.noteWidth + props.noteWidth;
  const headY = noteY(props.y, singleton.pitch);
  const stemX = headX - noteHeadWidth;
  const stemY = headY + 30;
  const numberOfTails = noteLengthToNumTails(singleton.length);
  const gracenoteProps = {
    x: props.x,
    y: props.y,
    gracenoteWidth: props.noteWidth * 0.6,
    thisNote: singleton.pitch,
    previousNote: props.previousNote && props.previousNote.pitch
  };
  const tied = shouldTie(singleton, props.previousNote);
  return ({
    headX,
    headY,
    stemX,
    stemY,
    note: singleton,
    tie: (tied && props.previousNote) ? Tie.prerender(headX, headY, props.previousNote) : null,
    gracenote: tied ? Gracenote.prerender(singleton.gracenote, gracenoteProps) : null,
    tails: [...Array(numberOfTails).keys()],
    hasStem: hasStem(singleton.length),
    onClick: (event: MouseEvent) => dispatch({ name: 'note clicked', note: singleton, event })
  });
}

export interface DisplaySingleton {
  headX: number,
  headY: number,
  stemX: number,
  stemY: number,
  hasStem: boolean,
  note: NoteModel,
  tie: DisplayTie | null,
  gracenote: DisplayGracenote | null,
  onClick: (event: MouseEvent) => void,
  tails: number[]
}

/* RENDER */
function render(display: DisplaySingleton): Svg {
  return svg`<g class="singleton">
    ${display.tie ? Tie.render(display.tie) : null}
    ${display.gracenote ? Gracenote.render(display.gracenote) : null}

    ${noteHead(display.headX, display.headY, display.note, display.onClick)}
    ${display.hasStem ? svg`<line
      x1=${display.stemX}
      x2=${display.stemX}
      y1=${display.headY}
      y2=${display.stemY}
      stroke="black"
      />` : null}
    ${svg`<g class="tails">
      ${display.tails.map(t => svg`<line x1=${display.stemX} x2=${display.stemX + 10} y1=${display.stemY - 5 * t} y2=${display.stemY - 5 * t - 10} stroke="black" stroke-width="2" />`)}
    </g>`}

    ${/*noteBoxes()*/null}
  </g>`;
}

/* EXPORTS */
export default {
  prerender,
  render,
}
