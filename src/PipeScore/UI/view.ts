/*
  Draw user interface (bar at top with buttons)
  Copyright (C) 2021 macarc
*/
import { Menu } from './model';
import m from 'mithril';
import {
  addTriplet,
  toggleNatural,
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
  resetBarLength,
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
import { help } from '../global/docs';
import { dotted, NoteLength, sameNoteLengthName } from '../Note/notelength';
import { Barline } from '../Bar/barline';
import { Demo, DemoGracenote, DemoNote, DemoReactive } from '../DemoNote';
import { Settings, settings } from '../global/settings';
import { capitalise } from '../global/utils';
import { Bar } from '../Bar';
import { Gracenote, ReactiveGracenote, SingleGracenote } from '../Gracenote';
import { Note } from '../Note';
import { dispatch } from '../Controller';

export interface UIState {
  loggedIn: boolean;
  selectedGracenote: Gracenote | null;
  selectedBar: Bar | null;
  selectedNotes: Note[];
  showingPageNumbers: boolean;
  demo: Demo | null;
  isLandscape: boolean;
  currentMenu: Menu;
  docs: string | null;
  playbackBpm: number;
  zoomLevel: number;
}

export default function render(state: UIState): m.Children {
  const isCurrentNoteInput = (length: NoteLength) =>
    state.demo instanceof DemoNote &&
    sameNoteLengthName(state.demo.length(), length);

  const inputtingNatural =
    state.demo instanceof DemoNote && state.demo.natural();

  const allNotes = (pred: (note: Note) => boolean) =>
    state.selectedNotes.length > 0 && state.selectedNotes.every(pred);

  const noteInputButton = (length: NoteLength) =>
    help(
      length,
      m('button', {
        class:
          isCurrentNoteInput(length) ||
          allNotes((note) => note.isLength(length))
            ? 'highlighted'
            : 'not-highlighted',
        id: `note-${length}`,
        onclick: () => dispatch(setInputLength(length)),
      })
    );

  const isGracenoteInput = (name: string) =>
    state.demo instanceof DemoReactive && state.demo.isInputting(name);

  const isSelectedGracenote = (name: string) =>
    state.selectedGracenote instanceof ReactiveGracenote &&
    state.selectedGracenote.name() === name;

  const gracenoteInput = (name: string) =>
    help(
      name,
      m('button', {
        class:
          isGracenoteInput(name) || isSelectedGracenote(name)
            ? 'highlighted'
            : 'not-highlighted',
        style: `background-image: url("/images/icons/gracenote-${name}.svg")`,
        onclick: () => dispatch(setGracenoteOnSelectedNotes(name)),
      })
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

  const tied =
    state.selectedNotes.length === 0
      ? false
      : state.selectedNotes.length === 1
      ? state.selectedNotes[0].isTied()
      : state.selectedNotes.slice(1).every((note) => note.isTied());

  const naturalAlready =
    state.selectedNotes.length === 0
      ? false
      : allNotes((note) => note.natural());

  const noteMenu = [
    m('section', [
      m('h2', 'Input Notes'),
      m('div', { class: 'section-content note-inputs' }, [
        noteInputButton(NoteLength.Semibreve),
        noteInputButton(NoteLength.Minim),
        noteInputButton(NoteLength.Crotchet),
        noteInputButton(NoteLength.Quaver),
        noteInputButton(NoteLength.SemiQuaver),
        noteInputButton(NoteLength.DemiSemiQuaver),
        noteInputButton(NoteLength.HemiDemiSemiQuaver),
      ]),
    ]),
    m('section', [
      m('h2', 'Modify Notes'),
      m('div[class=section-content]', [
        help(
          'dot',
          m(
            'button[id=toggle-dotted]',
            {
              class:
                (state.demo instanceof DemoNote &&
                  dotted(state.demo.length())) ||
                allNotes((note) => dotted(note.lengthForInput()))
                  ? 'highlighted'
                  : 'not-highlighted',
              onclick: () => dispatch(toggleDot()),
            },
            '•'
          )
        ),
        help(
          'tie',
          m('button[id=tie]', {
            class: tied ? 'highlighted' : 'not-highlighted',
            onclick: () => dispatch(tieSelectedNotes()),
          })
        ),
        help(
          'triplet',
          m('button[id=triplet]', { onclick: () => dispatch(addTriplet()) })
        ),
        help(
          'natural',
          m('button[id=natural]', {
            class:
              inputtingNatural || (!state.demo && naturalAlready)
                ? 'highlighted'
                : 'not-highlighted',
            onclick: () => dispatch(toggleNatural()),
          })
        ),
      ]),
    ]),
  ];

  const gracenoteMenu = [
    m('section', [
      m('h2', 'Add Gracenote'),
      m('div[class=section-content]', [
        help(
          'single',
          m('button', {
            class:
              state.demo instanceof DemoGracenote ||
              state.selectedGracenote instanceof SingleGracenote
                ? 'highlighted'
                : 'not-highlighted',
            style: 'background-image: url("/images/icons/single.svg")',
            onclick: () => dispatch(setGracenoteOnSelectedNotes(null)),
          })
        ),
        gracenoteInput('doubling'),
        gracenoteInput('half-doubling'),
        gracenoteInput('throw-d'),
        gracenoteInput('grip'),
        gracenoteInput('birl'),
        gracenoteInput('g-gracenote-birl'),
        gracenoteInput('g-strike'),
        gracenoteInput('shake'),
        gracenoteInput('c-shake'),
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
        m('button[class=add]', {
          onclick: () =>
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
        })
      ),
      m('select', { id: `${which}-add-where`, class: 'fit-nicely' }, [
        m('option', { name: `add-${which}`, value: 'before' }, 'before'),
        m('option', { name: `add-${which}`, value: 'after' }, 'after'),
      ]),
    ];
  };

  const startBarClass = (type: Barline) =>
    'textual' +
    (state.selectedBar && state.selectedBar.startBarline(type)
      ? ' highlighted'
      : '');
  const endBarClass = (type: Barline) =>
    'textual' +
    (state.selectedBar && state.selectedBar.endBarline(type)
      ? ' highlighted'
      : '');

  const barMenu = [
    m('section', [
      m('h2', 'Bar'),
      m('div[class=section-content]', addBarOrAnacrusis('bar')),
    ]),
    m('section', [
      m('h2', { style: 'display: inline' }, 'Bar lines'),
      m('div', { class: 'section-content flex' }, [
        m('div', [
          m('label', 'Start:'),
          help(
            'normal barline',
            m(
              'button',
              {
                class: startBarClass('normal'),
                style: 'margin-left: .5rem;',
                onclick: () => dispatch(setBarRepeat('start', 'normal')),
              },
              'Normal'
            )
          ),
          help(
            'repeat barline',
            m(
              'button',
              {
                class: startBarClass('repeat'),
                onclick: () => dispatch(setBarRepeat('start', 'repeat')),
              },
              'Repeat'
            )
          ),
          help(
            'part barline',
            m(
              'button',
              {
                class: startBarClass('end'),
                onclick: () => dispatch(setBarRepeat('start', 'end')),
              },
              'Part'
            )
          ),
        ]),
        m('div', [
          m('label', 'End: '),
          help(
            'normal barline',
            m(
              'button',
              {
                class: endBarClass('normal'),
                style: 'margin-left: .5rem;',
                onclick: () => dispatch(setBarRepeat('end', 'normal')),
              },
              'Normal'
            )
          ),
          help(
            'repeat barline',
            m(
              'button',
              {
                class: endBarClass('repeat'),
                onclick: () => dispatch(setBarRepeat('end', 'repeat')),
              },
              'Repeat'
            )
          ),
          help(
            'part barline',
            m(
              'button',
              {
                class: endBarClass('end'),
                onclick: () => dispatch(setBarRepeat('end', 'end')),
              },
              ['Part']
            )
          ),
        ]),
      ]),
    ]),
    m('section', [
      m('h2', 'Lead In'),
      m('div[class=section-content]', addBarOrAnacrusis('anacrusis')),
    ]),
    m('section', [
      m('h2', 'Second Timing'),
      m('div[class=section-content]', [
        help(
          'second timing',
          m(
            'button[id=add-second-timing]',
            { onclick: () => dispatch(addSecondTiming()) },
            '1st/ 2nd'
          )
        ),
        help(
          'single timing',
          m(
            'button[id=add-single-timing]',
            { onclick: () => dispatch(addSingleTiming()) },
            '2nd'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Other options'),
      m('div', { class: 'section-content flex' }, [
        help(
          'edit bar time signature',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(editBarTimeSignature()) },
            'Edit Time Signature'
          )
        ),
        help(
          'reset bar length',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(resetBarLength()) },
            'Reset Bar Length'
          )
        ),
      ]),
    ]),
  ];

  const staveMenu = [
    m('section', [
      m('h2', 'Stave'),
      m('div[class=section-content]', [
        help(
          'add stave before',
          m(
            'button',
            { class: 'add text', onclick: () => dispatch(addStave(true)) },
            'before'
          )
        ),
        help(
          'add stave after',
          m(
            'button',
            { class: 'add text', onclick: () => dispatch(addStave(false)) },
            'after'
          )
        ),
      ]),
    ]),
  ];

  const textMenu = [
    m('section', [
      m('h2', 'Text'),
      m('div[class=section-content]', [
        help(
          'add text',
          m('button[class=add]', { onclick: () => dispatch(addText()) })
        ),
        help(
          'centre text',
          m(
            'button',
            {
              class: 'double-width text',
              onclick: () => dispatch(centreText()),
            },
            'Centre text'
          )
        ),
      ]),
    ]),
  ];

  const playBackMenu = [
    m('section', [
      m('h2', 'Playback'),
      m('div[class=section-content]', [
        help(
          'play',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(startPlayback()) },
            'Play'
          )
        ),
        help(
          'stop',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(stopPlayback()) },
            'Stop'
          )
        ),
        help(
          'playback speed',
          m('label', [
            'Playback speed:',
            m('input', {
              type: 'range',
              min: '30',
              max: '200',
              step: '1',
              value: state.playbackBpm,
              oninput: (e: InputEvent) =>
                dispatch(
                  setPlaybackBpm(parseInt((e.target as HTMLInputElement).value))
                ),
            }),
          ])
        ),
      ]),
    ]),
  ];

  const setting = <T extends keyof Settings>(property: T, name: string) => [
    m('label', name),
    m('input', {
      type: 'number',
      value: settings[property].toString(),
      oninput: (e: InputEvent) =>
        dispatch(changeSetting(property, e.target as HTMLInputElement)),
    }),
  ];
  const documentMenu = [
    m('section', [
      m('h2', 'Pages'),
      m('div[class=section-content]', [
        help(
          'add-page',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(addPage()) },
            'Add'
          )
        ),
        help(
          'remove-page',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(removePage()) },
            'Remove'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Orientation'),
      m('div[class=section-content]', [
        help(
          'landscape',
          m(
            'button',
            {
              class: 'textual' + (state.isLandscape ? ' highlighted' : ''),
              onclick: () => dispatch(landscape()),
            },
            'Landscape'
          )
        ),
        help(
          'portrait',
          m(
            'button',
            {
              class: 'textual' + (state.isLandscape ? '' : ' highlighted'),
              onclick: () => dispatch(portrait()),
            },
            'Portrait'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Options'),
      m('div[class=section-content]', [
        help(
          'page numbers',
          m('label', [
            'Show page numbers: ',
            m('input', {
              type: 'checkbox',
              checked: state.showingPageNumbers,
              onclick: (e: MouseEvent) =>
                dispatch(setPageNumberVisibility(e.target as HTMLInputElement)),
            }),
          ])
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Export'),
      m('div[class=section-content]', [
        help(
          'print',
          m(
            'button[class=textual]',
            { onclick: () => dispatch(print()) },
            'Print (to PDF, or printer)'
          )
        ),
      ]),
    ]),
  ];
  const settingsMenu = [
    m('section', [
      m('h2', 'Settings'),
      m('div[class=section-content]', [
        ...setting('lineGap', 'Gap between lines'),
        ...setting('topOffset', 'Gap at top of page'),
        ...setting('margin', 'Margin'),
        ...setting('staveGap', 'Gap between staves'),
      ]),
    ]),
    m('section', [
      m('h2', 'View'),
      m('div[class=section-content]', [
        m('label', 'Disable Help'),
        help(
          'disable help',
          m('input', { type: 'checkbox', onclick: () => dispatch(toggleDoc()) })
        ),
      ]),
    ]),
  ];

  const menuMap: Record<Menu, m.Children[]> = {
    note: noteMenu,
    gracenote: gracenoteMenu,
    bar: barMenu,
    stave: staveMenu,
    text: textMenu,
    settings: settingsMenu,
    playback: playBackMenu,
    document: documentMenu,
  };

  const menuClass = (s: Menu): string =>
    s === state.currentMenu ? 'selected' : '';

  const menuHead = (name: Menu) =>
    m(
      'button',
      {
        class: menuClass(name),
        onmousedown: () => dispatch(setMenu(name)),
      },
      [capitalise(name)]
    );
  return m('div', [
    m('div[id=ui]', [
      m('div[id=menu]', [
        help('home', m('button', m('a[href=/scores]', 'Home'))),
        menuHead('note'),
        menuHead('gracenote'),
        menuHead('bar'),
        menuHead('stave'),
        menuHead('text'),
        menuHead('playback'),
        menuHead('document'),
        menuHead('settings'),
        help(
          'help',
          m('button', m('a[href=/help]', { target: '_blank' }, 'Help'))
        ),
      ]),
      m('div[id=topbar]', [
        m('div[id=topbar-main]', menuMap[state.currentMenu]),
        m('section[id=general-commands]', [
          m('h2', 'General Commands'),
          m('div', { class: 'section-content flex' }, [
            m('div', [
              help(
                'delete',
                m('button[id=delete-notes]', {
                  class: 'delete',
                  onclick: () => dispatch(deleteSelection()),
                })
              ),
              help(
                'copy',
                m('button[id=copy]', { onclick: () => dispatch(copy()) })
              ),
              help(
                'paste',
                m('button[id=paste]', { onclick: () => dispatch(paste()) })
              ),
              help(
                'undo',
                m('button[id=undo]', { onclick: () => dispatch(undo()) })
              ),
              help(
                'redo',
                m('button[id=redo]', { onclick: () => dispatch(redo()) })
              ),
            ]),
            help(
              'zoom',
              m('input[id=zoom-level]', {
                type: 'range',
                min: '10',
                max: '200',
                step: '2',
                value: state.zoomLevel,
                oninput: inputZoomLevel,
              })
            ),
          ]),
        ]),
      ]),
      state.loggedIn
        ? null
        : m('div[id=login-warning]', [
            'You are currently not logged in. Any changes you make will not be saved. ',
            m('a[href=/login]', 'Create a free account here!'),
          ]),
    ]),
    state.docs ? m('div[id=doc]', state.docs) : null,
  ]);
}
