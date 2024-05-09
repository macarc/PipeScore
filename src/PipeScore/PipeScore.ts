//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
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

import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
import { onUserChange } from '../auth-helper';
import startController from './Controller';
import { Firestore } from './Firestore';
import { keyHandler } from './KeyHandler';
import { dipIfOnMobile } from './global/browser';

const apiKey = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

function parsePath() {
  const path = window.location.pathname.split('/').slice(2);
  if (path.length < 2) {
    return null; // window.location.replace('/scores');
  }
  return path;
}

window.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('keydown', keyHandler);

  const auth = new Auth({ apiKey });
  const db = new Database({ projectId: 'pipe-score', auth });
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
        dipIfOnMobile();
        startController(null, false);
      }
    } else {
      const [userid, scoreid] = path;

      if (user && user.localId === userid) {
        const store = await Firestore.create(db, userid, scoreid);
        startController(store, true);
      } else {
        const store = await Firestore.create(db, userid, scoreid, true);
        // TODO : shouldn't this be true
        startController(store, false);
      }
    }
  });
});
