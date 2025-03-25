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
import { getLanguage } from '../../common/i18n';
import { Barline } from '../Barline';
import type { Dispatch } from '../Dispatch';
import {
  addMeasure,
  editBarTimeSignature,
  moveBarToNextLine,
  moveBarToPreviousLine,
  resetMeasureLength,
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
  updateLanguage,
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
  setHarmonyVolume,
  setPlaybackBpm,
  startPlayback,
  startPlaybackAtSelection,
  stopPlayback,
  updateInstrument,
} from '../Events/Playback';
import { copy, deleteSelection, paste } from '../Events/Selection';
import {
  addHarmonyStave,
  addHarmonyStaveToAll,
  addStave,
  deleteStave,
  removeHarmonyStave,
  resetStaveGap,
  setStaveGap,
} from '../Events/Stave';
import { addText, centreText, editText, setTextX, setTextY } from '../Events/Text';
import { addSecondTiming, addSingleTiming, editTimingText } from '../Events/Timing';
import { addTune, deleteTune, resetTuneGap, setTuneGap } from '../Events/Tune';
import type { IGracenote } from '../Gracenote';
import type { IMeasure } from '../Measure';
import type { INote } from '../Note';
import { Duration } from '../Note/notelength';
import type { IPreview } from '../Preview';
import {
  NotePreview,
  ReactiveGracenotePreview,
  SingleGracenotePreview,
} from '../Preview/impl';
import type { IStave } from '../Stave';
import { minStaveGap } from '../Stave/view';
import type { IMovableTextBox } from '../TextBox';
import type { ITiming } from '../Timing';
import type { Documentation } from '../Translations';
import { text } from '../Translations/current';
import type { ITune } from '../Tune';
import { onMobile } from '../global/browser';
import { help } from '../global/docs';
import { Instrument } from '../global/instrument';
import { Relative } from '../global/relativeLocation';
import { type Settings, settings } from '../global/settings';
import type { Menu } from './model';

export interface UIState {
  saved: boolean;
  canEdit: boolean;
  canSave: boolean;
  canUndo: boolean;
  canRedo: boolean;
  loggedIn: boolean;
  loadingAudio: boolean;
  isPlaying: boolean;
  selectedGracenote: IGracenote | null;
  selectedStaves: IStave[];
  selectedMeasures: IMeasure[];
  selectedNotes: INote[];
  selectedTune: ITune | null;
  selectedText: IMovableTextBox | null;
  selectedTiming: ITiming | null;
  firstTune: ITune | null;
  showingPageNumbers: boolean;
  preview: IPreview | null;
  isLandscape: boolean;
  currentMenu: Menu;
  docs: string | null;
  zoomLevel: number;
  dispatch: Dispatch;
}

function setZoomLevel(e: Event, dispatch: Dispatch) {
  const element = e.target;
  if (element instanceof HTMLInputElement) {
    const newZoomLevel = Number.parseInt(element.value, 10);
    if (!Number.isNaN(newZoomLevel)) {
      dispatch(changeZoomLevel(newZoomLevel));
    }
  }
}

