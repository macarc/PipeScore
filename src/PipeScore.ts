/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import startController from './Controller';
import { setScore, setView } from './global/state';
import { keyHandler } from './KeyHandler';

import { hFrom } from './render/h';

import Score from './Score/functions';

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', keyHandler);
  setScore(Score.init());
  setView(hFrom('score'));
  startController()
});
