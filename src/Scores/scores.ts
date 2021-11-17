/*
   The page that allows the user to view and delete all their scores
   Copyright (C) 2021 macarc
 */
import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
import { h, hFrom, V } from '../render/h';
import patch from '../render/vdom';

let userId = '';

let scoreRoot: V | null = null;
const updateScores = async () => {
  const collection = await db.ref(`scores/${userId}/scores`).list();
  const scores = collection.documents.map((doc) => [
    doc.name,
    doc.__meta__.path.replace('/scores', ''),
  ]);
  if (scoreRoot) {
    const oldScoreRoot = scoreRoot;
    scoreRoot = h('section', { id: 'scores' }, [
      h('p', ['Scores:']),
      scores.length === 0 ? h('p', ['You have no scores.']) : null,
      h('table', [
        ...scores.map((score) =>
          h('tr', [
            h('td', { class: 'td-name' }, [
              h(
                'a',
                { href: '/pipescore' + score[1].replace('/scores/', '/') },
                [score[0]]
              ),
            ]),
            h('td', [
              h(
                'button',
                { class: 'rename' },
                { click: () => renameScore(score[1]) },
                ['Rename']
              ),
            ]),
            h('td', [
              h(
                'button',
                { class: 'edit' },
                {
                  click: () =>
                    window.location.assign(
                      '/pipescore' + score[1].replace('/scores/', '/')
                    ),
                },
                ['Edit']
              ),
            ]),
            h('td', [
              h(
                'button',
                { class: 'delete' },
                { click: () => deleteScore(score[1], score[0]) },
                ['Delete']
              ),
            ]),
          ])
        ),
      ]),
    ]);
    patch(oldScoreRoot, scoreRoot);
  }
};

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

async function deleteScore(path: string, name: string) {
  const sure = confirm(`Are you sure you want to delete ${name}?`);
  if (sure) {
    await db.ref(`scores${path}`).delete();
    updateScores();
  }
}
async function renameScore(path: string) {
  const score = await db.ref(`scores${path}`).get();
  const newName = prompt('Rename:', score.name);
  if (newName) {
    score.name = newName;
    if (score.textBoxes && score.textBoxes[0] && score.textBoxes[0].texts[0]) {
      score.textBoxes[0].texts[0].text = newName;
    }
    await db.ref(`scores${path}`).set(score);
    updateScores();
  }
}
auth.listen(async (user) => {
  if (user) {
    userId = user.localId;
    updateScores();
  } else {
    window.location.assign('/login');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const root = hFrom('scores');
  scoreRoot = h('section', { id: 'scores' }, [h('p', ['Loading...'])]);
  patch(root, scoreRoot);
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut());

  const newScoreBtn = document.getElementById('new-score');
  if (newScoreBtn)
    newScoreBtn.addEventListener('click', async () => {
      const collection = await db.ref(`scores/${userId}/scores`);
      const newScore = await collection.add({});
      if (newScore) {
        window.location.assign(`/pipescore/${userId}/${newScore.id}`);
      }
    });
});
