/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2020 Archie Maclean
*/
import startController from './Controller';
import { keyHandler } from './KeyHandler';

window.addEventListener('DOMContentLoaded', () => {
  // Set the key handler here rather than in Controller to avoid circular dependency
  window.addEventListener('keydown', keyHandler);
  startController()
});
