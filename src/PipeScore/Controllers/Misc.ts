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

import renderScore from '../Score/view';

import dialogueBox from '../global/dialogueBox';

export function changeZoomLevel(zoom: number): ScoreEvent {
  return async (state: State) =>
    zoom !== state.ui.zoom
      ? viewChanged({ ...state, ui: { ...state.ui, zoom } })
      : noChange(state);
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
    const initialWidth = state.score.width;
    return shouldSave({
      ...state,
      ui: {
        ...state.ui,
        zoom: (state.ui.zoom * state.score.height) / state.score.width,
      },
      score: {
        ...state.score,
        width: state.score.height,
        height: initialWidth,
        textBoxes: state.score.textBoxes.map((text) => ({
          ...text,
          x:
            text.x === 'centre'
              ? 'centre'
              : (text.x / state.score.height) * state.score.width,
          y: (text.y / state.score.width) * state.score.height,
        })),
      },
    });
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
    patch(blankH, h('div', [renderScore(state.score, props)]));
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
        `<style>* { font-family: sans-serif; margin: 0; padding: 0; } @page { size: ${
          state.score.width > state.score.height ? 'landscape' : 'portrait'
        }; }</style>` + contents
      );
      popupWindow.print();
      popupWindow.document.close();
    }

    return noChange(state);
  };
}
