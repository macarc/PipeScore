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

//  The page that allows the user to view, open and delete all their scores.

import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
import { onUserChange } from '../auth-helper';
import m from 'mithril';

let userId = '';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

type ScoreRef = { name: string; path: string };

class ScoresList {
  loading = true;
  scores: ScoreRef[] = [];

  oninit() {
    onUserChange(auth, (user) => {
      if (user) {
        userId = user.localId;
        this.refreshScores();
      } else {
        window.location.assign('/login');
      }
    });
  }

  async delete(score: ScoreRef) {
    const sure = confirm(`Are you sure you want to delete ${score.name}?`);
    if (sure) {
      await db.ref(`scores${score.path}`).delete();
      this.refreshScores();
    }
  }

  async rename(scoreRef: ScoreRef) {
    const score = await db.ref(`scores${scoreRef.path}`).get();
    const newName = prompt('Rename:', score.name);
    if (newName) {
      score.name = newName;
      if (
        score.textBoxes &&
        score.textBoxes[0] &&
        score.textBoxes[0].texts[0]
      ) {
        score.textBoxes[0].texts[0]._text = newName;
      }
      await db.ref(`scores${scoreRef.path}`).set(score);
      this.refreshScores();
    }
  }

  async refreshScores() {
    const collection = await db.ref(`scores/${userId}/scores`).list({
      pageSize: 1000,
    });
    this.scores = collection.documents
      .map((doc) => ({
        name: doc.name,
        path: doc.__meta__.path.replace('/scores', ''),
      }))
      .sort(({ name: name1 }, { name: name2 }) =>
        name1 === name2 ? 0 : name1.toLowerCase() < name2.toLowerCase() ? -1 : 1
      );
    this.loading = false;
    m.redraw();
  }

  view() {
    if (this.loading) return [m('div.loading', m('div.spinner'))];

    return [
      m('p', 'Scores:'),
      this.scores.length === 0 ? m('p', 'You have no scores.') : null,
      m('table', [
        ...this.scores.map((score) =>
          m('tr', [
            m(
              'td.td-name',
              m(
                'a',
                { href: '/pipescore' + score.path.replace('/scores/', '/') },
                score.name
              )
            ),
            m(
              'td',
              m(
                'button.rename',
                { onclick: () => this.rename(score) },
                'Rename'
              )
            ),
            m(
              'td',
              m(
                'button.edit',
                {
                  onclick: () =>
                    window.location.assign(
                      '/pipescore' + score.path.replace('/scores/', '/')
                    ),
                },
                'Edit'
              )
            ),
            m(
              'td',
              m(
                'button.delete',
                { onclick: () => this.delete(score) },
                'Delete'
              )
            ),
          ])
        ),
      ]),
    ];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('scores');
  if (root) m.mount(root, ScoresList);
  document
    .getElementById('sign-out')
    ?.addEventListener('click', () => auth.signOut());
  document
    .getElementById('import-bww')
    ?.addEventListener('click', () => window.location.replace('/importbww'));
  document.getElementById('new-score')?.addEventListener('click', async () => {
    if (userId) {
      const collection = db.ref(`scores/${userId}/scores`);
      const newScore = await collection.add({
        name: 'Empty Score',
        justCreated: true,
      });
      if (newScore) {
        window.location.assign(`/pipescore/${userId}/${newScore.id}`);
      }
    }
  });
});
