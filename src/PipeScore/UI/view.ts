/*
  Draw user interface (bar at top with buttons)
  Copyright (C) 2021 macarc
*/
import { Menu } from './model';
import { h, V, Attributes, svg } from '../../render/h';
import { Dispatch } from '../Controllers/Controller';
import {
  addTriplet,
  tieSelectedNotes,
  toggleDot,
  copy,
  paste,
  setInputLength,
} from '../Controllers/Note';
import {
  addAnacrusis,
  addBar,
  setBarRepeat,
  editBarTimeSignature,
} from '../Controllers/Bar';
import {
  setMenu,
  undo,
  redo,
  print,
  changeZoomLevel,
  changeSetting,
  addPage,
  removePage,
  landscape,
  portrait,
  setPageNumberVisibility,
} from '../Controllers/Misc';
import { addSecondTiming, addSingleTiming } from '../Controllers/SecondTiming';
import { deleteSelection } from '../Controllers/Mouse';
import { setGracenoteOnSelectedNotes } from '../Controllers/Gracenote';
import { toggleDoc } from '../Controllers/Doc';
import {
  startPlayback,
  stopPlayback,
  setPlaybackBpm,
} from '../Controllers/Playback';
import { centreText, addText } from '../Controllers/Text';
import { addStave } from '../Controllers/Stave';
import { help as dochelp } from '../global/docs';
import { dotted, NoteLength, sameNoteLengthName } from '../Note/notelength';
import { Barline, EndB, NormalB, RepeatB } from '../Bar/barline';
import { Demo, DemoGracenote, DemoNote, DemoReactive } from '../DemoNote';
import { Settings, settings } from '../global/settings';
import { capitalise } from '../global/utils';
import { Bar } from '../Bar';
import { Gracenote, ReactiveGracenote, SingleGracenote } from '../Gracenote';
import { Note } from '../Note';

export interface UIState {
  loggedIn: boolean;
  selectedGracenote: Gracenote | null;
  selectedNote: Note | null;
  selectedBar: Bar | null;
  showingPageNumbers: boolean;
  demo: Demo | null;
  isLandscape: boolean;
  currentMenu: Menu;
  docs: string | null;
  playbackBpm: number;
  zoomLevel: number;
}

