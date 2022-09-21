/*
  Controller for miscellaneous events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, Update } from './Controller';
import { State } from '../State';
import { Menu } from '../UI/model';
import m from 'mithril';

import dialogueBox from '../global/dialogueBox';
import { stopInputtingNotes } from './Note';
import { settings, Settings } from '../global/settings';
import { Score } from '../Score';
import { setupAudio } from '../Playback';

export function setPageNumberVisibility(element: HTMLInputElement): ScoreEvent {
  return async (state: State) => {
    const visibility = element.checked;
    state.score.showNumberOfPages = Boolean(visibility);
    return Update.ShouldSave;
  };
}
export function editText(
  value: string,
  cb: (text: string) => void
): ScoreEvent {
  return async () => {
    await dialogueBox(
      [m('label', ['Text:', m('input', { type: 'text', value })])],
      (form) =>
        (form.querySelector('input[type="text"]') as HTMLInputElement).value,
      value
    ).then((text) => cb(text));

    return Update.ShouldSave;
  };
}
export function addPage(): ScoreEvent {
  return async (state: State) => {
    state.score.numberOfPages += 1;
    return Update.ShouldSave;
  };
}
export function removePage(): ScoreEvent {
  return async (state: State) => {
    let sure = true;
    if (state.score.numberOfPages <= 1) return Update.NoChange;
    if (state.score.hasStuffOnLastPage()) {
      sure =
        confirm(
          'Are you sure you want to delete the last page? All the music on the last page will be deleted.\nPress Enter to confirm, or Esc to stop.'
        ) || false;
    }

    if (sure) {
      state.score.deletePage();
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}
export function changeSetting<T extends keyof Settings>(
  setting: T,
  target: HTMLInputElement
): ScoreEvent {
  return async () => {
    const v = parseFloat(target.value);
    target.value = settings.validate(setting, v).toString();
    settings[setting] = v as Settings[T];
    return Update.ViewChanged;
  };
}
export function changeZoomLevel(zoom: number): ScoreEvent {
  return async (state: State) => {
    if (state.score.zoom !== zoom) {
      state.score.zoom = zoom;
      return Update.ViewChanged;
    }
    return Update.NoChange;
  };
}

export function setMenu(menu: Menu): ScoreEvent {
  // Set demoNote/inputGracenote because we don't want to have them showing when another menu is up
  return async (state: State) => {
    state.ui.menu = menu;
    stopInputtingNotes(state);
    if (state.ui.menu === 'playback') setupAudio();
    return Update.ViewChanged;
  };
}
export function landscape(): ScoreEvent {
  return async (state: State) => {
    return state.score.makeLandscape();
  };
}
export function portrait(): ScoreEvent {
  return async (state: State) => {
    return state.score.makePortrait();
  };
}

export function undo(): ScoreEvent {
  return async (state: State) => {
    // TODO is this check necessary?
    if (state.history.past.length > 1) {
      const last = state.history.past.pop();
      const beforeLast = state.history.past.pop();
      if (beforeLast) {
        state.selection = null;
        stopInputtingNotes(state);
        state.score = Score.fromJSON(JSON.parse(beforeLast));
        state.history = {
          ...state.history,
          future: last ? [...state.history.future, last] : state.history.future,
        };
        return Update.ShouldSave;
      }
    }
    return Update.NoChange;
  };
}

export function redo(): ScoreEvent {
  return async (state: State) => {
    const last = state.history.future.pop();
    if (last) {
      state.selection = null;
      stopInputtingNotes(state);
      state.score = Score.fromJSON(JSON.parse(last));
      return Update.ShouldSave;
    }
    return Update.NoChange;
  };
}

export function print(): ScoreEvent {
  return async (state: State) => {
    // Printing is a bit annoying on browsers - to print the SVG element, a new window is created
    // and that window is printed
    // That doesn't allow all the control I need though - e.g. margins are there by default which
    // makes it uncentred, and that can't be changed in JS. So I'm just adding a plea to the user to fix it :)

    const blankEl = document.createElement('div');
    const props = {
      justAddedNote: false,
      selection: null,
      selectedSecondTiming: null,
      noteState: {
        dragged: null,
        inputtingNotes: false,
        selectedTripletLine: null,
      },
      gracenoteState: {
        dragged: null,
        selected: null,
      },
      textBoxState: { selectedText: null },
      demoNote: null,
      dispatch: () => null,
    };

    state.score.zoom = 100;
    // Patch it onto a new element with none of the state (e.g. zoom, selected elements)
    m.render(blankEl, m('div', state.score.render(props)));
    const contents = blankEl.querySelector('div')?.innerHTML;

    // TODO this might have fixed somehow?
    await dialogueBox(
      [
        m('p', [
          'When printing, please ensure you set ',
          m('span', { style: 'font-family: monospace;' }, 'Margins'),
          'to',
          m('span', { style: 'font-family: monospace;' }, 'None'),
          '.',
        ]),
        m(
          'p',
          'This means your browser will use the PipeScore margins, rather than its own automatic margins, which will be off-centre.'
        ),
      ],
      () => null,
      null,
      false
    );
    const popupWindow = window.open(
      '',
      'print_preview',
      `width=${state.score.width()},height=${state.score.height()},scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,resizable=no`
    );
    if (popupWindow) {
      popupWindow.document.open();
      popupWindow.document.write(
        `<style>* { font-family: sans-serif; margin: 0; padding: 0; } @page { size: A4 ${state.score.orientation()}; margin: 0; }</style>` +
          contents
      );
      popupWindow.print();
      popupWindow.document.close();
    }

    return Update.NoChange;
  };
}
