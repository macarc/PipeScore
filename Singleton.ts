/* Singleton implementation */
import { Svg, noteY } from './all';
import { svg } from 'uhtml';
import { hasStem, noteLengthToNumTails } from './NoteLength';
import { NoteModel, PreviousNote, NoteProps, tie, shouldTie, noteHead, noteHeadWidth } from './NoteModel';
import Gracenote, { DisplayGracenote } from './Gracenote';
import { dispatch } from './Controller';


export type SingletonModel = NoteModel;


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
  return ({
    headX,
    headY,
    stemX,
    stemY,
    note: singleton,
    previousNote: props.previousNote,
    gracenote: Gracenote.prerender(singleton.gracenote, gracenoteProps),
    tails: [...Array(numberOfTails).keys()],
    hasStem: hasStem(singleton.length),
    shouldTie: shouldTie(singleton, props.previousNote),
    onClick: (event: MouseEvent) => dispatch({ name: 'note clicked', note: singleton, event })
  });
}

export interface DisplaySingleton {
  headX: number,
  headY: number,
  stemX: number,
  stemY: number,
  hasStem: boolean,
  note: NoteModel, // TODO remove this
  previousNote: PreviousNote | null, // TODO remove this
  gracenote: DisplayGracenote,
  shouldTie: boolean,
  onClick: (event: MouseEvent) => void,
  tails: number[]
}
/*

function singleton(note: NoteModel, x: number,y: number, gracenoteProps: GracenoteProps, previousNote: PreviousNote | null, noteBoxes: () => Svg): Svg {
  // todo this is complected with stemXOf in `render`
  const stemX = x - noteHeadWidth;
  const stemY = noteY(y,note.pitch) + 30;
  const numberOfTails = noteLengthToNumTails(note.length);
};
*/

function render(display: DisplaySingleton): Svg {
  return svg`<g class="singleton">
    ${(display.shouldTie && display.previousNote) ? tie(display.headY, display.note.pitch, display.headX, display.previousNote) : null}
    ${!(display.shouldTie) ?  Gracenote.render(display.gracenote) : null}

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




export default {
  prerender,
  render,
}
