//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  Draw the user interface (top bar and help documentation)

import { Menu } from './model';
import m from 'mithril';
import {
  addTriplet,
  toggleNatural,
  tieSelectedNotes,
  toggleDot,
  setInputLength,
} from '../Events/Note';
import { copy, paste, deleteSelection } from '../Events/Selection';
import {
  addAnacrusis,
  addBar,
  setBarline,
  editBarTimeSignature,
  resetBarLength,
  moveBarToNextLine,
  moveBarToPreviousLine,
} from '../Events/Bar';
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
  commit,
  download,
} from '../Events/Misc';
import {
  addSecondTiming,
  addSingleTiming,
  editTimingText,
} from '../Events/Timing';
import { setGracenoteOnSelectedNotes } from '../Events/Gracenote';
import { toggleDoc } from '../Events/Doc';
import {
  startPlayback,
  stopPlayback,
  setPlaybackBpm,
  startPlaybackAtSelection,
  playbackLoopingSelection,
} from '../Events/Playback';
import {
  centreText,
  addText,
  editText,
  setTextY,
  setTextX,
} from '../Events/Text';
import { addStave, addTuneBreak } from '../Events/Stave';
import { help } from '../global/docs';
import { isDotted, NoteLength, sameNoteLengthName } from '../Note/notelength';
import { Barline } from '../Bar/barline';
import {
  Preview,
  CustomGracenotePreview,
  NotePreview,
  ReactiveGracenotePreview,
} from '../Preview';
import { Settings, settings } from '../global/settings';
import { capitalise } from '../global/utils';
import { Bar } from '../Bar';
import { Gracenote, ReactiveGracenote, CustomGracenote } from '../Gracenote';
import { Note } from '../Note';
import { dispatch } from '../Controller';
import { TextBox } from '../TextBox';
import { Timing } from '../Timing';
import Documentation from '../Documentation';
import { Relative } from '../global/relativeLocation';

export interface UIState {
  canEdit: boolean;
  canUndo: boolean;
  canRedo: boolean;
  loggedIn: boolean;
  loadingAudio: boolean;
  isPlaying: boolean;
  selectedGracenote: Gracenote | null;
  selectedBar: Bar | null;
  selectedNotes: Note[];
  selectedText: TextBox | null;
  selectedTiming: Timing | null;
  showingPageNumbers: boolean;
  canDeletePages: boolean;
  preview: Preview | null;
  isLandscape: boolean;
  currentMenu: Menu;
  docs: string | null;
  zoomLevel: number;
}

