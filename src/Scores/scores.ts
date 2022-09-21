/*
   The page that allows the user to view and delete all their scores
   Copyright (C) 2021 macarc
 */
import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
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
    auth.listen(async (user) => {
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
        score.textBoxes[0].texts[0].text = newName;
      }
      await db.ref(`scores${scoreRef.path}`).set(score);
      this.refreshScores();
    }
  }

  async refreshScores() {
    const collection = await db.ref(`scores/${userId}/scores`).list();
    this.scores = collection.documents.map((doc) => ({
      name: doc.name,
      path: doc.__meta__.path.replace('/scores', ''),
    }));
    this.loading = false;
    m.redraw();
  }

  view() {
    if (this.loading) return m('p', 'Loading');

    return [
      m('p', 'Scores:'),
      this.scores.length === 0 ? m('p', 'You have no scores.') : null,
      m('table', [
        ...this.scores.map((score) =>
          m('tr', [
            m(
              'td[class=td-name]',
              m(
                'a',
                { href: '/pipescore' + score.path.replace('/scores/', '/') },
                score.name
              )
            ),
            m(
              'td',
              m(
                'button[class=rename]',
                { onclick: () => this.rename(score) },
                'Rename'
              )
            ),
            m(
              'td',
              m(
                'button[class=edit]',
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
                'button[class=delete]',
                {
                  onclick: () => this.delete(score),
                },
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
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut());

  const newScoreBtn = document.getElementById('new-score');
  if (newScoreBtn)
    newScoreBtn.addEventListener('click', async () => {
      const collection = db.ref(`scores/${userId}/scores`);
      const newScore = await collection.add({});
      if (newScore) {
        window.location.assign(`/pipescore/${userId}/${newScore.id}`);
      }
    });
});
