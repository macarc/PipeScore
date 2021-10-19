/*
  Handles input and events for PipeScore
  Copyright (C) 2021 macarc
*/

import patch from '../render/vdom';
import { h, hFrom } from '../render/h';
import { ScoreEvent, Update } from './Controllers/Controller';
import { mouseUp, mouseDrag, clickBackground } from './Controllers/Mouse';
import { State } from './State';
import { Score } from './Score';
import {
  GracenoteSelection,
  ScoreSelection,
  TripletLineSelection,
} from './Selection';
import { emptyGracenoteState } from './Gracenote/state';
import renderUI from './UI/view';
import Documentation from './Documentation';

const initialState: State = {
  justClickedNote: false,
  demo: null,
  playback: { bpm: 100 },
  ui: { menu: 'note' },
  doc: { show: true, current: null },
  clipboard: null,
  selection: null,
  score: new Score(),
  history: { past: [], future: [] },
  view: { score: null, ui: null },
};
const state: State = { ...initialState };

let save: (score: Score) => void = () => null;

export async function dispatch(event: ScoreEvent): Promise<void> {
  const res = await event(state);
  if (res === Update.ViewChanged || res === Update.ShouldSave) {
    if (res === Update.ShouldSave) {
      state.score.updateName();
      const asJSON = JSON.stringify(state.score.toJSON());
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
      dragged:
        (state.selection instanceof ScoreSelection &&
          state.selection.draggedNote()) ||
        null,
      selectedTripletLine:
        (state.selection instanceof TripletLineSelection &&
          state.selection.selected) ||
        null,
      inputtingNotes: state.demo !== null,
    },
    gracenoteState:
      state.selection instanceof GracenoteSelection
        ? state.selection.state()
        : emptyGracenoteState,
    selection: state.selection,
    dispatch,
    demoNote: state.demo,
  };
  const uiProps = {
    zoomLevel: state.score.zoom,
    demo: state.demo,
    selectedNote: state.selection && state.selection.selectedNote(state.score),
    selectedGracenote:
      state.selection && state.selection.gracenote(state.score),
    isLandscape: state.score.landscape,
    selectedBar: state.selection && state.selection.bar(state.score),
    docs: state.doc.show
      ? Documentation.get(state.doc.current || '') ||
        'Hover over different icons to view Help here.'
      : null,
    currentMenu: state.ui.menu,
    playbackBpm: state.playback.bpm,
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
  if (mouseButtonIsDown) {
    let svg: SVGSVGElement | null = null;
    if (event.target instanceof SVGElement) {
      svg = event.target.ownerSVGElement;
    } else {
      svg = document.getElementsByTagName('svg')[0];
    }
    if (svg == null) {
      return;
    } else if (svg instanceof SVGSVGElement) {
      const page = parseInt(svg.classList[0]);
      const CTM = svg.getScreenCTM();
      if (CTM == null) return;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;

      const svgPt = pt.matrixTransform(CTM.inverse());

      // If the left mouse button is held down
      if (event.buttons === 1) dispatch(mouseDrag(svgPt.x, svgPt.y, page));
    }
  }
}

export default function startController(
  score: Score,
  saveFn: (score: Score) => void
): void {
  // Initial render, hooks event listeners

  save = saveFn;
  state.score = score;
  state.history.past = [JSON.stringify(score.toJSON())];
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch(mouseUp()));
  // initially set the notes to be the right groupings
  state.view.score = hFrom('score');
  state.view.ui = hFrom('ui');
  save(state.score);
  updateView(state);
}
