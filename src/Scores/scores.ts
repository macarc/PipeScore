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
import { Database, type Document } from 'firebase-firestore-lite';
import m from 'mithril';
import {
  type JustCreatedScore,
  type SavedData,
  type SavedScorev3,
  isJustCreatedScore,
  updateScoreVersion,
} from '../PipeScore/SavedModel';
import { onUserChange } from '../auth-helper';
import { readFile } from '../common/file';

let userId = '';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

type ScoreQueryResult = Document & { scoreName: string | undefined };

const DEFAULT_SCORE_NAME = 'Empty Score';

/**
 * Get the Firestore path to the user's scores.
 * @param userId User ID.
 * @returns the path to a collection in Firestore containing the user's scores.
 */
function scoresDbPath(userId: string): string {
  return `scores/${userId}/scores`;
}

/**
 * Get the list of user's scores.
 * @param userId User ID.
 * @returns the list of ScoreDocs corresponding to the user's scores.
 */
async function getScoreDocuments(userId: string, scoresList: ScoresList): Promise<ScoreDoc[]> {
  // Use query() rather than list() to avoid limits.
  // Only select the name to avoid loading the entire score.
  const documents: ScoreQueryResult[] = await db
    .ref(scoresDbPath(userId))
    .query({ select: ['scoreName'] })
    .run();
  return Promise.all(documents.map((doc) => ScoreDoc.init(doc, scoresList)));
}

/**
 *
 * @param meta the Firestore document containing the user's score.
 * @returns
 */
async function getScoreContents(meta: ScoreQueryResult): Promise<SavedData> {
  const contents = await db.ref(meta.__meta__.path).get();
  return contents as unknown as SavedData;
}

class ScoreDoc {
  _meta: ScoreQueryResult;

  static async init(meta: ScoreQueryResult, scoresList: ScoresList): Promise<ScoreDoc> {
    // Legacy workaround: if any document does not have a name field, set it from the first tune in the list
    if (
      meta.scoreName === undefined ||
      meta.scoreName === null ||
      meta.scoreName === ''
    ) {
      const scoreContents = await getScoreContents(meta);

      // Note that this should never be a JustCreatedScore since that should have `scoreName` set.
      if (!isJustCreatedScore(scoreContents)) {

        const updatedScore = updateScoreVersion(scoreContents);
        scoresList.showUpdatingScoresMessage()
        await db.ref(meta.__meta__.path).set(updatedScore);
        meta.scoreName = updatedScore.scoreName;
      } else {
        console.error('Failed to get name for JustCreatedScore', scoreContents);

        // The old JustCreatedScores used 'name' instead of scoreName. This is
        // very unlikely to ever need to be run.
        const maybeName = (scoreContents as unknown as { name: string }).name;
        if (maybeName !== undefined) {
          scoreContents.scoreName = maybeName;
          await db.ref(meta.__meta__.path).set(scoreContents);
          meta.scoreName = maybeName;
        }
      }
    }

    return new ScoreDoc(meta);
  }

  constructor(meta: ScoreQueryResult) {
    console.assert(typeof meta.scoreName === 'string' && meta.scoreName.length > 0);
    this._meta = meta;
  }

  name(): string {
    return this._meta.scoreName || DEFAULT_SCORE_NAME;
  }

  async setName(name: string) {
    const scoreContents = await this.contents();
    scoreContents.scoreName = name;
    await db.ref(this._meta.__meta__.path).set(scoreContents);

    // Set the name temporarily. The list will be refreshed, but this can take
    // a second or two for large numbers of scores, so setting the name updates
    // the interface immediately.
    this._meta.scoreName = name;
  }

  scoreURL() {
    return `/pipescore${this._meta.__meta__.path.replaceAll('/scores/', '/')}`;
  }

  async duplicate() {
    const name = `${this._meta.scoreName} (copy)`;
    const scoreContents = await this.contents();
    scoreContents.scoreName = name;
    await db.ref(this._meta.__meta__.path).parentCollection.add(scoreContents);
  }

  async delete() {
    await db.ref(this._meta.__meta__.path).delete();
  }

  async contents(): Promise<SavedScorev3 | JustCreatedScore> {
    return (await getScoreContents(this._meta)) as SavedScorev3 | JustCreatedScore;
  }
}

type FileInput = HTMLInputElement & { files: FileList };

class ScoresList {
  loading = true;
  scores: ScoreDoc[] = [];
  updatingScoresMessage = false;

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

  async duplicate(score: ScoreDoc) {
    await score.duplicate();
    this.refreshScores();
  }

  async delete(score: ScoreDoc) {
    const sure = confirm(`Are you sure you want to delete ${score.name()}?`);
    if (sure) {
      await score.delete();
      this.refreshScores();
    }
  }

  async rename(score: ScoreDoc) {
    const newName = prompt('Rename:', score.name());
    if (newName) {
      await score.setName(newName);
      this.refreshScores();
    }
  }

  async refreshScores() {
    this.scores = await getScoreDocuments(userId, this);
    this.scores.sort((score1, score2) =>
      score1.name() === score2.name()
        ? 0
        : score1.name().toLowerCase() < score2.name().toLowerCase()
          ? -1
          : 1
    );
    this.loading = false;
    m.redraw();
  }

  showUpdatingScoresMessage() {
    this.updatingScoresMessage = true;
    m.redraw()
  }

  view() {
    if (this.loading) {
      if (this.updatingScoresMessage) {
        return [m('p', 'Updating PipeScore scores - this will only happen once. This may take a little while, please wait!'), m('div.loading', m('div.spinner'))];
      } else {
        return [m('div.loading', m('div.spinner'))];
      }
    }

    return [
      m('p', 'Scores:'),
      this.scores.length === 0 ? m('p', 'You have no scores.') : null,
      m('table', [
        ...this.scores.map((score) =>
          m('tr', [
            m('td.td-name', m('a', { href: score.scoreURL() }, score.name())),
            m(
              'td',
              m(
                'button.edit',
                { onclick: () => window.location.assign(score.scoreURL()) },
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
      const justCreatedScore: JustCreatedScore = {
        scoreName: DEFAULT_SCORE_NAME,
        justCreated: true,
      };
      const newScore = await collection.add(justCreatedScore);
      if (newScore) {
        window.location.assign(`/pipescore/${userId}/${newScore.id}`);
      }
    }
  });
});
