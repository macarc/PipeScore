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

import m from 'mithril';
import { IBar } from '../Bar';
import { Barline } from '../Barline';
import { Dispatch } from '../Dispatch';
import Documentation from '../Documentation';
import {
  addAnacrusis,
  addBar,
  editBarTimeSignature,
  moveBarToNextLine,
  moveBarToPreviousLine,
  resetBarLength,
  setBarline,
} from '../Events/Bar';
import { toggleDoc } from '../Events/Doc';
import { setGracenoteOnSelectedNotes } from '../Events/Gracenote';
import {
  changeSetting,
  changeZoomLevel,
  commit,
  download,
  exportBWW,
  exportPDF,
  landscape,
  portrait,
  redo,
  save,
  setMenu,
  setPageNumberVisibility,
  undo,
} from '../Events/Misc';
import {
  setInputLength,
  tieSelectedNotes,
  toggleDot,
  toggleNatural,
  toggleTriplet,
} from '../Events/Note';
import {
  playbackLoopingSelection,
  setPlaybackBpm,
  startPlayback,
  startPlaybackAtSelection,
  stopPlayback,
} from '../Events/Playback';
import { copy, deleteSelection, paste } from '../Events/Selection';
import {
  addStave,
  resetStaveGap,
  setStaveGap,
  staveGapToDisplay,
} from '../Events/Stave';
import { addText, centreText, editText, setTextX, setTextY } from '../Events/Text';
import { addSecondTiming, addSingleTiming, editTimingText } from '../Events/Timing';
import { IGracenote } from '../Gracenote';
import { INote } from '../Note';
import { Duration } from '../Note/notelength';
import { IPreview } from '../Preview';
import {
  NotePreview,
  ReactiveGracenotePreview,
  SingleGracenotePreview,
} from '../Preview/impl';
import { IStave } from '../Stave';
import { minStaveGap } from '../Stave/view';
import { ITextBox } from '../TextBox';
import { ITiming } from '../Timing';
import { help } from '../global/docs';
import { Relative } from '../global/relativeLocation';
import { Settings, settings } from '../global/settings';
import { capitalise } from '../global/utils';
import { Menu } from './model';

export interface UIState {
  saved: boolean;
  canEdit: boolean;
  canUndo: boolean;
  canRedo: boolean;
  loggedIn: boolean;
  loadingAudio: boolean;
  isPlaying: boolean;
  selectedGracenote: IGracenote | null;
  selectedStaves: IStave[];
  selectedBar: IBar | null;
  selectedNotes: INote[];
  selectedText: ITextBox | null;
  selectedTiming: ITiming | null;
  showingPageNumbers: boolean;
  preview: IPreview | null;
  isLandscape: boolean;
  currentMenu: Menu;
  docs: string | null;
  zoomLevel: number;
  dispatch: Dispatch;
}

