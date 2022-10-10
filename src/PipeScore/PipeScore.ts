//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  Load the score from the database and start the controller.

import { keyHandler } from './KeyHandler';
import startController from './Controller';
import quickStart from './QuickStart';
import { Score } from './Score';
import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
import { onUserChange } from '../auth-helper';

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
      .catch((e) => {
        console.log('error when getting / parsing score: ', e);
        return null;
      });
  }

  function parsePath() {
    const path = window.location.pathname.split('/').slice(2);
    if (path.length < 2) {
      return null; //window.location.replace('/scores');
    }
    return path;
  }
  let alreadyStarted = false;

  onUserChange(auth, async (user) => {
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
        if (score && (score.staves as any | null)) {
          startController(score, () => null, false, false);
        }
      }
    }
  });
});
