/*
  UI.ts - User interface for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { h, V } from '../../render/h';

import { ScoreEvent } from '../Event';
import { NoteLength } from '../Note/model';
import { Barline } from '../Bar/model';
import { GracenoteModel } from '../Gracenote/model';

import Gracenote from '../Gracenote/functions';
import Note from '../Note/functions';

export interface UIState {
  inputLength: NoteLength | null,
  gracenoteInput: GracenoteModel | null,
  width: number,
  zoomLevel: number
}

export default function render(dispatch: (e: ScoreEvent) => void, state: UIState): V {
  const setNoteInput = (length: NoteLength) => () => dispatch({ name: 'set note input length', length })
  const isCurrentNoteInput = (length: NoteLength) => state.inputLength === null ? false : Note.equalOrDotted(state.inputLength, length);

  const noteInputButton = (length: NoteLength) => h('button',
                                                    { class: isCurrentNoteInput(length) ? 'highlighted': 'not-highlighted',
                                                      id: `note-${length}` },
                                                    { click: setNoteInput(length) });
                                                    
  const isGracenoteInput = (name: string) => state.gracenoteInput && Gracenote.isReactive(state.gracenoteInput) && (state.gracenoteInput.name === name);
  const gracenoteInput = (name: string) => h('button',
                                             { class: isGracenoteInput(name) ? 'highlighted' : 'not-highlighted',
                                             style: `background-image: url("/images/icons/gracenote-${name}.svg")` },
                                             { click: () => dispatch({ name: 'set gracenote', value: name }) });

  const changeZoomLevel = () => {
    const element = document.getElementById('zoom-level');
    if (element !== null) {
      const newZoomLevel = parseInt((element as HTMLInputElement).value, 10);
      if (! isNaN(newZoomLevel)) {
        dispatch({ name: 'change zoom level', zoomLevel: newZoomLevel });
      }
    }
  }

  return h('div', [
    h('div', { id: 'topbar', style: `width: calc(${window.innerWidth - state.width}px - 5rem)` }, [
      h('div', { id: 'note-inputs' }, [
        noteInputButton(NoteLength.Semibreve),
        noteInputButton(NoteLength.Minim),
        noteInputButton(NoteLength.Crotchet),
        noteInputButton(NoteLength.Quaver),
        noteInputButton(NoteLength.SemiQuaver),
        noteInputButton(NoteLength.DemiSemiQuaver),
        noteInputButton(NoteLength.HemiDemiSemiQuaver),
      ]),
      h('button',
        { id: 'toggle-dotted',
          class: (state.inputLength && Note.hasDot(state.inputLength)) ? 'highlighted': 'not-highlighted' },
        { click: () => dispatch({ name: 'toggle dotted' }) },
        [ '•' ]),
      h('button',
        { id: 'tie' },
        { click: () => dispatch({ name: 'tie selected notes' }) }),
      h('button',
        { id: 'triplet' },
        { click: () => dispatch({ name: 'add triplet' }) },
        [ '3' ]),
      h('button',
        { id: 'add-second-timing' },
        { click: () => dispatch({ name: 'add second timing' }) },
       [ '2nd' ]),
      h('button',
        { id: 'delete-notes', class: 'delete' },
        { click: () => dispatch({ name: 'delete selected' }) }),
      h('button',
        { id: 'undo' },
        { click: () => dispatch({ name: 'undo' }) }),
      h('button',
        { id: 'redo' },
        { click: () => dispatch({ name: 'redo' }) }),
    ]),
    h('div', { id: 'resize-ui', style: `right: ${state.width + 25}px` }, { 'mousedown': () => dispatch({ name: 'start resizing user interface' }) }),
    h('div', { id: 'sidebar', style: `width: ${state.width}px` }, [
      h('h2', [ 'Gracenote' ]),
      h('button', { class: (state.gracenoteInput && state.gracenoteInput.type === 'single') ? 'highlighted' : 'not-highlighted', style: 'background-image: url("/images/icons/single.svg")' }, { click: () => dispatch({ name: 'set gracenote', value: null }) }),
      gracenoteInput('doubling'),
      gracenoteInput('throw-d'),
      gracenoteInput('grip'),
      gracenoteInput('birl'),
      gracenoteInput('g-gracenote-birl'),
      gracenoteInput('shake'),
      gracenoteInput('toarluath'),
      gracenoteInput('crunluath'),
      gracenoteInput('edre'),
      h('button', { class: 'delete' }, { click: () => dispatch({ name: 'set gracenote', value: 'none' }) }),
      h('hr'),
      h('h2', ['Bar']),
      h('button', { class: 'add text' }, { click: () => dispatch({ name: 'add bar', before: true }) }, ['before']),
      h('button', { class: 'add text' }, { click: () => dispatch({ name: 'add bar', before: false }) }, ['after']),
      h('h3', ['Repeat']),
      h('label', [
        'Start:',
        h('button', { class: 'textual', style: 'margin-left: .5rem;' }, { click: () => dispatch({ name: 'set bar repeat', which: 'frontBarline', what: Barline.Normal }) }, ['Normal']),
        h('button', { class: 'textual' }, { click: () => dispatch({ name: 'set bar repeat', which: 'frontBarline', what: Barline.Repeat }) }, ['Repeat']),
      ]),
      h('label', { style: 'display: block' }, [
        'End: ',
        h('button', { class: 'textual', style: 'margin-left: .5rem;' }, { click: () => dispatch({ name: 'set bar repeat', which: 'backBarline', what: Barline.Normal }) }, ['Normal']),
        h('button', { class: 'textual' }, { click: () => dispatch({ name: 'set bar repeat', which: 'backBarline', what: Barline.Repeat }) }, ['Repeat']),
      ]),
      h('h3', ['Lead In']),
      h('button', { class: 'add text' }, { click: () => dispatch({ name: 'add anacrusis', before: true }) }, ['before bar']),
      h('button', { class: 'add text' }, { click: () => dispatch({ name: 'add anacrusis', before: false }) }, ['after bar']),
      h('hr'),
      h('h2', ['Stave']),
      h('button', { class: 'add text' }, { click: () => dispatch({ name: 'add stave', before: true }) }, ['before']),
      h('button', { class: 'add text' }, { click: () => dispatch({ name: 'add stave', before: false }) }, ['after']),
      h('hr'),
      h('h2', ['Text']),
      h('button', { class: 'add' }, { click: () => dispatch({ name: 'add text' }) }),
      h('button', { id: 'centre-text' }, { click: () => dispatch({ name: 'centre text' }) }, [ 'centre' ]),
      h('hr'),
      h('h2', ['Document']),
      h('button', { class: 'textual' }, ['Print']),
      h('button', { class: 'textual' }, ['Export']),
      h('button', { class: 'textual' }, ['Download']),
      h('hr'),
      h('label', ['Zoom Level']),
      h('input', { id: 'zoom-level', type: 'range', min: '10', max: '200', step: '2', value: state.zoomLevel }, { input: changeZoomLevel })
    ])
  ]);
}
