import { ScoreModel } from './Score';
import { NoteModel } from './Note';
import { dispatch, State } from './Controller';
import { html } from 'uhtml';



function render(state: State) {
  return html`
    <div>
      UI
      <button onclick=${() => dispatch({ name: 'delete selected notes' })}>Delete Selected Notes</button>


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
