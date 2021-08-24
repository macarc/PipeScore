/*
  Controller.ts - Handles input and events for PipeScore
  Copyright (C) 2021 Archie Maclean
*/

import patch from '../render/vdom';
import { h, hFrom } from '../render/h';
import { ScoreEvent, Update } from './Controllers/Controller';
import { updateDemoNote } from './Controllers/Note';
import { mouseUp, mouseDrag } from './Controllers/Mouse';

import { State } from './State';
import { ScoreModel } from './Score/model';

import Score from './Score/functions';

import renderScore, { coordinateToStaveIndex } from './Score/view';
import renderUI from './UI/view';

import Documentation from './Documentation';

let state: State = {
  draggedNote: null,
  gracenoteState: { dragged: null, selected: null },
  playbackState: { bpm: 100 },
  currentMenu: 'normal',
  zoomLevel: 0,
  textBoxState: { selectedText: null },
  currentDocumentation: null,
  showDocumentation: true,
  justClickedNote: false,
  inputGracenote: null,
  interfaceWidth: 300,
  demoNote: null,
  clipboard: null,
  selection: null,
  selectedSecondTiming: null,
  draggedText: null,
  draggedSecondTiming: null,
  score: Score.init(),
  history: [],
  future: [],
  view: null,
  uiView: null,
};

let save: (score: ScoreModel) => void = () => null;

export async function dispatch(event: ScoreEvent): Promise<void> {
  const res = await event(state);
  state = res.state;
  if (res.update === Update.ViewChanged || res.update === Update.ShouldSave) {
    if (res.update === Update.ShouldSave) {
      if (state.score.textBoxes[0]) {
        state.score.name = state.score.textBoxes[0].text;
      }
      const asJSON = JSON.stringify(state.score);
      if (state.history[state.history.length - 1] !== asJSON) {
        state.history.push(asJSON);
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
    zoomLevel: state.zoomLevel,
    selection: state.selection,
    selectedSecondTiming: state.selectedSecondTiming,
    noteState: {
      dragged: state.draggedNote,
      inputtingNotes: state.demoNote !== null || state.inputGracenote !== null,
    },
    gracenoteState: state.gracenoteState,
    textBoxState: state.textBoxState,
    demoNote: state.demoNote,
    dispatch,
  };
  const uiProps = {
    zoomLevel: state.zoomLevel,
    inputLength:
      state.demoNote && state.demoNote.type === 'note'
        ? state.demoNote.length
        : null,
    docs: state.showDocumentation
      ? Documentation.get(state.currentDocumentation || '') ||
        'Hover over different icons to view Help here.'
      : null,
    currentMenu: state.currentMenu,
    playbackBpm: state.playbackState.bpm,
    width: state.interfaceWidth,
    gracenoteInput: state.inputGracenote,
  };
  const newView = h('div', [renderScore(state.score, scoreProps)]);
  const newUIView = renderUI(dispatch, uiProps);
  if (state.view) patch(state.view, newView);
  if (state.uiView) patch(state.uiView, newUIView);
  state.view = newView;
  state.uiView = newUIView;
};

function mouseMove(event: MouseEvent) {
  // The callback that occurs on mouse move
  // - registers a mouse dragged event if the mouse button is held down
  // - moves demo note (if necessary)
  const mouseButtonIsDown = event.buttons === 1;
  if (mouseButtonIsDown || state.demoNote !== null) {
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
      } else if (state.demoNote) {
        const newStaveIndex = coordinateToStaveIndex(svgPt.y);
        dispatch(updateDemoNote(svgPt.x, newStaveIndex));
      }
    }
  }
}

export default function startController(
  score: ScoreModel,
  saveDB: (score: ScoreModel) => void
): void {
  // Initial render, hooks event listeners

  save = saveDB;
  state.score = score;
  state.history = [JSON.parse(JSON.stringify(score))];
  state.zoomLevel =
    (100 * 0.9 * (Math.max(window.innerWidth, 800) - 300)) / score.width;
  window.addEventListener('mousemove', mouseMove);
  window.addEventListener('mouseup', () => dispatch(mouseUp()));
  // initially set the notes to be the right groupings
  state.view = hFrom('score');
  state.uiView = hFrom('ui');
  updateView(state);
}
