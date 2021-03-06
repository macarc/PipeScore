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
import quickStart from './QuickStart';

const apiKey = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
window.addEventListener('DOMContentLoaded', async () => {

  window.addEventListener('keydown', keyHandler);

  const auth = new Auth({ apiKey })
  const db = new Database({ projectId: 'pipe-score', auth });

  let startedController = false;

  auth.listen(async (user) => {
    if (!user) {
      if (!startedController) {
        startController(Score.init(), () => null);
        startedController = true;
      }
    } else if (!startedController) {
      startedController = true;

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
          const values = await quickStart();
          score = await save(Score.init(values.name, values.numberOfStaves, values.timeSignature));
        }
        if (score) {
          startController(score, save);
          startedController = true;
        } else {
          score = await save(Score.init());
          startController(score as unknown as ScoreModel, save);
        }
      }
    }
  });
});
