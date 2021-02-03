/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import startController from './Controller';
import Score from './Score/functions';
import { setScore } from './global';

document.addEventListener('DOMContentLoaded', () => {
  setScore(Score.init());
  startController()
});
