import {
  ScoreEvent,
  shouldSave,
  noChange,
  viewChanged,
  removeState,
  currentBar,
} from './Event';
import { State } from '../State';

import { SecondTimingModel } from '../SecondTiming/model';
import { Menu } from '../UI/model';

import SecondTiming from '../SecondTiming/functions';

import { h, hFrom } from '../../render/h';
import patch from '../../render/vdom';

import renderScore from '../Score/view';

import dialogueBox from '../global/dialogueBox';
import { ID } from '../global/types';

export function addSecondTiming(): ScoreEvent {
  return async (state: State) => {
    if (state.selection) {
      const { bar: start } = currentBar(state.selection.start, state.score);
      let middle: ID | null = null;
      let end: ID | null = null;
      let started = false;
      all: for (const stave of state.score.staves) {
        for (const bar of stave.bars) {
          if (started) {
            middle = bar.id;
            end = bar.id;
            break all;
          }
          if (bar === start) {
            started = true;
          }
        }
      }
      if (middle && end) {
        const newSecondTiming = SecondTiming.init(start.id, middle, end);
        if (SecondTiming.isValid(newSecondTiming, state.score.secondTimings)) {
          return shouldSave({
            ...state,
            score: {
              ...state.score,
              secondTimings: [...state.score.secondTimings, newSecondTiming],
            },
          });
        }
      }
    }
    return noChange(state);
  };
}

export function clickSecondTiming(
  secondTiming: SecondTimingModel,
  part: 'start' | 'middle' | 'end'
): ScoreEvent {
  return async (state: State) =>
    viewChanged({
      ...state,
      draggedSecondTiming: { secondTiming, dragged: part },
      selectedSecondTiming: secondTiming,
    });
}

export function changeZoomLevel(zoomLevel: number): ScoreEvent {
  return async (state: State) =>
    zoomLevel !== state.zoomLevel
      ? viewChanged({ ...state, zoomLevel })
      : noChange(state);
}

export function setMenu(menu: Menu): ScoreEvent {
  // Set demoNote/inputGracenote because we don't want to have them showing when another menu is up
  return async (state: State) =>
    viewChanged({
      ...state,
      currentMenu: menu,
      demoNote: null,
      inputGracenote: null,
    });
}

export function toggleLandscape(): ScoreEvent {
  return async (state: State) => {
    const initialWidth = state.score.width;
    return shouldSave({
      ...state,
      zoomLevel: (state.zoomLevel * state.score.height) / state.score.width,
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
    if (state.history.length > 1) {
      const last = state.history.pop();
      const beforeLast = state.history.pop();
      if (beforeLast) {
        return shouldSave({
          ...removeState(state),
          score: JSON.parse(beforeLast),
          future: last ? [...state.future, last] : state.future,
        });
      }
    }
    return noChange(state);
  };
}

export function redo(): ScoreEvent {
  return async (state: State) => {
    const last = state.future.pop();
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
