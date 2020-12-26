import { ScoreModel } from './Score';
import { NoteModel } from './Note';
import { dispatch, State } from './Controller';
import { html } from 'uhtml';



function render(state: State) {
  return html`
    <div>
      UI
      <button onclick=${() => dispatch({ name: 'delete selected notes' })}>Delete Selected Notes</button>
    </div>
  `;
}



export default {
  render
}
