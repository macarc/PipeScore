/*
  The entry point for PipeScore - handling loading a score from the database
  Copyright (C) 2021 macarc
*/
import { keyHandler } from './KeyHandler';
import startController from './Controller';
import quickStart from './QuickStart';
import { Score } from './Score';
import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';

const apiKey = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

window.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('keydown', keyHandler);

  const auth = new Auth({ apiKey });
  const db = new Database({ projectId: 'pipe-score', auth });

  async function save(
    user: string,
    score: string,
    value: Score
  ): Promise<Score | null> {
    await db
      .ref(`/scores/${user}/scores/${score}`)
      .set(value.toJSON())
      .catch(() => window.location.replace('/scores'));

    return get(user, score);
  }

  function get(user: string, score: string): Promise<Score | null> {
    return db
      .ref(`scores/${user}/scores/${score}`)
      .get()
      .then(Score.fromJSON)
      .catch(() => null);
  }

  function parsePath() {
    const path = window.location.pathname.split('/').slice(2);
    if (path.length < 2) {
      return null; //window.location.replace('/scores');
    }
    return path;
  }
  let alreadyStarted = false;

  auth.listen(async (user) => {
    if (alreadyStarted) return;
    alreadyStarted = true;

    const path = parsePath();
    if (path === null) {
      if (user) {
        // We don't want someone logged in to edit a blank score since
        // it won't be saved, so coming here was probably a mistake
        window.location.replace('/scores');
      } else {
        const opts = await quickStart();
        startController(opts.toScore(), () => null, false);
      }
    } else {
      const [userid, scoreid] = path;

      if (user && user.localId === userid) {
        const saveScore = (score: Score) => save(userid, scoreid, score);

        const score = await get(userid, scoreid);
        // If it is a new score, then it won't have staves
        if (!score || !score.staves) {
          saveScore(new Score());
          const opts = await quickStart();
          const score = await save(userid, scoreid, opts.toScore());
          if (!score) throw new Error("Couldn't save score.");
          startController(score, saveScore, true);
        } else {
          startController(score, saveScore, true);
        }
      } else {
        const score = await get(userid, scoreid);
        if (score && score.staves) {
          startController(score, () => null, false, false);
        }
      }
    }
  });
});
