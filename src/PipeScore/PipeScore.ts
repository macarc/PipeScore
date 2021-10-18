/*
  The entry point for PipeScore
  Copyright (C) 2021 macarc
*/
import { keyHandler } from './KeyHandler';
import startController from './Controller';
import quickStart from './QuickStart';
import { Score } from './Score';

window.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('keydown', keyHandler);
  const scoreOptions = await quickStart();
  const score = new Score(
    scoreOptions.name,
    scoreOptions.numberOfStaves,
    scoreOptions.timeSignature
  );
  startController(score);
});
