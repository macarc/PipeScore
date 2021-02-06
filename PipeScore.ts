/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import startController from './Controller';
import { setScore } from './global';
import { keyHandler } from './KeyHandler';

import Score from './Score/functions';

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', keyHandler);
  setScore(Score.init());
  startController()
});
