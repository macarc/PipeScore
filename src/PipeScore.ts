/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import startController from './Controller';
import { keyHandler } from './KeyHandler';

import dialogueBox from './DialogueBox';

window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('keydown', keyHandler);
  startController()
});
