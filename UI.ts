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
    class=${isCurrentNoteInput(length) ? 'current-note-input' : null}
    onclick=${setNoteInput(length)}>
      ${length}
    </button>`;


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
    <div>
      UI
      <button onclick=${() => dispatch({ name: 'delete selected notes' })}>Delete Selected Notes</button>

      <h2>Note Input</h2>
      <label>Current note input type</label>
      ${noteInputButton(NoteLength.Semibreve)}
      ${noteInputButton(NoteLength.Minim)}
      ${noteInputButton(NoteLength.Crotchet)}
      ${noteInputButton(NoteLength.Quaver)}
      ${noteInputButton(NoteLength.SemiQuaver)}
      ${noteInputButton(NoteLength.DemiSemiQuaver)}
      ${noteInputButton(NoteLength.HemiDemiSemiQuaver)}


      <h2>Gracenote</h2>
      <label>Gracenote on selected notes</label>
      <select id="set-gracenote" onchange=${() => dispatch({ name: 'set gracenote', value: (document.getElementById('set-gracenote') as HTMLSelectElement).value })}>
        <option value="doubling">Doubling</value>
        <option value="throw-d">Throw on D</value>
        <option value="toarluath">Toarluath</value>
        <option value="grip">Grip</value>
        <option value="birl">Birl</value>
        <option value="g-gracenote-birl">G Gracenote Birl</value>
      </select>
      <button onclick=${() => dispatch({ name: 'toggle dotted' })}>
        Toggle dotted
      </button>
      <label>Zoom Level</label>
      <input id="zoom-level" type="range" min="10" max="200" step="5" oninput=${changeZoomLevel} />
    </div>
  `;
}



export default {
  render
}