export default function render(state: UIState): m.Children {
  const isCurrentNoteInput = (length: Duration) =>
    state.preview instanceof NotePreview &&
    state.preview.length().sameNoteLengthName(length);

  const inputtingNatural =
    state.preview instanceof NotePreview && state.preview.natural();

  const allNotes = (pred: (note: INote) => boolean) =>
    state.selectedNotes.length > 0 && state.selectedNotes.every(pred);

  const noteInputButton = (length: Duration) =>
    help(
      length as keyof typeof Documentation,
      m('button', {
        class:
          isCurrentNoteInput(length) ||
          allNotes((note) => note.length().sameNoteLengthName(length))
            ? 'highlighted'
            : 'not-highlighted',
        id: `note-${length}`,
        onclick: () => state.dispatch(setInputLength(length)),
      }),
      state.dispatch
    );

  const isGracenoteInput = (name: string) =>
    state.preview instanceof ReactiveGracenotePreview &&
    state.preview.isInputting(name);

  const isSelectedGracenote = (name: string) =>
    state.selectedGracenote?.reactiveName() === name;

  const gracenoteInput = (name: keyof typeof Documentation) =>
    help(
      name,
      m('button', {
        class:
          isGracenoteInput(name) || isSelectedGracenote(name)
            ? 'highlighted'
            : 'not-highlighted',
        style: `background-image: url("/images/icons/gracenote-${name}.svg")`,
        onclick: () => state.dispatch(setGracenoteOnSelectedNotes(name)),
      }),
      state.dispatch
    );

  const inputZoomLevel = (e: Event) => {
    const element = e.target;
    if (element instanceof HTMLInputElement) {
      const newZoomLevel = parseInt(element.value, 10);
      if (!Number.isNaN(newZoomLevel)) {
        state.dispatch(changeZoomLevel(newZoomLevel));
      }
    }
  };

  const noNotesSelected = state.selectedNotes.length === 0;
  const noBarSelected = state.selectedBar === null;
  const noStaveSelected = state.selectedStaves.length === 0;
  const noGracenoteSelected = state.selectedGracenote === null;
  const noTextSelected = state.selectedText === null;
  const noTimingSelected = state.selectedTiming === null;
  const nothingSelected =
    noStaveSelected &&
    noBarSelected &&
    noNotesSelected &&
    noTextSelected &&
    noGracenoteSelected;
  // NOTE : can't copy and paste gracenotes or text, so disable even if noGracenoteSelected is false
  const cantCopyPaste = noBarSelected && noNotesSelected;

  const setting = <T extends keyof Settings>(property: T, name: string) =>
    m('div.horizontal', [
      m('label', `${name}: `),
      m('input', {
        type: 'number',
        value: settings[property].toString(),
        oninput: (e: InputEvent) =>
          state.dispatch(changeSetting(property, e.target as HTMLInputElement)),
        onchange: () => state.dispatch(commit()),
      }),
    ]);

  const tied =
    state.selectedNotes.length === 0
      ? false
      : state.selectedNotes.length === 1
        ? state.selectedNotes[0].isTied()
        : state.selectedNotes.slice(1).every((note) => note.isTied());

  const naturalAlready =
    state.selectedNotes.length === 0 ? false : allNotes((note) => note.natural());

  const notInputtingNotes = state.preview === null;

  const noteMenu = [
    m('section', [
      m('h2', 'Add Note'),
      m('div.section-content', [
        noteInputButton(Duration.Semibreve),
        noteInputButton(Duration.Minim),
        noteInputButton(Duration.Crotchet),
        noteInputButton(Duration.Quaver),
        noteInputButton(Duration.SemiQuaver),
        noteInputButton(Duration.DemiSemiQuaver),
        noteInputButton(Duration.HemiDemiSemiQuaver),
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
                  state.preview.length().hasDot()) ||
                allNotes((note) => note.length().hasDot())
                  ? 'highlighted'
                  : 'not-highlighted',
              onclick: () => state.dispatch(toggleDot()),
            },
            '•'
          ),
          state.dispatch
        ),
        help(
          'tie',
          m('button#tie', {
            disabled: noNotesSelected,
            class: tied ? 'highlighted' : 'not-highlighted',
            onclick: () => state.dispatch(tieSelectedNotes()),
          }),
          state.dispatch
        ),
        help(
          'triplet',
          m('button#triplet', {
            disabled: noNotesSelected,
            onclick: () => state.dispatch(toggleTriplet()),
          }),
          state.dispatch
        ),
        help(
          'natural',
          m('button#natural', {
            disabled: noNotesSelected && notInputtingNotes,
            class:
              inputtingNatural || (!state.preview && naturalAlready)
                ? 'highlighted'
                : 'not-highlighted',
            onclick: () => state.dispatch(toggleNatural()),
          }),
          state.dispatch
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
              state.preview instanceof SingleGracenotePreview ||
              (state.selectedGracenote?.notes().length === 1 &&
                state.selectedGracenote.reactiveName() === null)
                ? 'highlighted'
                : 'not-highlighted',
            style: 'background-image: url("/images/icons/single.svg")',
            onclick: () => state.dispatch(setGracenoteOnSelectedNotes(null)),
          }),
          state.dispatch
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
        gracenoteInput('taorluath'),
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
          { onclick: () => state.dispatch(event(Relative.before)) },
          `Add ${which} before`
        ),
        state.dispatch
      ),
      help(
        `add ${which} after`,
        m(
          'button.textual',
          { onclick: () => state.dispatch(event(Relative.after)) },
          `Add ${which} after`
        ),
        state.dispatch
      ),
    ]);
  };

  const startBarClass = (type: Barline) =>
    state.selectedBar?.startBarline() === type ? 'textual highlighted' : 'textual';
  const endBarClass = (type: Barline) =>
    state.selectedBar?.endBarline() === type ? 'textual highlighted' : 'textual';

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
            { onclick: () => state.dispatch(editBarTimeSignature()) },
            'Edit time signature'
          ),
          state.dispatch
        ),
        help(
          'reset bar length',
          m(
            'button.textual',
            {
              disabled: noBarSelected,
              onclick: () => state.dispatch(resetBarLength()),
            },
            'Reset bar length'
          ),
          state.dispatch
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
                onclick: () => state.dispatch(setBarline('start', Barline.normal)),
              },
              'Normal'
            ),
            state.dispatch
          ),
          help(
            'repeat barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: startBarClass(Barline.repeat),
                onclick: () => state.dispatch(setBarline('start', Barline.repeat)),
              },
              'Repeat'
            ),
            state.dispatch
          ),
          help(
            'part barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: startBarClass(Barline.part),
                onclick: () => state.dispatch(setBarline('start', Barline.part)),
              },
              'Part'
            ),
            state.dispatch
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
                onclick: () => state.dispatch(setBarline('end', Barline.normal)),
              },
              'Normal'
            ),
            state.dispatch
          ),
          help(
            'repeat barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: endBarClass(Barline.repeat),
                onclick: () => state.dispatch(setBarline('end', Barline.repeat)),
              },
              'Repeat'
            ),
            state.dispatch
          ),
          help(
            'part barline',
            m(
              'button',
              {
                disabled: noBarSelected,
                class: endBarClass(Barline.part),
                onclick: () => state.dispatch(setBarline('end', Barline.part)),
              },
              ['Part']
            ),
            state.dispatch
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
              onclick: () => state.dispatch(moveBarToPreviousLine()),
            },
            'Move to previous stave'
          ),
          state.dispatch
        ),
        help(
          'move bar to next line',
          m(
            'button.textual',
            {
              disabled: noBarSelected,
              onclick: () => state.dispatch(moveBarToNextLine()),
            },
            'Move to next stave'
          ),
          state.dispatch
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
            { onclick: () => state.dispatch(addSecondTiming()) },
            '1st/ 2nd'
          ),
          state.dispatch
        ),
        help(
          'single timing',
          m('button', { onclick: () => state.dispatch(addSingleTiming()) }, '2nd'),
          state.dispatch
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
                state.dispatch(editTimingText(state.selectedTiming)),
            },
            'Edit timing text'
          ),
          state.dispatch
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
            { onclick: () => state.dispatch(addStave(Relative.before)) },
            'before'
          ),
          state.dispatch
        ),
        help(
          'add stave after',
          m(
            'button.add.text',
            { onclick: () => state.dispatch(addStave(Relative.after)) },
            'after'
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Modify Stave'),
      m('div.section-content', [
        help(
          'set stave gap',
          m('label', [
            state.selectedStaves.length === 0
              ? 'Stave gap (for all staves): '
              : state.selectedStaves.length === 1
                ? 'Stave gap (for selected stave only): '
                : 'Stave gap (for selected staves only): ',
            m('input', {
              type: 'number',
              min: minStaveGap,
              value: staveGapToDisplay(state.selectedStaves),
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setStaveGap(parseFloat((e.target as HTMLInputElement).value))
                ),
              onchange: () => state.dispatch(commit()),
            }),
          ]),
          state.dispatch
        ),
        help(
          'reset stave gap',
          m(
            'button.textual',
            { onclick: () => state.dispatch(resetStaveGap()) },
            'Reset'
          ),
          state.dispatch
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
          m('button.add', { onclick: () => state.dispatch(addText()) }),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Modify Text Box'),
      m('div.section-content', [
        // TODO : highlight when selected text is already centred
        // TODO : remove need for this with snapping
        help(
          'centre text',
          m(
            'button.double-width.text',
            {
              disabled: noTextSelected,
              onclick: () => state.dispatch(centreText()),
            },
            'Centre text'
          ),
          state.dispatch
        ),
        help(
          'edit text',
          m(
            'button.double-width.text',
            { disabled: noTextSelected, onclick: () => state.dispatch(editText()) },
            'Edit text'
          ),
          state.dispatch
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
                state.dispatch(
                  setTextX(parseFloat((e.target as HTMLInputElement).value))
                ),
              onchange: () => state.dispatch(commit()),
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
                state.dispatch(
                  setTextY(parseFloat((e.target as HTMLInputElement).value))
                ),
              onchange: () => state.dispatch(commit()),
            }),
            '%',
          ]),
        ]),
        state.dispatch
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
              onclick: () => state.dispatch(startPlayback()),
            },
            'Play from Beginning'
          ),
          state.dispatch
        ),
        help(
          'play from selection',
          m(
            'button.double-width.text',
            {
              disabled:
                state.isPlaying ||
                (state.selectedNotes.length === 0 && state.selectedBar === null),
              onclick: () => state.dispatch(startPlaybackAtSelection()),
            },
            'Play from Selection'
          ),
          state.dispatch
        ),
        help(
          'play looping selection',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying || state.selectedNotes.length === 0,
              onclick: () => state.dispatch(playbackLoopingSelection()),
            },
            'Play looped Selection'
          ),
          state.dispatch
        ),
        help(
          'stop',
          m(
            'button',
            {
              disabled: !state.isPlaying,
              onclick: () => state.dispatch(stopPlayback()),
            },
            'Stop'
          ),
          state.dispatch
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
                state.dispatch(
                  setPlaybackBpm(parseInt((e.target as HTMLInputElement).value))
                ),
            }),
            m('input#playback-bpm', {
              type: 'number',
              value: settings.bpm,
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setPlaybackBpm(parseInt((e.target as HTMLInputElement).value))
                ),
            }),
            'beats per minute',
          ]),
          state.dispatch
        ),
      ]),
    ]),
  ];

  const documentMenu = [
    m('section', [
      m('h2', 'Orientation'),
      m('div.section-content', [
        help(
          'landscape',
          m(
            'button',
            {
              class: `text double-width ${state.isLandscape ? ' highlighted' : ''}`,
              onclick: () => state.dispatch(landscape()),
            },
            'Landscape'
          ),
          state.dispatch
        ),
        help(
          'portrait',
          m(
            'button',
            {
              class: `text double-width ${state.isLandscape ? '' : ' highlighted'}`,
              onclick: () => state.dispatch(portrait()),
            },
            'Portrait'
          ),
          state.dispatch
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
                state.dispatch(
                  setPageNumberVisibility(e.target as HTMLInputElement)
                ),
            }),
          ]),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', 'Export'),
      m('div.section-content', [
        help(
          'export',
          m(
            'button.text.double-width',
            { onclick: () => state.dispatch(exportPDF()) },
            'Export to PDF'
          ),
          state.dispatch
        ),
        help(
          'export bww',
          m(
            'button.text.double-width',
            { onclick: () => state.dispatch(exportBWW()) },
            'Export to BWW'
          ),
          state.dispatch
        ),
        help(
          'download',
          m(
            'button.text.double-width',
            { onclick: () => state.dispatch(download()) },
            'Download PipeScore file'
          ),
          state.dispatch
        ),
      ]),
    ]),
  ];
  const settingsMenu = [
    m('section', [
      m('h2', 'Stave layout'),
      m('div.section-content', [setting('lineGap', 'Gap between lines')]),
    ]),
    m('section', [
      m('h2', 'Gracenote layout'),
      m('div.section-content', [
        setting('gapAfterGracenote', 'Gap after gracenote'),
      ]),
    ]),
    m('section', [
      m('h2', 'Margins'),
      m('div.section-content', [setting('margin', 'Margin')]),
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
              onclick: () => state.dispatch(toggleDoc()),
            }),
            state.dispatch
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

  const menuClass = (s: Menu): string => (s === state.currentMenu ? 'selected' : '');

  const pretty = (name: Menu): string => name.split('_').map(capitalise).join(' ');

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
  const showAudioWarning = state.loadingAudio && state.currentMenu === 'playback';
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
        onmousedown: () => state.dispatch(setMenu(name)),
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
          m('button', m('a[href=/help]', { target: '_blank' }, 'Help')),
          state.dispatch
        ),
        ...(state.canEdit
          ? [
              m(
                'span.save-text',
                { class: state.saved ? 'saved' : 'unsaved' },
                state.saved ? 'All changes saved!' : 'Unsaved changes'
              ),
              m(
                'button.save',
                { disabled: state.saved, onclick: () => state.dispatch(save()) },
                'Save'
              ),
            ]
          : []),
      ]
    : [
        menuHead('playback'),
        menuHead('document'),
        help(
          'help',
          m('button', m('a[href=/help]', { target: '_blank' }, 'Help')),
          state.dispatch
        ),
      ];

  return m('div', [
    m('div#ui', [
      m('div#headings', [
        help('home', m('button', m('a[href=/scores]', 'Home')), state.dispatch),
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
        }),
        state.dispatch
      ),
      m('section', [
        help(
          'delete',
          m('button.delete', {
            disabled: nothingSelected,
            onclick: () => state.dispatch(deleteSelection()),
          }),
          state.dispatch
        ),
        help(
          'copy',
          m('button#copy', {
            disabled: cantCopyPaste,
            onclick: () => state.dispatch(copy()),
          }),
          state.dispatch
        ),
        help(
          'paste',
          m('button#paste', {
            disabled: cantCopyPaste,
            onclick: () => state.dispatch(paste()),
          }),
          state.dispatch
        ),
        help(
          'undo',
          m('button#undo', {
            disabled: !state.canUndo,
            onclick: () => state.dispatch(undo()),
          }),
          state.dispatch
        ),
        help(
          'redo',
          m('button#redo', {
            disabled: !state.canRedo,
            onclick: () => state.dispatch(redo()),
          }),
          state.dispatch
        ),
      ]),
    ]),
  ]);
}
