/*
  Controller for miscellaneous events
  Copyright (C) 2021 Archie Maclean
*/
import {
  ScoreEvent,
  shouldSave,
  noChange,
  viewChanged,
  removeState,
} from './Controller';
import { State } from '../State';

import { Menu } from '../UI/model';

import { h, hFrom } from '../../render/h';
import patch from '../../render/vdom';

import dialogueBox from '../global/dialogueBox';

export function changeZoomLevel(zoom: number): ScoreEvent {
  return async (state: State) => {
    if (state.score.zoom !== zoom) {
      state.score.zoom = zoom;
      return viewChanged(state);
    }
    return noChange(state);
  };
}

export function setMenu(menu: Menu): ScoreEvent {
  // Set demoNote/inputGracenote because we don't want to have them showing when another menu is up
  return async (state: State) =>
    viewChanged({
      ...state,
      ui: { ...state.ui, menu },
      note: { ...state.note, demo: null },
      gracenote: { ...state.gracenote, input: null },
    });
}

export function toggleLandscape(): ScoreEvent {
  return async (state: State) => {
    state.score.toggleLandscape();
    return shouldSave(state);
  };
}

export function undo(): ScoreEvent {
  return async (state: State) => {
    // TODO is this check necessary?
    if (state.history.past.length > 1) {
      const last = state.history.past.pop();
      const beforeLast = state.history.past.pop();
      if (beforeLast) {
        return shouldSave({
          ...removeState(state),
          score: JSON.parse(beforeLast),
          history: {
            ...state.history,
            future: last
              ? [...state.history.future, last]
              : state.history.future,
          },
        });
      }
    }
    return noChange(state);
  };
}

export function redo(): ScoreEvent {
  return async (state: State) => {
    const last = state.history.future.pop();
    if (last) {
      return shouldSave({
        ...removeState(state),
        score: JSON.parse(last),
      });
    }
    return noChange(state);
  };
}

export function print(): ScoreEvent {
  return async (state: State) => {
    // Printing is a bit annoying on browsers - to print the SVG element, a new window is created
    // and that window is printed
    // That doesn't allow all the control I need though - e.g. margins are there by default which
    // makes it uncentred, and that can't be changed in JS. So I'm just adding a plea to the user to fix it :)

    const blankEl = document.createElement('div');
    const blankH = hFrom(blankEl);
    const props = {
      zoomLevel: 100,
      selection: null,
      selectedSecondTiming: null,
      noteState: { dragged: null, inputtingNotes: false },
      gracenoteState: { dragged: null, selected: null },
      textBoxState: { selectedText: null },
      demoNote: null,
      dispatch: () => null,
    };

    // Patch it onto a new element with none of the state (e.g. zoom, selected elements)
    patch(blankH, h('div', [state.score.render(props)]));
    const contents = blankEl.innerHTML;

    await dialogueBox(
      [
        h('p', [
          "When printing, please ensure you set 'Margins' to 'None', for best results.",
        ]),
        h('p', [
          'This means your browser will use the PipeScore margins, rather than its own automatic margins, which will be off-centre.',
        ]),
      ],
      () => null,
      null,
      false
    );
    const popupWindow = window.open(
      '',
      '_blank',
      'scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no,resizable'
    );
    if (popupWindow) {
      popupWindow.document.open();
      popupWindow.document.write(
        `<style>* { font-family: sans-serif; margin: 0; padding: 0; } @page { size: ${state.score.orientation()}; }</style>` +
          contents
      );
      popupWindow.print();
      popupWindow.document.close();
    }

    return noChange(state);
  };
}