export default function render(state: UIState): m.Children {
  const canCopyPaste = state.selectedTune !== null;
  const inputtingNatural =
    state.preview instanceof NotePreview && state.preview.natural();
  const inputtingNotes = state.preview !== null;

  const notesSelected = state.selectedNotes.length > 0;
  const barsSelected = state.selectedMeasures.length > 0;
  const stavesSelected = state.selectedStaves.length > 0;
  const tuneSelected = state.selectedTune !== null;
  const timingSelected = state.selectedTiming !== null;
  const textSelected = state.selectedText !== null;
  const gracenoteSelected = state.selectedGracenote !== null;
  const anythingSelected =
    tuneSelected || timingSelected || textSelected || gracenoteSelected;

  const isCurrentNoteInput = (length: Duration) =>
    state.preview instanceof NotePreview &&
    state.preview.length().sameNoteLengthName(length);

  const allNotes = (pred: (note: INote) => boolean) =>
    notesSelected && state.selectedNotes.every(pred);

  const allBars = (pred: (bar: IMeasure) => boolean) =>
    barsSelected && state.selectedMeasures.every(pred);

  const noteInputButton = (length: Duration) =>
    help(
      length as keyof Documentation,
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

  const gracenoteInput = (name: keyof Documentation) =>
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
    notesSelected &&
    (state.selectedNotes.length === 1
      ? state.selectedNotes[0].isTied()
      : state.selectedNotes.slice(1).every((note) => note.isTied()));

  const naturalAlready = allNotes((note) => note.natural());

  if (onMobile()) {
    return mobileView(state);
  }

  const noteMenu = [
    m('section', [
      m('h2', text('noteMenu')),
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
      m('h2', text('modifyNote')),
      m('div.section-content', [
        help(
          'dot',
          m(
            'button',
            {
              disabled: !(inputtingNotes || notesSelected),
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
            disabled: !notesSelected,
            class: tied ? 'highlighted' : 'not-highlighted',
            onclick: () => state.dispatch(tieSelectedNotes()),
          }),
          state.dispatch
        ),
        help(
          'triplet',
          m('button#triplet', {
            disabled: !notesSelected,
            onclick: () => state.dispatch(toggleTriplet()),
          }),
          state.dispatch
        ),
        help(
          'natural',
          m('button#natural', {
            disabled: !(inputtingNotes || notesSelected),
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
      m('h2', text('addGracenote')),
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

  const startBarClass = (type: Barline) =>
    allBars((bar) => bar.startBarline() === type)
      ? 'textual highlighted top'
      : 'textual top';
  const endBarClass = (type: Barline) =>
    allBars((bar) => bar.endBarline() === type)
      ? 'textual highlighted bottom'
      : 'textual bottom';

  const barMenu = [
    m('section', [
      m('h2', text('addBar')),
      m(
        'div.section-content',
        m('div.section-content.vertical', [
          help(
            'add-bar-before',
            m(
              'button.textual',
              {
                disabled: !tuneSelected,
                onclick: () => state.dispatch(addMeasure(Relative.before)),
              },
              text('addBarBefore')
            ),
            state.dispatch
          ),
          help(
            'add-bar-after',
            m(
              'button.textual',
              {
                disabled: !tuneSelected,
                onclick: () => state.dispatch(addMeasure(Relative.after)),
              },
              text('addBarAfter')
            ),
            state.dispatch
          ),
        ])
      ),
    ]),
    m('section', [
      m('h2', text('addLeadIn')),
      m(
        'div.section-content',
        m(
          'div.section-content',
          m('div.section-content.vertical', [
            help(
              'add-lead-in-before',
              m(
                'button.textual',
                {
                  disabled: !tuneSelected,
                  onclick: () => state.dispatch(addMeasure(Relative.before)),
                },
                text('addLeadInBefore')
              ),
              state.dispatch
            ),
            help(
              'add-lead-in-after',
              m(
                'button.textual',
                {
                  disabled: !tuneSelected,
                  onclick: () => state.dispatch(addMeasure(Relative.after)),
                },
                text('addLeadInAfter')
              ),
              state.dispatch
            ),
          ])
        )
      ),
    ]),
    m('section', [
      m('h2', text('modifyBar')),
      m('div.section-content.vertical', [
        help(
          'edit-bar-time-signature',
          m(
            'button.textual',
            { onclick: () => state.dispatch(editBarTimeSignature()) },
            text('editTimeSignature')
          ),
          state.dispatch
        ),
        help(
          'reset-bar-length',
          m(
            'button.textual',
            {
              disabled: !barsSelected,
              onclick: () => state.dispatch(resetMeasureLength()),
            },
            text('resetBarLength')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', { style: 'display: inline' }, text('modifyBarlines')),
      m('div.section-content.vertical', [
        m('div.horizontal', [
          m('label', `${text('start')}:  `),
          help(
            'normal-barline',
            m(
              'button',
              {
                disabled: !barsSelected,
                class: startBarClass(Barline.normal),
                style: 'margin-left: .5rem;',
                onclick: () => state.dispatch(setBarline('start', Barline.normal)),
              },
              text('normalBarline')
            ),
            state.dispatch
          ),
          help(
            'repeat-barline',
            m(
              'button',
              {
                disabled: !barsSelected,
                class: startBarClass(Barline.repeat),
                onclick: () => state.dispatch(setBarline('start', Barline.repeat)),
              },
              text('repeatBarline')
            ),
            state.dispatch
          ),
          help(
            'part-barline',
            m(
              'button',
              {
                disabled: !barsSelected,
                class: startBarClass(Barline.part),
                onclick: () => state.dispatch(setBarline('start', Barline.part)),
              },
              text('partBarline')
            ),
            state.dispatch
          ),
        ]),
        m('div.horizontal', [
          m('label', `${text('end')}:  `),
          help(
            'normal-barline',
            m(
              'button',
              {
                disabled: !barsSelected,
                class: endBarClass(Barline.normal),
                style: 'margin-left: .5rem;',
                onclick: () => state.dispatch(setBarline('end', Barline.normal)),
              },
              text('normalBarline')
            ),
            state.dispatch
          ),
          help(
            'repeat-barline',
            m(
              'button',
              {
                disabled: !barsSelected,
                class: endBarClass(Barline.repeat),
                onclick: () => state.dispatch(setBarline('end', Barline.repeat)),
              },
              text('repeatBarline')
            ),
            state.dispatch
          ),
          help(
            'part-barline',
            m(
              'button',
              {
                disabled: !barsSelected,
                class: endBarClass(Barline.part),
                onclick: () => state.dispatch(setBarline('end', Barline.part)),
              },
              text('partBarline')
            ),
            state.dispatch
          ),
        ]),
      ]),
    ]),
    m('section', [
      m('h2', text('moveBar')),
      m('div.section-content.vertical', [
        help(
          'move-bar-to-previous-line',
          m(
            'button.textual',
            {
              disabled: !barsSelected,
              onclick: () => state.dispatch(moveBarToPreviousLine()),
            },
            text('moveToPreviousStave')
          ),
          state.dispatch
        ),
        help(
          'move-bar-to-next-line',
          m(
            'button.textual',
            {
              disabled: !barsSelected,
              onclick: () => state.dispatch(moveBarToNextLine()),
            },
            text('moveToNextStave')
          ),
          state.dispatch
        ),
      ]),
    ]),
  ];

  const secondTimingMenu = [
    m('section', [
      m('h2', text('addTiming')),
      m('div.section-content', [
        help(
          'second-timing',
          m(
            'button',
            { onclick: () => state.dispatch(addSecondTiming()) },
            text('addSecondTiming')
          ),
          state.dispatch
        ),
        help(
          'single-timing',
          m(
            'button',
            { onclick: () => state.dispatch(addSingleTiming()) },
            text('addSingleTiming')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('modifyTiming')),
      m('div.section-content', [
        help(
          'edit-second-timing',
          m(
            'button.double-width.text',
            {
              disabled: !timingSelected,
              onclick: () =>
                state.selectedTiming &&
                state.dispatch(editTimingText(state.selectedTiming)),
            },
            text('editTimingText')
          ),
          state.dispatch
        ),
      ]),
    ]),
  ];

  const staveMenu = [
    m('section', [
      m('h2', text('addStave')),
      m('div.section-content', [
        help(
          'add-stave-before',
          m(
            'button.add.text',
            { onclick: () => state.dispatch(addStave(Relative.before)) },
            text('before')
          ),
          state.dispatch
        ),
        help(
          'add-stave-after',
          m(
            'button.add.text',
            { onclick: () => state.dispatch(addStave(Relative.after)) },
            text('after')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('modifyStave')),
      m('div.section-content', [
        help(
          'set-stave-gap',
          m('label', [
            `${text('adjustStaveGap')}: `,
            m('input', {
              type: 'number',
              min: minStaveGap,
              value: settings.staveGap,
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setStaveGap(
                    Number.parseFloat((e.target as HTMLInputElement).value) || 0
                  )
                ),
              onchange: () => state.dispatch(commit()),
            }),
          ]),
          state.dispatch
        ),
        help(
          'reset-stave-gap',
          m(
            'button.textual',
            { onclick: () => state.dispatch(resetStaveGap()) },
            text('reset')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('deleteStave')),
      m('div.section-content', [
        help(
          'delete-stave',
          m(
            'button.text',
            {
              disabled: !stavesSelected,
              onclick: () => state.dispatch(deleteStave()),
            },
            text('delete')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('harmonyStave')),
      m('div.section-content.vertical', [
        help(
          'add-harmony',
          m(
            'button.textual',
            {
              disabled: !stavesSelected,
              onclick: () => state.dispatch(addHarmonyStave()),
            },
            text('addHarmony')
          ),
          state.dispatch
        ),
        help(
          'add-harmony-to-all',
          m(
            'button.textual',
            { onclick: () => state.dispatch(addHarmonyStaveToAll()) },
            text('addHarmonyToAll')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('deleteHarmony')),
      m('div.section-content', [
        help(
          'remove-harmony',
          m(
            'button.text',
            {
              disabled: !stavesSelected,
              onclick: () => state.dispatch(removeHarmonyStave()),
            },
            text('delete')
          ),
          state.dispatch
        ),
      ]),
    ]),
  ];

  const tuneMenu = [
    m('section', [
      m('h2', text('addTune')),
      m('div.section-content', [
        help(
          'add-tune-before',
          m(
            'button.add.text',
            { onclick: () => state.dispatch(addTune(Relative.before)) },
            text('before')
          ),
          state.dispatch
        ),
        help(
          'add-tune-after',
          m(
            'button.add.text',
            { onclick: () => state.dispatch(addTune(Relative.after)) },
            text('after')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('modifyTune')),
      m('div.section-content', [
        help(
          'set-tune-gap',
          m('label', [
            `${text('adjustGapBeforeTune')}: `,
            m('input', {
              type: 'number',
              disabled: !(tuneSelected || state.firstTune),
              min: 0,
              value: (state.selectedTune || state.firstTune)?.tuneGap(),
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setTuneGap(
                    Number.parseFloat((e.target as HTMLInputElement).value) || 0
                  )
                ),
              onchange: () => state.dispatch(commit()),
            }),
          ]),
          state.dispatch
        ),
        help(
          'reset-tune-gap',
          m(
            'button.textual',
            {
              disabled: !(tuneSelected || state.firstTune),
              onclick: () => state.dispatch(resetTuneGap()),
            },
            text('reset')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('deleteTune')),
      m('div.section-content', [
        help(
          'delete-tune',
          m(
            'button.text',
            {
              disabled: !tuneSelected,
              onclick: () => state.dispatch(deleteTune()),
            },
            text('delete')
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
      const previousValue = Number.parseFloat(element.value) || 0;
      if (previousValue === value) {
        return element.value;
      }
    }
    return value.toString();
  };

  const textMenu = [
    m('section', [
      m('h2', text('addTextBox')),
      m('div.section-content', [
        help(
          'add-text',
          m('button.add', { onclick: () => state.dispatch(addText()) }),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('modifyTextBox')),
      m('div.section-content', [
        // TODO : highlight when selected text is already centred
        // TODO : remove need for this with snapping
        help(
          'centre-text',
          m(
            'button.double-width.text',
            {
              disabled: !textSelected,
              onclick: () => state.dispatch(centreText()),
            },
            text('centreText')
          ),
          state.dispatch
        ),
        help(
          'edit-text',
          m(
            'button.double-width.text',
            { disabled: !textSelected, onclick: () => state.dispatch(editText()) },
            text('editText')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('setTextBoxPosition')),
      help(
        'set-text-coords',
        m('div.section-content.vertical', [
          m('label.text-coord', [
            `${text('x')}: `,
            m('input#text-x-coord', {
              disabled: !textSelected,
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
                  setTextX(
                    Number.parseFloat((e.target as HTMLInputElement).value) || 0
                  )
                ),
              onchange: () => state.dispatch(commit()),
            }),
            '%',
          ]),
          m('label.text-coord', [
            `${text('y')}: `,
            m('input#text-y-coord', {
              disabled: !textSelected,
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
                  setTextY(
                    Number.parseFloat((e.target as HTMLInputElement).value) || 0
                  )
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
      m('h2', text('controls')),
      m('div.section-content', [
        help(
          'play',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying,
              onclick: () => state.dispatch(startPlayback()),
            },
            text('playFromBeginning')
          ),
          state.dispatch
        ),
        help(
          'play-from-selection',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying || !barsSelected,
              onclick: () => state.dispatch(startPlaybackAtSelection()),
            },
            text('playFromSelection')
          ),
          state.dispatch
        ),
        help(
          'play-looping-selection',
          m(
            'button.double-width.text',
            {
              disabled: state.isPlaying || state.selectedNotes.length === 0,
              onclick: () => state.dispatch(playbackLoopingSelection()),
            },
            text('playLoopedSelection')
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
            text('stop')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('playbackOptions')),
      m('div.section-content', [
        help(
          'playback-speed',
          m('label#playback-speed-label', [
            m('input', {
              type: 'range',
              min: '30',
              max: '150',
              step: '1',
              value: settings.bpm,
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setPlaybackBpm(
                    Number.parseInt((e.target as HTMLInputElement).value)
                  )
                ),
            }),
            m('input#playback-bpm', {
              type: 'number',
              value: settings.bpm,
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setPlaybackBpm(
                    Number.parseInt((e.target as HTMLInputElement).value)
                  )
                ),
            }),
            text('beatsPerMinute'),
          ]),
          state.dispatch
        ),
        help(
          'harmony-volume',
          m('label#harmony-volume-label', [
            m('input', {
              type: 'range',
              min: '0',
              max: '175',
              step: '1',
              value: settings.harmonyVolume * 100,
              oninput: (e: InputEvent) =>
                state.dispatch(
                  setHarmonyVolume(
                    Number.parseInt((e.target as HTMLInputElement).value)
                  )
                ),
            }),
            text('harmonyVolume'),
          ]),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('instrument')),

      m(
        'label',
        m('input', {
          type: 'radio',
          name: 'instrument',
          disabled: state.isPlaying,
          checked: settings.instrument === Instrument.GHB,
          onchange: () => state.dispatch(updateInstrument(Instrument.GHB)),
          value: '',
        }),
        text('instrumentPipes')
      ),
      m(
        'label',
        m('input', {
          type: 'radio',
          name: 'instrument',
          disabled: state.isPlaying,
          checked: settings.instrument === Instrument.Chanter,
          onchange: () => state.dispatch(updateInstrument(Instrument.Chanter)),
          value: 'pc',
        }),
        text('instrumentPC')
      ),
    ]),
  ];

  const documentMenu = [
    m('section', [
      m('h2', text('orientation')),
      m('div.section-content', [
        help(
          'landscape',
          m(
            'button',
            {
              class: `text double-width ${state.isLandscape ? ' highlighted' : ''}`,
              onclick: () => state.dispatch(landscape()),
            },
            text('landscape')
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
            text('portrait')
          ),
          state.dispatch
        ),
      ]),
    ]),
    m('section', [
      m('h2', text('pageNumbers')),
      m('div.section-content', [
        help(
          'page-numbers',
          m('label', [
            `${text('showPageNumbers')}: `,
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
      m('h2', text('export')),
      m('div.section-content', [
        help(
          'export',
          m(
            'button.text.double-width',
            { onclick: () => state.dispatch(exportPDF()) },
            text('exportPDF')
          ),
          state.dispatch
        ),
        help(
          'export-bww',
          m(
            'button.text.double-width',
            { onclick: () => state.dispatch(exportBWW()) },
            text('exportBWW')
          ),
          state.dispatch
        ),
        help(
          'download',
          m(
            'button.text.double-width',
            { onclick: () => state.dispatch(download()) },
            text('download')
          ),
          state.dispatch
        ),
      ]),
    ]),
  ];
  const settingsMenu = [
    m('section', [
      m('h2', text('staveLayout')),
      m('div.section-content', [setting('lineGap', text('gapBetweenLines'))]),
      m('div.section-content', [setting('harmonyGap', text('harmonyGap'))]),
    ]),
    m('section', [
      m('h2', text('gracenoteLayout')),
      m('div.section-content', [
        setting('gapAfterGracenote', text('gapAfterGracenote')),
      ]),
    ]),
    m('section', [
      m('h2', text('margins')),
      m('div.section-content', [setting('margin', text('margin'))]),
    ]),
    m('section', [
      m('h2', text('view')),
      m('div.section-content', [
        m('label', [
          text('disableHelp'),
          help(
            'disable-help',
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
    tune: tuneMenu,
    text: textMenu,
    settings: settingsMenu,
    playback: playBackMenu,
    document: documentMenu,
  };

  const menuClass = (s: Menu): string => (s === state.currentMenu ? 'selected' : '');

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

  const menuHead = (name: Menu, title: string) =>
    m(
      'button',
      {
        class: menuClass(name),
        onmousedown: () => state.dispatch(setMenu(name)),
      },
      [title]
    );

  const language = getLanguage();

  const headings = state.canEdit
    ? [
        help(
          'home',
          m('button', m('a[href=/scores]', text('homeMenu'))),
          state.dispatch
        ),
        menuHead('note', text('noteMenu')),
        menuHead('gracenote', text('gracenoteMenu')),
        menuHead('bar', text('barMenu')),
        menuHead('second_timing', text('secondTimingMenu')),
        menuHead('stave', text('staveMenu')),
        menuHead('tune', text('tuneMenu')),
        menuHead('text', text('textMenu')),
        menuHead('playback', text('playbackMenu')),
        menuHead('document', text('documentMenu')),
        menuHead('settings', text('settingsMenu')),
        help(
          'help',
          m('button', m('a[href=/help]', { target: '_blank' }, text('helpMenu'))),
          state.dispatch
        ),
        m(
          'select',
          {
            style: 'padding-left: 1rem',
            onchange: (e: Event) => state.dispatch(updateLanguage(e)),
          },
          [
            m(
              'option',
              { name: 'lang', value: 'ENG', selected: language === 'ENG' },
              '🇬🇧'
            ),
            m(
              'option',
              { name: 'lang', value: 'FRA', selected: language === 'FRA' },
              '🇫🇷'
            ),
          ]
        ),

        ...(state.canSave
          ? [
              m(
                'span.save-text',
                { class: state.saved ? 'saved' : 'unsaved' },
                state.saved ? text('allChangesSaved') : text('unsavedChanges')
              ),
              help(
                'save',
                m(
                  'button.save',
                  { disabled: state.saved, onclick: () => state.dispatch(save()) },
                  text('save')
                ),
                state.dispatch
              ),
            ]
          : []),
      ]
    : [
        help(
          'home',
          m('button', m('a[href=/scores]', text('homeMenu'))),
          state.dispatch
        ),
        menuHead('playback', text('playbackMenu')),
        menuHead('document', text('documentMenu')),
        help(
          'help',
          m('button', m('a[href=/help]', { target: '_blank' }, 'Help')),
          state.dispatch
        ),
      ];

  return m('div', [
    m('div#ui', [
      m('div#headings', headings),
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
          oninput: (e: Event) => setZoomLevel(e, state.dispatch),
        }),
        state.dispatch
      ),
      m('section', [
        help(
          'delete',
          m('button.delete', {
            disabled: !anythingSelected,
            onclick: () => state.dispatch(deleteSelection()),
          }),
          state.dispatch
        ),
        help(
          'copy',
          m('button#copy', {
            disabled: !canCopyPaste,
            onclick: () => state.dispatch(copy()),
          }),
          state.dispatch
        ),
        help(
          'paste',
          m('button#paste', {
            disabled: !canCopyPaste,
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

function mobileView(state: UIState): m.Children {
  return m('div', [
    m(
      'div#ui',
      m('div#topbar', [
        m('section', [
          m(
            'div.section-content',
            { class: state.isPlaying ? 'play-button' : 'stop-button' },
            [
              help(
                state.isPlaying ? 'stop' : 'play',
                m('button', {
                  onclick: () =>
                    state.dispatch(
                      state.isPlaying
                        ? stopPlayback()
                        : state.selectedTune === null
                          ? startPlayback()
                          : startPlaybackAtSelection()
                    ),
                  class: state.isPlaying ? 'stop-button' : 'play-button',
                }),
                state.dispatch
              ),
            ]
          ),
        ]),
        m('div.section-content', [
          m('input', {
            type: 'range',
            min: '30',
            max: '150',
            step: '1',
            value: settings.bpm,
            oninput: (e: InputEvent) =>
              state.dispatch(
                setHarmonyVolume(
                  Number.parseInt((e.target as HTMLInputElement).value)
                )
              ),
          }),
          help(
            'playback-speed',
            m('label#playback-speed-label', [
              m('input#playback-bpm', {
                type: 'number',
                value: settings.bpm,
                oninput: (e: InputEvent) =>
                  state.dispatch(
                    setHarmonyVolume(
                      Number.parseInt((e.target as HTMLInputElement).value)
                    )
                  ),
              }),
              'beats per minute',
            ]),
            state.dispatch
          ),
          m('section', [
            m('h2', text('instrument')),

            m(
              'label',
              m('input', {
                type: 'radio',
                name: 'instrument',
                disabled: state.isPlaying,
                checked: settings.instrument === Instrument.GHB,
                onchange: () => state.dispatch(updateInstrument(Instrument.GHB)),
                value: '',
              }),
              text('instrumentPipes')
            ),
            m(
              'label',
              m('input', {
                type: 'radio',
                name: 'instrument',
                disabled: state.isPlaying,
                checked: settings.instrument === Instrument.Chanter,
                onchange: () => state.dispatch(updateInstrument(Instrument.Chanter)),
                value: 'pc',
              }),
              text('instrumentPC')
            ),
          ]),
        ]),
        m('div.section-content', [
          help(
            'export',
            m(
              'button.text',
              { onclick: () => state.dispatch(exportPDF()) },
              'Download PDF'
            ),
            state.dispatch
          ),
        ]),
      ])
    ),
    m('div#doc.partial', [
      help(
        'zoom',
        m('input#zoom-level', {
          type: 'range',
          min: '10',
          max: '200',
          step: '2',
          value: state.zoomLevel,
          oninput: (e: Event) => setZoomLevel(e, state.dispatch),
        }),
        state.dispatch
      ),
    ]),
  ]);
}