export default function render(dispatch: Dispatch, state: UIState): V {
  const isCurrentNoteInput = (length: NoteLength) =>
    state.demo instanceof DemoNote
      ? sameNoteLengthName(state.demo.length(), length)
      : false;

  const noteInputButton = (length: NoteLength) =>
    help(
      length,
      h(
        'button',
        {
          class:
            isCurrentNoteInput(length) ||
            (state.selectedNote && state.selectedNote.isLength(length))
              ? 'highlighted'
              : 'not-highlighted',
          id: `note-${length}`,
        },
        { click: () => dispatch(setInputLength(length)) }
      )
    );

  const isGracenoteInput = (name: string) =>
    state.demo instanceof DemoReactive && state.demo.isInputting(name);

  const isSelectedGracenote = (name: string) =>
    state.selectedGracenote instanceof ReactiveGracenote &&
    state.selectedGracenote.name() === name;

  const gracenoteInput = (name: string) =>
    help(
      name,
      h(
        'button',
        {
          class:
            isGracenoteInput(name) || isSelectedGracenote(name)
              ? 'highlighted'
              : 'not-highlighted',
          style: `background-image: url("./images/icons/gracenote-${name}.svg")`,
        },
        { click: () => dispatch(setGracenoteOnSelectedNotes(name)) }
      )
    );

  const inputZoomLevel = (e: Event) => {
    const element = e.target;
    if (element instanceof HTMLInputElement) {
      const newZoomLevel = parseInt(element.value, 10);
      if (!isNaN(newZoomLevel)) {
        dispatch(changeZoomLevel(newZoomLevel));
      }
    }
  };

  const help = (s: string, v: V): V => dochelp(dispatch, s, v);

  const noteMenu = [
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
                state.demo instanceof DemoNote && dotted(state.demo.length())
                  ? 'highlighted'
                  : 'not-highlighted',
            },
            { click: () => dispatch(toggleDot()) },
            ['•']
          )
        ),
        help(
          'tie',
          h(
            'button',
            { id: 'tie' },
            { click: () => dispatch(tieSelectedNotes()) }
          )
        ),
        help(
          'triplet',
          h(
            'button',
            { id: 'triplet' },
            { click: () => dispatch(addTriplet()) }
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
                state.demo instanceof DemoGracenote ||
                state.selectedGracenote instanceof SingleGracenote
                  ? 'highlighted'
                  : 'not-highlighted',
              style: 'background-image: url("./images/icons/single.svg")',
            },
            { click: () => dispatch(setGracenoteOnSelectedNotes(null)) }
          )
        ),
        gracenoteInput('doubling'),
        gracenoteInput('half-doubling'),
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
    const event = which === 'bar' ? addBar : addAnacrusis;
    return [
      help(
        which === 'bar' ? 'add bar' : 'add anacrusis',
        h(
          'button',
          { class: 'add' },
          {
            click: () =>
              dispatch(
                event(
                  (() => {
                    const el = document.getElementById(`${which}-add-where`);
                    if (el && el instanceof HTMLSelectElement) {
                      return el.value === 'before';
                    } else {
                      return true;
                    }
                  })()
                )
              ),
          }
        )
      ),
      h('select', { id: `${which}-add-where`, class: 'fit-nicely' }, [
        h('option', { name: `add-${which}`, value: 'before' }, ['before']),
        h('option', { name: `add-${which}`, value: 'after' }, ['after']),
      ]),
    ];
  };

  const startBarClass = (type: typeof Barline) =>
    'textual' +
    (state.selectedBar && state.selectedBar.startBarline(type)
      ? ' highlighted'
      : '');
  const endBarClass = (type: typeof Barline) =>
    'textual' +
    (state.selectedBar && state.selectedBar.endBarline(type)
      ? ' highlighted'
      : '');

  const barMenu = [
    h('section', [
      h('h2', ['Bar']),
      h('div', { class: 'section-content' }, addBarOrAnacrusis('bar')),
    ]),
    h('section', [
      h('h2', { style: 'display: inline' }, ['Bar lines']),
      h('div', { class: 'section-content flex' }, [
        h('div', [
          h('label', ['Start:']),
          help(
            'normal barline',
            h(
              'button',
              { class: startBarClass(NormalB), style: 'margin-left: .5rem;' },
              {
                click: () => dispatch(setBarRepeat('start', new NormalB())),
              },
              ['Normal']
            )
          ),
          help(
            'repeat barline',
            h(
              'button',
              { class: startBarClass(RepeatB) },
              {
                click: () => dispatch(setBarRepeat('start', new RepeatB())),
              },
              ['Repeat']
            )
          ),
          help(
            'part barline',
            h(
              'button',
              { class: startBarClass(EndB) },
              {
                click: () => dispatch(setBarRepeat('start', new EndB())),
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
              { class: endBarClass(NormalB), style: 'margin-left: .5rem;' },
              {
                click: () => dispatch(setBarRepeat('end', new NormalB())),
              },
              ['Normal']
            )
          ),
          help(
            'repeat barline',
            h(
              'button',
              { class: endBarClass(RepeatB) },
              {
                click: () => dispatch(setBarRepeat('end', new RepeatB())),
              },
              ['Repeat']
            )
          ),
          help(
            'part barline',
            h(
              'button',
              { class: endBarClass(EndB) },
              {
                click: () => dispatch(setBarRepeat('end', new EndB())),
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
            { click: () => dispatch(editBarTimeSignature()) },
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
            { click: () => dispatch(addSecondTiming()) },
            ['1st/ 2nd']
          )
        ),
        help(
          'single timing',
          h(
            'button',
            { id: 'add-second-timing' },
            { click: () => dispatch(addSingleTiming()) },
            ['2nd']
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
            { click: () => dispatch(addStave(true)) },
            ['before']
          )
        ),
        help(
          'add stave after',
          h(
            'button',
            { class: 'add text' },
            { click: () => dispatch(addStave(false)) },
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
          h('button', { class: 'add' }, { click: () => dispatch(addText()) })
        ),
        help(
          'centre text',
          h(
            'button',
            { class: 'double-width text' },
            { click: () => dispatch(centreText()) },
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
            { click: () => dispatch(startPlayback()) },
            ['Play']
          )
        ),
        help(
          'stop',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch(stopPlayback()) },
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
                  dispatch(
                    setPlaybackBpm(
                      parseInt((e.target as HTMLInputElement).value)
                    )
                  ),
              }
            ),
          ])
        ),
      ]),
    ]),
  ];

  const setting = <T extends keyof Settings>(property: T, name: string) => [
    h('label', [name]),
    h(
      'input',
      { type: 'number', value: settings[property].toString() },
      {
        input: (e) =>
          dispatch(changeSetting(property, e.target as HTMLInputElement)),
      }
    ),
  ];
  const documentMenu = [
    h('section', [
      h('h2', ['Pages']),
      h('div', { class: 'section-content' }, [
        help(
          'add-page',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch(addPage()) },
            ['Add']
          )
        ),
        help(
          'remove-page',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch(removePage()) },
            ['Remove']
          )
        ),
      ]),
    ]),
    h('section', [
      h('h2', ['Orientation']),
      h('div', { class: 'section-content' }, [
        help(
          'landscape',
          h(
            'button',
            { class: 'textual' + (state.isLandscape ? ' highlighted' : '') },
            { click: () => dispatch(landscape()) },
            ['Landscape']
          )
        ),
        help(
          'portrait',
          h(
            'button',
            { class: 'textual' + (state.isLandscape ? '' : ' highlighted') },
            { click: () => dispatch(portrait()) },
            ['Portrait']
          )
        ),
      ]),
    ]),
    h('section', [
      h('h2', ['Options']),
      h('div', { class: 'section-content' }, [
        help(
          'page numbers',
          h('label', [
            'Show page numbers: ',
            h(
              'input',
              { type: 'checkbox', checked: state.showingPageNumbers },
              {
                click: (e) =>
                  dispatch(
                    setPageNumberVisibility(e.target as HTMLInputElement)
                  ),
              }
            ),
          ])
        ),
      ]),
    ]),
    h('section', [
      h('h2', ['Export']),
      h('div', { class: 'section-content' }, [
        help(
          'print',
          h(
            'button',
            { class: 'textual' },
            { click: () => dispatch(print()) },
            ['Print (to PDF, or printer)']
          )
        ),
      ]),
    ]),
  ];
  const settingsMenu = [
    h('section', [
      h('h2', ['Settings']),
      h('div', { class: 'section-content' }, [
        ...setting('lineGap', 'Gap between lines'),
        ...setting('topOffset', 'Gap at top of page'),
        ...setting('margin', 'Margin'),
        ...setting('staveGap', 'Gap between staves'),
      ]),
    ]),
    h('section', [
      h('h2', ['View']),
      h('div', { class: 'section-content' }, [
        h('label', ['Disable Help']),
        help(
          'disable help',
          h(
            'input',
            { type: 'checkbox' },
            { click: () => dispatch(toggleDoc()) }
          )
        ),
      ]),
    ]),
  ];

  const menuMap: Record<Menu, V[]> = {
    note: noteMenu,
    gracenote: gracenoteMenu,
    bar: barMenu,
    stave: staveMenu,
    text: textMenu,
    settings: settingsMenu,
    playback: playBackMenu,
    document: documentMenu,
  };

  const menuClass = (s: Menu): Attributes =>
    s === state.currentMenu ? { class: 'selected' } : {};

  const menuHead = (name: Menu) =>
    h('button', menuClass(name), { mousedown: () => dispatch(setMenu(name)) }, [
      capitalise(name),
    ]);
  return h('div', [
    h('div', { id: 'ui' }, [
      h('div', { id: 'menu' }, [
        help(
          'Return to Scores page',
          h('button', [h('a', { href: '/scores' }, ['Home'])])
        ),
        menuHead('note'),
        menuHead('gracenote'),
        menuHead('bar'),
        menuHead('stave'),
        menuHead('text'),
        menuHead('playback'),
        menuHead('document'),
        menuHead('settings'),
      ]),
      h('div', { id: 'topbar' }, [
        h('div', { id: 'topbar-main' }, menuMap[state.currentMenu]),
        h('section', { id: 'general-commands' }, [
          h('h2', ['General Commands']),
          h('div', { class: 'section-content flex' }, [
            h('div', [
              help(
                'delete',
                h(
                  'button',
                  { id: 'delete-notes', class: 'delete' },
                  { click: () => dispatch(deleteSelection()) }
                )
              ),
              help(
                'copy',
                h('button', { id: 'copy' }, { click: () => dispatch(copy()) })
              ),
              help(
                'paste',
                h('button', { id: 'paste' }, { click: () => dispatch(paste()) })
              ),
              help(
                'undo',
                h('button', { id: 'undo' }, { click: () => dispatch(undo()) })
              ),
              help(
                'redo',
                h('button', { id: 'redo' }, { click: () => dispatch(redo()) })
              ),
            ]),
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
                { input: inputZoomLevel }
              )
            ),
          ]),
        ]),
      ]),
      state.loggedIn
        ? null
        : h('div', { id: 'login-warning' }, [
            'You are currently not logged in. Any changes you make will not be saved. ',
            h('a', { href: '/login' }, ['Create a free account here!']),
          ]),
    ]),
    state.docs ? h('div', { id: 'doc' }, [state.docs]) : null,
  ]);
}
