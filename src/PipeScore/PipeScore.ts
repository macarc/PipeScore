/*
  PipeScore.ts - the entry point for PipeScore
  Copyright (C) 2021 Archie Maclean
*/
import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
import startController from './Controller';
import { keyHandler } from './KeyHandler';
import Score from './Score/functions';
import { ScoreModel } from './Score/model';

const apiKey = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
window.addEventListener('DOMContentLoaded', async () => {

  window.addEventListener('keydown', keyHandler);

  const auth = new Auth({ apiKey })
  const db = new Database({ projectId: 'pipe-score', auth });

  let startedController = false;

  auth.listen(async (user) => {
    if (!user && !startedController) {
      startController(Score.init(), () => null);
      startedController = true;
    } else {
      const path = window.location.pathname.split('/').slice(2);
      if (path.length < 2) {
        window.location.replace('/scores');
      } else {
        const [userId, scoreId] = path;
        const save = async (score: ScoreModel) => {
          await db.ref(`/scores/${userId}/scores/${scoreId}`).set(score).catch(() => window.location.replace('/scores'));
          return get();
        }
        const get = (): Promise<ScoreModel> => db.ref(`scores/${userId}/scores/${scoreId}`).get().then(s => s as unknown as ScoreModel).catch(() => save(Score.init()));

        let score = await get();

        // If is a new score, it will not have staves, so save a blank score
        if (!score.staves) {
          score = await save(Score.init());
        }
        if (score && !startedController) {
          startController(score, save);
          startedController = true;
        } else if (!startedController) {
          score = await save(Score.init());
          startController(score as unknown as ScoreModel, save);
          startedController = true;
        }
      }
    }
  });
});
