/*
  UI.ts - User interface for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { Svg } from '../all';
import { NoteLength } from '../Note/model';
import { html } from 'uhtml';
import { inputLength, zoomLevel } from '../global';
import { ScoreEvent } from '../Event';

export default function render(dispatch: (e: ScoreEvent) => void): Svg {
  const setNoteInput = (length: NoteLength) => () => dispatch({ name: 'set note input length', length })
  const isCurrentNoteInput = (length: NoteLength) => inputLength === length;


  const noteInputButton = (length: NoteLength) => html`<button
    class=${`${isCurrentNoteInput(length) ? 'current-note-input' : ''} note-input`}
    id=${`note-${length}`}
    onclick=${setNoteInput(length)}>
    </button>`;

  const gracenoteInput = (name: string) => html`<button class="gracenote-input" onclick=${() => dispatch({ name: 'set gracenote', value: name })}>${name}</button>`;


  const changeZoomLevel = () => {
    const element = document.getElementById('zoom-level');
    if (element !== null) {
      const newZoomLevel = parseInt((element as HTMLInputElement).value, 10);
      if (! isNaN(newZoomLevel)) {
        dispatch({ name: 'change zoom level', zoomLevel });
      }
    }
  }

  return html`
    <div id="topbar">
      <div id="note-inputs">
        ${noteInputButton(NoteLength.Semibreve)}
        ${noteInputButton(NoteLength.Minim)}
        ${noteInputButton(NoteLength.Crotchet)}
        ${noteInputButton(NoteLength.Quaver)}
        ${noteInputButton(NoteLength.SemiQuaver)}
        ${noteInputButton(NoteLength.DemiSemiQuaver)}
        ${noteInputButton(NoteLength.HemiDemiSemiQuaver)}
      </div>
      <button id="toggle-dotted" onclick=${() => dispatch({ name: 'toggle dotted' })}>•</button>
      <button id="tie" onclick=${() => dispatch({ name: 'tie selected notes' })}></button>
      <button id="delete-notes" class="delete" onclick=${() => dispatch({ name: 'delete selected notes' })}></button>
    </div>
    <div id="sidebar">

      <h2>Gracenote</h2>
      ${gracenoteInput('doubling')}
      ${gracenoteInput('throw-d')}
      ${gracenoteInput('toarluath')}
      ${gracenoteInput('grip')}
      ${gracenoteInput('birl')}
      ${gracenoteInput('g-gracenote-birl')}
      <hr />
      <h2>Bar</h2>
      <button class="add" onclick=${() => dispatch({ name: 'add bar' })}></button>
      <button class="delete" onclick=${() => dispatch({ name: 'delete bar' })}></button>
      <hr />
      <h2>Stave</h2>
      <button class="add" onclick=${() => dispatch({ name: 'add stave' })}></button>
      <button class="delete" onclick=${() => dispatch({ name: 'delete stave' })}></button>
      <hr />
      <h2>Text</h2>
      <button class="add" onclick=${() => alert('unimplemented')}></button>
      <button class="delete" onclick=${() => alert('unimplemented')}></button>
      <button onclick=${() => alert('unimplemented')}>Centre</button>
      <h2>Second Timing</h2>
      <button class="add" onclick=${() => dispatch({ name: 'add second timing' })}></button>
      <hr />
      <h2>Document</h2>
      <button class="textual">Print</button>
      <button class="textual">Export</button>
      <button class="textual">Download</button>
      <hr />
      <label>Zoom Level</label>
      <input id="zoom-level" type="range" min="10" max="200" step="2" value=${zoomLevel} oninput=${changeZoomLevel} />
    </div>
  `;
}
