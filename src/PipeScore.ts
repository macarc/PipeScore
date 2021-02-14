/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import startController from './Controller';
import { setScore, setView, setUIView } from './global/state';
import { keyHandler } from './KeyHandler';

import { hFrom } from './render/h';
import { difflist } from './render/difflist';

import Score from './Score/functions';

document.addEventListener('DOMContentLoaded', () => {
  console.log(difflist([1,2,3],[1,3]))
  window.addEventListener('keydown', keyHandler);
  setScore(Score.init());
  setView(hFrom('score'));
  setUIView(hFrom('ui'));
  startController()
});
