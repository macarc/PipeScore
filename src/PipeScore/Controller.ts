/*
  Handles input and events for PipeScore
  Copyright (C) 2021 Archie Maclean
*/

import patch from '../render/vdom';
import { h, hFrom } from '../render/h';
import { ScoreEvent, Update } from './Controllers/Controller';
import { updateDemoNote } from './Controllers/Note';
import { mouseUp, mouseDrag } from './Controllers/Mouse';

import { State } from './State';
import { Score } from './Score/model';

import renderUI from './UI/view';

import Documentation from './Documentation';

let state: State = {
  justClickedNote: false,
  note: { dragged: null, demo: null },
  gracenote: { dragged: null, selected: null, input: null },
  playback: { bpm: 100 },
  ui: { menu: 'normal' },
  draggedText: null,
  draggedSecondTiming: null,
  doc: { show: true, current: null },
  clipboard: null,
  selection: null,
  score: new Score(),
  history: { past: [], future: [] },
  view: { score: null, ui: null },
};

let save: (score: Score) => void = () => null;

export async function dispatch(event: ScoreEvent): Promise<void> {
  const res = await event(state);
  state = res.state;
  if (res.update === Update.ViewChanged || res.update === Update.ShouldSave) {
    if (res.update === Update.ShouldSave) {
      state.score.updateName();
      const asJSON = JSON.stringify(state.score);
      if (state.history.past[state.history.past.length - 1] !== asJSON) {
        state.history.past.push(asJSON);
        save(state.score);
      }
    }
    updateView(state);
  }
}
const updateView = (state: State) => {
  // Redraws the view

  const scoreRoot = document.getElementById('score');
  const uiRoot = document.getElementById('ui');
  if (!scoreRoot || !uiRoot) return;

  const scoreProps = {
    noteState: {
      dragged: state.note.dragged,
      inputtingNotes:
        state.note.demo !== null || state.gracenote.input !== null,
    },
    gracenoteState: state.gracenote,
    selection: state.selection,
    dispatch,
    demoNote: state.note.demo,
  };
  const uiProps = {
    zoomLevel: state.score.zoom,
    inputLength:
      state.note.demo && state.note.demo.type === 'note'
        ? state.note.demo.length
        : null,
    docs: state.doc.show
      ? Documentation.get(state.doc.current || '') ||
        'Hover over different icons to view Help here.'
      : null,
    currentMenu: state.ui.menu,
    playbackBpm: state.playback.bpm,
    gracenoteInput: state.gracenote.input,
  };
  const newView = h('div', [state.score.render(scoreProps)]);
  const newUIView = renderUI(dispatch, uiProps);
  if (state.view.score) patch(state.view.score, newView);
  if (state.view.ui) patch(state.view.ui, newUIView);
  state.view.score = newView;
  state.view.ui = newUIView;
};

function mouseMove(event: MouseEvent) {
  // The callback that occurs on mouse move
  // - registers a mouse dragged event if the mouse button is held down
  // - moves demo note (if necessary)
  const mouseButtonIsDown = event.buttons === 1;
  if (mouseButtonIsDown || state.note.demo !== null) {
    const svg = document.getElementById('score-svg');
    if (svg == null) {
      return;
    } else if (svg instanceof SVGSVGElement) {
      const CTM = svg.getScreenCTM();
      if (CTM == null) return;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      const svgPt = pt.matrixTransform(CTM.inverse());

      // If the left mouse button is held down
      if (event.buttons === 1) {
        dispatch(mouseDrag(svgPt.x, svgPt.y));
      } else if (state.note.demo) {
        const newStaveIndex = state.score.coordinateToStaveIndex(svgPt.y);
        dispatch(updateDemoNote(svgPt.x, newStaveIndex));
      }
    }
  }
}

export default function startController(
  score: Score,
  saveDB: (score: Score) => void
): void {
  // Initial render, hooks event listeners

  save = saveDB;
  state.score = score;
  state.history.past = [JSON.parse(JSON.stringify(score))];
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch(mouseUp()));
  // initially set the notes to be the right groupings
  state.view.score = hFrom('score');
  state.view.ui = hFrom('ui');
  updateView(state);
}
