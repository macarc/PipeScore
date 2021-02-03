/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
/*
import { render } from 'uhtml';

import renderScore from './Score/view';
import renderUI from './UI/view';
import Score from './Score/functions';
import { ScoreModel } from './Score/model';
import { setUpdateView } from './Update';

function keyHandler() {}
function dragText() {}

const score = Score.init();

export function updateView() {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;

  const scoreProps = {
    updateView,
    svgRef: { ref: null },
    zoomLevel: 100,
    selection: null
  }
  render(scoreRoot, renderScore(score, scoreProps));
  render(uiRoot, renderUI());
}

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', keyHandler);
  window.addEventListener('mousemove', dragText);
  setUpdateView(() => updateView());
  updateView();
});
*/

import { render } from 'uhtml';
import startController, { dispatch } from './Controller';
import { ScoreModel } from './Score/model';
import renderScore from './Score/view';
import Score from './Score/functions';
import { zoomLevel, currentSvg, selection, setScore } from './global';
import renderUI from './UI/view';

const updateView = (score: ScoreModel) => {
  const scoreRoot = document.getElementById("score");
  const uiRoot = document.getElementById("ui");
  if (!scoreRoot || !uiRoot) return;

  const scoreProps = {
    svgRef: currentSvg,
    zoomLevel: zoomLevel,
    selection: selection,
    updateView: () => null,
    dispatch
  }
  render(scoreRoot, renderScore(score, scoreProps));
  render(uiRoot, renderUI(dispatch));
}

document.addEventListener('DOMContentLoaded', () => {
  setScore(Score.init());
  startController(updateView)
});
