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
import { Database, Document } from 'firebase-firestore-lite';
import m from 'mithril';
import {
  DeprecatedSavedScore,
  SavedScore,
  scoreHasStavesNotTunes,
} from '../PipeScore/SavedModel';
import { onUserChange } from '../auth-helper';
import { readFile } from '../common/file';

let userId = '';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

type ScoreRef = { path: string };

type FileInput = HTMLInputElement & { files: FileList };

function getName(score: Document | ScoreRef | SavedScore | DeprecatedSavedScore) {
  return (
    (score as DeprecatedSavedScore).name ||
    (score as SavedScore).tunes?.[0]?.name ||
    'Empty Score'
  );
}

function setName(
  score: Document | ScoreRef | SavedScore | DeprecatedSavedScore,
  name: string
) {
  const s = score as SavedScore | DeprecatedSavedScore;
  if (scoreHasStavesNotTunes(s)) {
    s.name = name;
  } else if (s.tunes[0]) {
    s.tunes[0].name = name;
  }
}

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

    // Need to do this here so we have access to refreshScores()
    document.getElementById('upload')?.addEventListener('click', () => {
      // Create a temporary file input element, and use that to
      // prompt the user to select a file
      const f = document.createElement('input') as FileInput;
      
      f.setAttribute('type', 'file');
      f.setAttribute('multiple', 'multiple');
      f.setAttribute('accept', '.pipescore,.json,text/json');

      f.addEventListener('change', async () => {
        // For each file selected, read it and add it to the scores collection
        const collection = db.ref(`scores/${userId}/scores`);
        for (let i = 0; i < f.files.length; i++) {
          const file = f.files.item(i);
          if (file) {
            const contents = await readFile(file);
            const json = JSON.parse(contents);
            const score = await collection.add(json);

            // If only one file was selected, open it up in PipeScore
            if (score && f.files.length === 1) {
              window.location.assign(`/pipescore/${userId}/${score.id}`);
            }
          }
        }
        this.refreshScores();
      });

      // Trigger the file dialogue
      f.click();
    });
  }

  async duplicate(score: ScoreRef) {
    try {
      const scoreContents = (await db
        .ref(`scores${score.path}`)
        .get()) as unknown as SavedScore;

      const newTitle = `${getName(scoreContents)} (copy)`;
      setName(scoreContents, newTitle);

      await db.ref(`scores/${userId}/scores`).add(scoreContents);

      this.refreshScores();
    } catch (e) {
      console.log(e);
      alert(`Error duplicating score: ${(e as Error).name}`);
    }
  }

  async delete(score: ScoreRef) {
    const sure = confirm(`Are you sure you want to delete ${getName(score)}?`);
    if (sure) {
      await db.ref(`scores${score.path}`).delete();
      this.refreshScores();
    }
  }

  async rename(scoreRef: ScoreRef) {
    const score = await db.ref(`scores${scoreRef.path}`).get();
    const newName = prompt('Rename:', getName(score));
    if (newName) {
      setName(score, newName);
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
        name: getName(doc),
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

    const path = (score: ScoreRef) =>
      `/pipescore${score.path.replace('/scores/', '/')}`;

    return [
      m('p', 'Scores:'),
      this.scores.length === 0 ? m('p', 'You have no scores.') : null,
      m('table', [
        ...this.scores.map((score) =>
          m('tr', [
            m('td.td-name', m('a', { href: path(score) }, getName(score))),
            m(
              'td',
              m(
                'button.edit',
                { onclick: () => window.location.assign(path(score)) },
                'Edit'
              )
            ),
            m(
              'td',
              m('button.rename', { onclick: () => this.rename(score) }, 'Rename')
            ),
            m(
              'td',
              m(
                'button.duplicate',
                { onclick: () => this.duplicate(score) },
                'Duplicate'
              )
            ),
            m(
              'td',
              m('button.delete', { onclick: () => this.delete(score) }, 'Delete')
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
