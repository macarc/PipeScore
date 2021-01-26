/*
  UI.ts - User interface for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import { ScoreModel } from './Score';
import { log } from './all';
import { NoteLength } from './NoteLength';
import { NoteModel } from './Note';
import { dispatch, State } from './Controller';
import { html } from 'uhtml';



function render(state: State) {

  const setNoteInput = (length: NoteLength) => () => dispatch({ name: 'set note input length', length })
  const isCurrentNoteInput = (length: NoteLength) => state.noteInputLength === length;


  const noteInputButton = (length: NoteLength) => html`<button
    class=${`${isCurrentNoteInput(length) ? 'current-note-input' : ''} note-input`}
    id=${`note-${length}`}
    onclick=${setNoteInput(length)}>
    </button>`;

  const gracenoteInput = (name: string) => html`<button class="gracenote-input" onclick=${() => dispatch({ name: 'set gracenote', value: name })}>${name}</button>`;


  const changeZoomLevel = () => {
    const element = document.getElementById('zoom-level');
    if (element !== null) {
      const newZoomLevel = parseInt((element as HTMLInputElement).value);
      if (! isNaN(newZoomLevel)) {
        dispatch({ name: 'change zoom level', zoomLevel: newZoomLevel });
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
      <button id="delete-notes" onclick=${() => dispatch({ name: 'delete selected notes' })}></button>
      <button id="second-timing" onclick=${() => dispatch({ name: 'add second timing' })}>Add Second Timing</button>
    </div>
    <div id="sidebar">

      <h2>Gracenote</h2>
      <label>Click to apply to current selection</label>
      ${gracenoteInput('doubling')}
      ${gracenoteInput('throw-d')}
      ${gracenoteInput('toarluath')}
      ${gracenoteInput('grip')}
      ${gracenoteInput('birl')}
      ${gracenoteInput('g-gracenote-birl')}
      <hr />
      <button onclick=${() => dispatch({ name: 'add bar' })}>
        Add Bar After
      </button>
      <button onclick=${() => dispatch({ name: 'delete bar' })}>
        Delete Bar
      </button>
      <button onclick=${() => dispatch({ name: 'add stave' })}>
        Add Stave After
      </button>
      <button onclick=${() => dispatch({ name: 'delete stave' })}>
        Delete Stave
      </button>
      <hr />
      <label>Zoom Level</label>
      <input id="zoom-level" type="range" min="10" max="200" step="2" value=${state.zoomLevel} oninput=${changeZoomLevel} />
    </div>
  `;
}



export default {
  render
}
