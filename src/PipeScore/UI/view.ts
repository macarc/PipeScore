/*
  UI.ts - User interface for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import { h, V, Attributes } from '../../render/h';

import { Menu } from './model';

import { help as dochelp } from '../global/docs';

import { ScoreEvent } from '../Event';
import { NoteLength } from '../Note/model';
import { Barline } from '../Bar/model';
import { GracenoteModel } from '../Gracenote/model';

import Gracenote from '../Gracenote/functions';
import Note from '../Note/functions';

export interface UIState {
  inputLength: NoteLength | null;
  gracenoteInput: GracenoteModel | null;
  currentMenu: Menu;
  docs: string | null;
  playbackBpm: number;
  zoomLevel: number;
}

export default function render(
  dispatch: (e: ScoreEvent) => void,
  state: UIState
): V {
  const setNoteInput = (length: NoteLength) => () =>
    dispatch({ name: 'set note input length', length });
  const isCurrentNoteInput = (length: NoteLength) =>
    state.inputLength === null
      ? false
      : Note.equalOrDotted(state.inputLength, length);

  const noteInputButton = (length: NoteLength) =>
    help(
      length,
      h(
        'button',
        {
          class: isCurrentNoteInput(length) ? 'highlighted' : 'not-highlighted',
          id: `note-${length}`,
        },
        { click: setNoteInput(length) }
      )
    );

  const isGracenoteInput = (name: string) =>
    state.gracenoteInput &&
    Gracenote.isReactive(state.gracenoteInput) &&
    state.gracenoteInput.name === name;
  const gracenoteInput = (name: string) =>
    help(
      name,
      h(
        'button',
        {
          class: isGracenoteInput(name) ? 'highlighted' : 'not-highlighted',
          style: `background-image: url("/images/icons/gracenote-${name}.svg")`,
        },
        { click: () => dispatch({ name: 'set gracenote', value: name }) }
      )
    );

  const changeZoomLevel = () => {
    const element = document.getElementById('zoom-level');
    if (element !== null) {
      const newZoomLevel = parseInt((element as HTMLInputElement).value, 10);
      if (!isNaN(newZoomLevel)) {
        dispatch({ name: 'change zoom level', zoomLevel: newZoomLevel });
      }
    }
  };

  const help = (s: string, v: V): V => dochelp(dispatch, s, v);

  const normalMenu = [
    h('section', [
      h('h2', ['Input Notes']),
      h('div', { class: 'section-content note-inputs' }, [
        noteInputButton(NoteLength.Semibreve),
        noteInputButton(NoteLength.Minim),
        noteInputButton(NoteLength.Crotchet),
        noteInputButton(NoteLength.Quaver),
        noteInputButton(NoteLength.SemiQuaver),
        noteInputButton(NoteLength.DemiSemiQuaver),
        noteInputButton(NoteLength.HemiDemiSemiQuaver),
      ]),
    ]),
    h('section', [
      h('h2', ['Modify Notes']),
      h('div', { class: 'section-content' }, [
        help(
          'dot',
          h(
            'button',
            {
              id: 'toggle-dotted',
              class:
                state.inputLength && Note.hasDot(state.inputLength)
                  ? 'highlighted'
                  : 'not-highlighted',
            },
            { click: () => dispatch({ name: 'toggle dot' }) },
            ['•']
          )
        ),
        help(
          'tie',
          h(
            'button',
            { id: 'tie' },
            { click: () => dispatch({ name: 'tie selected notes' }) }
          )
        ),
        help(
          'triplet',
          h(
            'button',
            { id: 'triplet' },
            { click: () => dispatch({ name: 'add triplet' }) },
            ['3']
          )
        ),
      ]),
    ]),
  ];

  const gracenoteMenu = [
    h('section', [
      h('h2', ['Add Gracenote']),
      h('div', { class: 'section-content' }, [
        help(
          'single',
          h(
            'button',
            {
              class:
                state.gracenoteInput && state.gracenoteInput.type === 'single'
                  ? 'highlighted'
                  : 'not-highlighted',
              style: 'background-image: url("/images/icons/single.svg")',
            },
            { click: () => dispatch({ name: 'set gracenote', value: null }) }
          )
        ),
        gracenoteInput('doubling'),
        gracenoteInput('throw-d'),
        gracenoteInput('grip'),
        gracenoteInput('birl'),
        gracenoteInput('g-gracenote-birl'),
        gracenoteInput('g-strike'),
        gracenoteInput('shake'),
        gracenoteInput('edre'),
        gracenoteInput('toarluath'),
        gracenoteInput('crunluath'),
      ]),
    ]),
  ];

  const addBarOrAnacrusis = (which: 'bar' | 'anacrusis') => {
    const text = which === 'bar' ? 'add bar' : 'add anacrusis';
    return [
      help(
        text,
        h(
          'button',
          { class: 'add' },
          {
            click: () =>
              dispatch({
                name: text,
                before: (() => {
                  const el = document.getElementById(`${which}-add-where`);
                  if (el && el instanceof HTMLSelectElement) {
                    return el.value === 'before';
                  } else {
                    return true;
                  }
                })(),
              }),
          }
        )
      ),
      h('select', { id: `${which}-add-where`, class: 'fit-nicely' }, [
        h('option', { name: `add-${which}`, value: 'before' }, ['before']),
        h('option', { name: `add-${which}`, value: 'after' }, ['after']),
      ]),
    ];
  };

  const barMenu = [
    h('section', [
      h('h2', ['Bar']),
      h('div', { class: 'section-content' }, addBarOrAnacrusis('bar')),
    ]),
    h('section', [
      h('h2', { style: 'display: inline' }, ['Repeat']),
      h('div', { class: 'section-content flex' }, [
        h('div', [
          h('label', ['Start:']),
          help(
            'normal barline',
            h(
              'button',
              { class: 'textual', style: 'margin-left: .5rem;' },
              {
                click: () =>
                  dispatch({
                    name: 'set bar repeat',
                    which: 'frontBarline',
                    what: Barline.Normal,
                  }),
              },
              ['Normal']
            )
          ),
          help(
            'repeat barline',
            h(
              'button',
              { class: 'textual' },
              {
                click: () =>
                  dispatch({
                    name: 'set bar repeat',
                    which: 'frontBarline',
                    what: Barline.Repeat,
                  }),
              },
              ['Repeat']
            )
          ),
          help(
            'part barline',
            h(
              'button',
              { class: 'textual' },
              {
                click: () =>
                  dispatch({
                    name: 'set bar repeat',
                    which: 'frontBarline',
                    what: Barline.End,
                  }),
              },
              ['Part']
            )
          ),
        ]),
        h('div', [
          h('label', ['End: ']),
          help(
            'normal barline',
            h(
              'button',
              { class: 'textual', style: 'margin-left: .5rem;' },
              {
                click: () =>
                  dispatch({
                    name: 'set bar repeat',
                    which: 'backBarline',
                    what: Barline.Normal,
                  }),
              },
              ['Normal']
            )
          ),
          help(
            'repeat barline',
            h(
              'button',
              { class: 'textual' },
              {
                click: () =>
                  dispatch({
                    name: 'set bar repeat',
                    which: 'backBarline',
                    what: Barline.Repeat,
                  }),
              },
              ['Repeat']
            )
          ),
          help(
            'part barline',
            h(
              'button',
              { class: 'textual' },
              {
                click: () =>
                  dispatch({
                    name: 'set bar repeat',
                    which: 'backBarline',
                    what: Barline.End,
                  }),
              },
              ['Part']
            )
          ),
        ]),
      ]),
    ]),
    h('section', [
      h('h2', ['Lead In']),
      h('div', { class: 'section-content' }, addBarOrAnacrusis('anacrusis')),
    ]),
    h('section', [
      h('h2', ['Time Signature']),
      h('div', { class: 'section-content' }, [
        help(
          'edit bar time signature',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch({ name: 'edit bar time signature' }) },
            ['Edit Time Signature']
          )
        ),
      ]),
    ]),
    h('section', [
      h('h2', ['Second Timing']),
      h('div', { class: 'section-content' }, [
        help(
          'second timing',
          h(
            'button',
            { id: 'add-second-timing' },
            { click: () => dispatch({ name: 'add second timing' }) },
            ['1st/ 2nd']
          )
        ),
      ]),
    ]),
  ];

  const staveMenu = [
    h('section', [
      h('h2', ['Stave']),
      h('div', { class: 'section-content' }, [
        help(
          'add stave before',
          h(
            'button',
            { class: 'add text' },
            { click: () => dispatch({ name: 'add stave', before: true }) },
            ['before']
          )
        ),
        help(
          'add stave after',
          h(
            'button',
            { class: 'add text' },
            { click: () => dispatch({ name: 'add stave', before: false }) },
            ['after']
          )
        ),
      ]),
    ]),
  ];

  const textMenu = [
    h('section', [
      h('h2', ['Text']),
      h('div', { class: 'section-content' }, [
        help(
          'add text',
          h(
            'button',
            { class: 'add' },
            { click: () => dispatch({ name: 'add text' }) }
          )
        ),
        help(
          'centre text',
          h(
            'button',
            { class: 'double-width text' },
            { click: () => dispatch({ name: 'centre text' }) },
            ['Centre text']
          )
        ),
      ]),
    ]),
  ];

  const playBackMenu = [
    h('section', [
      h('h2', ['Playback']),
      h('div', { class: 'section-content' }, [
        help(
          'play',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch({ name: 'start playback' }) },
            ['Play']
          )
        ),
        help(
          'stop',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch({ name: 'stop playback' }) },
            ['Stop']
          )
        ),
        help(
          'playback speed',
          h('label', [
            'Playback speed:',
            h(
              'input',
              {
                type: 'range',
                min: '30',
                max: '200',
                step: '1',
                value: state.playbackBpm,
              },
              {
                input: (e) =>
                  dispatch({
                    name: 'set playback bpm',
                    bpm: parseInt((e.target as HTMLInputElement).value),
                  }),
              }
            ),
          ])
        ),
      ]),
    ]),
  ];

  const documentMenu = [
    h('section', [
      h('h2', ['Document']),
      h('div', { class: 'section-content' }, [
        help(
          'print',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch({ name: 'print' }) },
            ['Print']
          )
        ),
        help('download', h('button', { class: 'textual' }, ['Download'])),
        help(
          'landscape',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch({ name: 'toggle landscape' }) },
            ['Toggle landscape']
          )
        ),
      ]),
    ]),
    h('section', [
      h('h2', ['View']),
      h('div', { class: 'section-content' }, [
        h('label', ['Zoom']),
        help(
          'zoom',
          h(
            'input',
            {
              id: 'zoom-level',
              type: 'range',
              min: '10',
              max: '200',
              step: '2',
              value: state.zoomLevel,
            },
            { input: changeZoomLevel }
          )
        ),
        h('label', ['Disable Help']),
        help(
          'disable help',
          h(
            'input',
            { type: 'checkbox' },
            { click: () => dispatch({ name: 'toggle doc' }) }
          )
        ),
      ]),
    ]),
  ];

  const menuMap: Record<Menu, V[]> = {
    normal: normalMenu,
    gracenote: gracenoteMenu,
    bar: barMenu,
    stave: staveMenu,
    text: textMenu,
    playback: playBackMenu,
    document: documentMenu,
  };

  const menuClass = (s: Menu): Attributes =>
    s === state.currentMenu ? { class: 'selected' } : {};

  return h('div', [
    h('div', { id: 'menu' }, [
      help(
        'Return to Scores page',
        h('button', [h('a', { href: '/scores' }, ['Home'])])
      ),
      h(
        'button',
        menuClass('normal'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'normal' }) },
        ['Note']
      ),
      h(
        'button',
        menuClass('gracenote'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'gracenote' }) },
        ['Gracenote']
      ),
      h(
        'button',
        menuClass('bar'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'bar' }) },
        ['Bar']
      ),
      h(
        'button',
        menuClass('stave'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'stave' }) },
        ['Stave']
      ),
      h(
        'button',
        menuClass('text'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'text' }) },
        ['Text']
      ),
      h(
        'button',
        menuClass('playback'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'playback' }) },
        ['Playback']
      ),
      h(
        'button',
        menuClass('document'),
        { mousedown: () => dispatch({ name: 'set menu', menu: 'document' }) },
        ['Document']
      ),
    ]),
    h('div', { id: 'topbar' }, [
      h('div', { id: 'topbar-main' }, menuMap[state.currentMenu]),
      h('section', { id: 'general-commands' }, [
        h('h2', ['General Commands']),
        h('div', { class: 'section-content' }, [
          help(
            'delete',
            h(
              'button',
              { id: 'delete-notes', class: 'delete' },
              { click: () => dispatch({ name: 'delete selection' }) }
            )
          ),
          help(
            'copy',
            h(
              'button',
              { id: 'copy' },
              { click: () => dispatch({ name: 'copy' }) }
            )
          ),
          help(
            'paste',
            h(
              'button',
              { id: 'paste' },
              { click: () => dispatch({ name: 'paste' }) }
            )
          ),
          help(
            'undo',
            h(
              'button',
              { id: 'undo' },
              { click: () => dispatch({ name: 'undo' }) }
            )
          ),
          help(
            'redo',
            h(
              'button',
              { id: 'redo' },
              { click: () => dispatch({ name: 'redo' }) }
            )
          ),
        ]),
      ]),
    ]),
    state.docs ? h('div', { id: 'doc' }, [state.docs]) : null,
  ]);
}
