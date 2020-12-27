import { ScoreModel } from './Score';
import { log } from './all';
import { NoteModel } from './Note';
import { dispatch, State, currentNoteInputAsNumber } from './Controller';
import { html } from 'uhtml';



function render(state: State) {
  return html`
    <div>
      UI
      <button onclick=${() => dispatch({ name: 'delete selected notes' })}>Delete Selected Notes</button>

      <h2>Note Input</h2>
      <label>Current note input type</label>
      <select id="set-note-input" onchange=${() => dispatch({ name: 'set note input length', length: parseFloat((document.getElementById('set-note-input') as HTMLSelectElement).value) })}>
        <option value="1">Crotchet</value>
        <option value="0.5">Quaver</value>
        <option value="0.25">Semi-quaver</value>
        <option value="0.125">Demi-semi-quaver</value>
      </select>


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
    </div>
  `;
}



export default {
  render
}