export default function render(state: UIState): m.Children {
  const isCurrentNoteInput = (length: NoteLength) =>
    state.preview instanceof NotePreview &&
    sameNoteLengthName(state.preview.length(), length);

  const inputtingNatural =
    state.preview instanceof NotePreview && state.preview.natural();

  const allNotes = (pred: (note: Note) => boolean) =>
    state.selectedNotes.length > 0 && state.selectedNotes.every(pred);

  const noteInputButton = (length: NoteLength) =>
    help(
      length as keyof typeof Documentation,
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
    state.preview instanceof ReactiveGracenotePreview &&
    state.preview.isInputting(name);

  const isSelectedGracenote = (name: string) =>
    state.selectedGracenote instanceof ReactiveGracenote &&
    state.selectedGracenote.name() === name;

  const gracenoteInput = (name: keyof typeof Documentation) =>
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

  const noNotesSelected = state.selectedNotes.length === 0;
  const noBarSelected = state.selectedBar === null;
  const noGracenoteSelected = state.selectedGracenote === null;
  const noTextSelected = state.selectedText === null;
  const noTimingSelected = state.selectedTiming === null;
  const nothingSelected =
    noBarSelected && noNotesSelected && noTextSelected && noGracenoteSelected;
  // NOTE : can't copy and paste gracenotes or text, so disable even if noGracenoteSelected is false
  const cantCopyPaste = noBarSelected && noNotesSelected;

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

  const notInputtingNotes = state.preview === null;

  const noteMenu = [
    m('section', [
      m('h2', 'Add Note'),
      m('div.section-content', [
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
      m('h2', 'Modify Note'),
      m('div.section-content', [
        help(
          'dot',
          m(
            'button',
            {
              disabled: notInputtingNotes && noNotesSelected,
              class:
                (state.preview instanceof NotePreview &&
                  isDotted(state.preview.length())) ||
                allNotes((note) => isDotted(note.lengthForInput()))
                  ? 'highlighted'
                  : 'not-highlighted',
              onclick: () => dispatch(toggleDot()),
            },
            '•'
          )
        ),
        help(
          'tie',
          m('button#tie', {
            disabled: noNotesSelected,
            class: tied ? 'highlighted' : 'not-highlighted',
            onclick: () => dispatch(tieSelectedNotes()),
          })
        ),
        help(
          'triplet',
          m('button#triplet', {
            disabled: noNotesSelected,
            onclick: () => dispatch(addTriplet()),
          })
        ),
        help(
          'natural',
          m('button#natural', {
            disabled: noNotesSelected && notInputtingNotes,
            class:
              inputtingNatural || (!state.preview && naturalAlready)
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
      m('div.section-content', [
        help(
          'single',
          m('button', {
            class:
              state.preview instanceof CustomGracenotePreview ||
              (state.selectedGracenote instanceof CustomGracenote &&
                state.selectedGracenote.notes().length === 1)
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
        gracenoteInput('bubbly'),
        gracenoteInput('toarluath'),
        gracenoteInput('crunluath'),
      ]),
    ]),
  ];

  const addBarOrAnacrusis = (which: 'bar' | 'lead in') => {
    const event = which === 'bar' ? addBar : addAnacrusis;
    return m('div.section-content.vertical', [
      help(
        `add ${which} before`,
        m(
          'button.textual',
          { onclick: () => dispatch(event(Relative.before)) },
          `Add ${which} before`
        )
      ),
      help(
        `add ${which} after`,
        m(
          'button.textual',
          { onclick: () => dispatch(event(Relative.after)) },
          `Add ${which} after`
        )
      ),
    ]);
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
      m('h2', 'Add Bar'),
      m('div.section-content', addBarOrAnacrusis('bar')),
    ]),
    m('section', [
      m('h2', 'Add Lead In'),
      m('div.section-content', addBarOrAnacrusis('lead in')),
    ]),
    m('section', [
      m('h2', 'Modify Bar'),
      m('div.section-content.vertical', [
        help(
          'edit bar time signature',
          m(
            'button.textual',
            { onclick: () => dispatch(editBarTimeSignature()) },
            'Edit time signature'
          )
        ),
        help(
          'reset bar length',
          m(
            'button.textual',
            {
              disabled: noBarSelected,
              onclick: () => dispatch(resetBarLength()),
            },
            'Reset bar length'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', { style: 'display: inline' }, 'Modify Bar Lines'),
      m('div.section-content.vertical', [
        m('div.horizontal', [
          m('label', 'Start:'),
          help(
            'normal barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: startBarClass(Barline.normal),
                style: 'margin-left: .5rem;',
                onclick: () => dispatch(setBarline('start', Barline.normal)),
              },
              'Normal'
            )
          ),
          help(
            'repeat barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: startBarClass(Barline.repeat),
                onclick: () => dispatch(setBarline('start', Barline.repeat)),
              },
              'Repeat'
            )
          ),
          help(
            'part barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: startBarClass(Barline.part),
                onclick: () => dispatch(setBarline('start', Barline.part)),
              },
              'Part'
            )
          ),
        ]),
        m('div.horizontal', [
          m('label', 'End:  '),
          help(
            'normal barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: endBarClass(Barline.normal),
                style: 'margin-left: .5rem;',
                onclick: () => dispatch(setBarline('end', Barline.normal)),
              },
              'Normal'
            )
          ),
          help(
            'repeat barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: endBarClass(Barline.repeat),
                onclick: () => dispatch(setBarline('end', Barline.repeat)),
              },
              'Repeat'
            )
          ),
          help(
            'part barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: endBarClass(Barline.part),
                onclick: () => dispatch(setBarline('end', Barline.part)),
              },
              ['Part']
            )
          ),
        ]),
      ]),
    ]),
    m('section', [
      m('h2', 'Move Bar'),
      m('div.section-content.vertical', [
        help(
          'move bar to previous line',
          m(
            'button.textual',
            {
              disabled: noBarSelected,
              onclick: () => dispatch(moveBarToPreviousLine()),
            },
            'Move to previous stave'
          )
        ),
        help(
          'move bar to next line',
          m(
            'button.textual',
            {
              disabled: noBarSelected,
              onclick: () => dispatch(moveBarToNextLine()),
            },
            'Move to next stave'
          )
        ),
      ]),
    ]),
  ];

  const secondTimingMenu = [
    m('section', [
      m('h2', 'Add Timing'),
      m('div.section-content', [
        help(
          'second timing',
          m(
            'button',
            { onclick: () => dispatch(addSecondTiming()) },
            '1st/ 2nd'
          )
        ),
        help(
          'single timing',
          m('button', { onclick: () => dispatch(addSingleTiming()) }, '2nd')
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Edit Timing'),
      m('div.section-content', [
        help(
          'edit second timing',
          m(
            'button.double-width.text',
            {
              disabled: noTimingSelected,
              onclick: () =>
                state.selectedTiming &&
                dispatch(editTimingText(state.selectedTiming)),
            },
            'Edit timing text'
          )
        ),
      ]),
    ]),
  ];

  const staveMenu = [
    m('section', [
      m('h2', 'Add Stave'),
      m('div.section-content', [
        help(
          'add stave before',
          m(
            'button.add.text',
            { onclick: () => dispatch(addStave(Relative.before)) },
            'before'
          )
        ),
        help(
          'add stave after',
          m(
            'button.add.text',
            { onclick: () => dispatch(addStave(Relative.after)) },
            'after'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Add Tune Break'),
      m('div.section-content', [
        help(
          'add tune break before',
          m(
            'button.add.text',
            { onclick: () => dispatch(addTuneBreak(Relative.before)) },
            'before'
          )
        ),
        help(
          'add tune break after',
          m(
            'button.add.text',
            { onclick: () => dispatch(addTuneBreak(Relative.after)) },
            'after'
          )
        ),
      ]),
    ]),
  ];

  const pageWidth = state.isLandscape
    ? settings.pageLongSideLength
    : settings.pageShortSideLength;
  const pageHeight = state.isLandscape
    ? settings.pageShortSideLength
    : settings.pageLongSideLength;
  const percentage = (value: number, total: number) =>
    Math.round((10000 * value) / total) / 100;

  // The problem: we want to allow the user to input
  // e.g. 50.01, but if the user types 50.0 then that
  // gets rounded to 50 so they can't continue. Always
  // rounding to 2 decimal places is even worse since they
  // can't delete the last decimal place to input. The solution -
  // only replace the text if it has a different numerical value.
  // userText checks the element specified by id and returns the old
  // text if it has the same numerical value, or the new text if not
  const userText = (id: string, value: number) => {
    const element = document.getElementById(id);
    if (element instanceof HTMLInputElement) {
      const previousValue = parseFloat(element.value);
      if (previousValue === value) {
        return element.value;
      }
    }
    return value.toString();
  };

  const textMenu = [
    m('section', [
      m('h2', 'Add Text Box'),
      m('div.section-content', [
        help(
          'add text',
          m('button.add', { onclick: () => dispatch(addText()) })
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Modify Text Box'),
      m('div.section-content', [
        help(
          'centre text',
          m(
            'button.double-width.text',
            { disabled: noTextSelected, onclick: () => dispatch(centreText()) },
            'Centre text'
          )
        ),
        help(
          'edit text',
          m(
            'button.double-width.text',
            { disabled: noTextSelected, onclick: () => dispatch(editText()) },
            'Edit text'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Set Text Box Position'),
      help(
        'set text coords',
        m('div.section-content.vertical', [
          m('label.text-coord', [
            'X: ',
            m('input#text-x-coord', {
              disabled: noTextSelected,
              type: 'number',
              min: 0,
              max: 100,
              step: 0.01,
              value: userText(
                'text-x-coord',
                percentage(state.selectedText?.x() || 0, pageWidth)
              ),
              oninput: (e: InputEvent) =>
                dispatch(
                  setTextX(parseFloat((e.target as HTMLInputElement).value))
                ),
              onchange: () => dispatch(commit()),
            }),
            '%',
          ]),
          m('label.text-coord', [
            'Y: ',
            m('input#text-y-coord', {
              disabled: noTextSelected,
              type: 'number',
              min: 0,
              max: 100,
              step: 0.01,
              value: userText(
                'text-y-coord',
                percentage(state.selectedText?.y() || 0, pageHeight)
              ),
              oninput: (e: InputEvent) =>
                dispatch(
                  setTextY(parseFloat((e.target as HTMLInputElement).value))
                ),
              onchange: () => dispatch(commit()),
            }),
            '%',
          ]),
        ])
      ),
    ]),
  ];

  const playBackMenu = [
    m('section', [
      m('h2', 'Controls'),
      m('div.section-content', [
        help(
          'play',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying,
              onclick: () => dispatch(startPlayback()),
            },
            'Play from Beginning'
          )
        ),
        help(
          'play from selection',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying,
              onclick: () => dispatch(startPlaybackAtSelection()),
            },
            'Play from Selection'
          )
        ),
        help(
          'play looping selection',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying || state.selectedNotes.length === 0,
              onclick: () => dispatch(playbackLoopingSelection()),
            },
            'Play looped Selection'
          )
        ),
        help(
          'stop',
          m(
            'button',
            {
              disabled: !state.isPlaying,
              onclick: () => dispatch(stopPlayback()),
            },
            'Stop'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Speed'),
      m('div.section-content', [
        help(
          'playback speed',
          m('label#playback-speed-label', [
            m('input', {
              type: 'range',
              min: '30',
              max: '150',
              step: '1',
              value: settings.bpm,
              oninput: (e: InputEvent) =>
                dispatch(
                  setPlaybackBpm(parseInt((e.target as HTMLInputElement).value))
                ),
            }),
            m('input#playback-bpm', {
              type: 'number',
              value: settings.bpm,
              oninput: (e: InputEvent) =>
                dispatch(
                  setPlaybackBpm(parseInt((e.target as HTMLInputElement).value))
                ),
            }),
            'beats per minute',
          ])
        ),
      ]),
    ]),
  ];

  const setting = <T extends keyof Settings>(property: T, name: string) =>
    m('div.horizontal', [
      m('label', name + ': '),
      m('input', {
        type: 'number',
        value: settings[property].toString(),
        oninput: (e: InputEvent) =>
          dispatch(changeSetting(property, e.target as HTMLInputElement)),
      }),
    ]);
  const documentMenu = [
    m('section', [
      m('h2', 'Page'),
      m('div.section-content', [
        help(
          'add-page',
          m('button.add', { onclick: () => dispatch(addPage()) })
        ),
        help(
          'remove-page',
          m('button.remove', {
            disabled: !state.canDeletePages,
            onclick: () => dispatch(removePage()),
          })
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Orientation'),
      m('div.section-content', [
        help(
          'landscape',
          m(
            'button',
            {
              class:
                'text double-width' + (state.isLandscape ? ' highlighted' : ''),
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
              class:
                'text double-width' + (state.isLandscape ? '' : ' highlighted'),
              onclick: () => dispatch(portrait()),
            },
            'Portrait'
          )
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Page Numbers'),
      m('div.section-content', [
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
      m('div.section-content', [
        help(
          'print',
          m(
            'button.text.double-width',
            { onclick: () => dispatch(print()) },
            'Print (to PDF, or printer)'
          )
        ),
        help(
          'download',
          m(
            'button.text.double-width',
            { onclick: () => dispatch(download()) },
            'Download PipeScore file'
          )
        ),
      ]),
    ]),
  ];
  const settingsMenu = [
    m('section', [
      m('h2', 'Stave layout'),
      m('div.section-content.vertical', [
        setting('lineGap', 'Gap between lines'),
        setting('staveGap', 'Gap between staves'),
      ]),
    ]),
    m('section', [
      m('h2', 'Gracenote layout'),
      m('div.section-content.vertical', [
        setting('gapAfterGracenote', 'Gap after gracenote'),
      ]),
    ]),
    m('section', [
      m('h2', 'Margins'),
      m('div.section-content.vertical', [
        setting('topOffset', 'Gap at top of page'),
        setting('margin', 'Margin'),
      ]),
    ]),
    m('section', [
      m('h2', 'View'),
      m('div.section-content', [
        m('label', [
          'Disable Help',
          help(
            'disable help',
            m('input', {
              type: 'checkbox',
              onclick: () => dispatch(toggleDoc()),
            })
          ),
        ]),
      ]),
    ]),
  ];

  const menuMap: Record<Menu, m.Children[]> = {
    note: noteMenu,
    gracenote: gracenoteMenu,
    bar: barMenu,
    second_timing: secondTimingMenu,
    stave: staveMenu,
    text: textMenu,
    settings: settingsMenu,
    playback: playBackMenu,
    document: documentMenu,
  };

  const menuClass = (s: Menu): string =>
    s === state.currentMenu ? 'selected' : '';

  const pretty = (name: Menu): string =>
    name.split('_').map(capitalise).join(' ');

  const loginWarning = [
    'You are currently not logged in. Any changes you make will not be saved. ',
    m('a[href=/login]', 'Create a free account here!'),
  ];
  const loadingAudioWarning = [
    'Loading audio samples... this may take a minute or so.',
  ];
  const otherUsersScoreWarning = [
    "You are currently viewing someone else's score. Any edits you make will not be saved.",
  ];
  const showLoginWarning = state.canEdit && !state.loggedIn;
  const showOtherUsersScoreWarning = !state.canEdit;
  const showAudioWarning =
    state.loadingAudio && state.currentMenu === 'playback';
  const warning = [
    ...(showLoginWarning ? loginWarning : []),
    ...(showOtherUsersScoreWarning ? otherUsersScoreWarning : []),
    showAudioWarning && showLoginWarning ? m('hr') : null,
    ...(showAudioWarning ? loadingAudioWarning : []),
  ];
  const shouldShowWarning =
    showLoginWarning || showAudioWarning || showOtherUsersScoreWarning;

  const menuHead = (name: Menu) =>
    m(
      'button',
      {
        class: menuClass(name),
        onmousedown: () => dispatch(setMenu(name)),
      },
      [pretty(name)]
    );

  const headings = state.canEdit
    ? [
        menuHead('note'),
        menuHead('gracenote'),
        menuHead('bar'),
        menuHead('second_timing'),
        menuHead('stave'),
        menuHead('text'),
        menuHead('playback'),
        menuHead('document'),
        menuHead('settings'),
        help(
          'help',
          m('button', m('a[href=/help]', { target: '_blank' }, 'Help'))
        ),
      ]
    : [
        menuHead('playback'),
        menuHead('document'),
        help(
          'help',
          m('button', m('a[href=/help]', { target: '_blank' }, 'Help'))
        ),
      ];

  return m('div', [
    m('div#ui', [
      m('div#headings', [
        help('home', m('button', m('a[href=/scores]', 'Home'))),
        ...headings,
      ]),
      m('div#topbar', [m('div#topbar-main', menuMap[state.currentMenu])]),
      shouldShowWarning ? m('div#login-warning', warning) : null,
    ]),
    m('div#doc', [
      state.docs ? state.docs : null,
      help(
        'zoom',
        m('input#zoom-level', {
          type: 'range',
          min: '10',
          max: '200',
          step: '2',
          value: state.zoomLevel,
          oninput: inputZoomLevel,
        })
      ),
      m('section', [
        help(
          'delete',
          m('button.delete', {
            disabled: nothingSelected,
            onclick: () => dispatch(deleteSelection()),
          })
        ),
        help(
          'copy',
          m('button#copy', {
            disabled: cantCopyPaste,
            onclick: () => dispatch(copy()),
          })
        ),
        help(
          'paste',
          m('button#paste', {
            disabled: cantCopyPaste,
            onclick: () => dispatch(paste()),
          })
        ),
        help(
          'undo',
          m('button#undo', {
            disabled: !state.canUndo,
            onclick: () => dispatch(undo()),
          })
        ),
        help(
          'redo',
          m('button#redo', {
            disabled: !state.canRedo,
            onclick: () => dispatch(redo()),
          })
        ),
      ]),
    ]),
  ]);
}
