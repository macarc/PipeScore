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
import m from 'mithril';
import {
  type JustCreatedScore,
  type SavedData,
  type SavedScorev4,
  isJustCreatedScore,
  updateScoreVersion,
} from '../PipeScore/SavedModel';
import { onUserChange } from '../auth-helper';
import dialogueBox from '../common/dialogueBox';
import { readFile } from '../common/file';

let userId = '';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

type ScoreQueryResult = {
  __meta__: { path: string };
  scoreName: string | undefined;
  folder: string | undefined;
};

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
async function getScoreDocuments(
  userId: string,
  scoresList: ScoresList
): Promise<ScoreDoc[]> {
  // Use query() rather than list() to avoid limits.
  // Only select the name to avoid loading the entire score.
  const documents: ScoreQueryResult[] = await db
    .ref(scoresDbPath(userId))
    .query({ select: ['scoreName', 'folder'] })
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

  static async init(
    meta: ScoreQueryResult,
    scoresList: ScoresList
  ): Promise<ScoreDoc> {
    // Legacy workaround: if any document does not have a name field, set it from the first tune in the list
    if (
      meta.scoreName === undefined ||
      meta.scoreName === null ||
      meta.scoreName === ''
    ) {
      const scoreContents = await getScoreContents(meta);

      try {
        // Note that this should never be a JustCreatedScore since that should have `scoreName` set.
        if (!isJustCreatedScore(scoreContents)) {
          const updatedScore = updateScoreVersion(scoreContents);
          scoresList.showUpdatingScoresMessage();
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
      } catch (e) {
        // This could occur if the score gets corrupted in some way.
        // (in practice, this happened when someone tried to create a score
        // using an LLM)
        console.error('Failed to get name for score');
        console.log(meta);
        const path = meta.__meta__.path.split('/');
        meta.scoreName = `Invalid score (${path[path.length - 1]})`;
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

  folder(): string {
    return this._meta.folder || '/';
  }

  async setFolder(folder: string) {
    const scoreContents = await this.contents();
    scoreContents.folder = folder;
    await db.ref(this._meta.__meta__.path).set(scoreContents);

    // Set the name temporarily. The list will be refreshed, but this can take
    // a second or two for large numbers of scores, so setting the name updates
    // the interface immediately.
    this._meta.folder = folder;
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

  async contents(): Promise<SavedScorev4 | JustCreatedScore> {
    return (await getScoreContents(this._meta)) as SavedScorev4 | JustCreatedScore;
  }
}

function folderListPath(userId: string): string {
  return `scores/${userId}/folders/folderlist`;
}

async function createFolderList(userId: string): Promise<string[]> {
  const ref = db.ref(folderListPath(userId));
  await ref.set({ folderlist: [] });
  return [];
}

async function getFolderList(userId: string): Promise<string[]> {
  try {
    const ref = db.ref(folderListPath(userId));
    const document = await ref.get();
    if (document) {
      return document.folderlist;
    }
    return createFolderList(userId);
  } catch {
    return createFolderList(userId);
  }
}

async function addFolderToList(userId: string, folder: string): Promise<void> {
  const folders = await getFolderList(userId);
  if (!folders.includes(folder)) {
    folders.push(folder);
    const ref = db.ref(folderListPath(userId));
    await ref.set({ folderlist: folders });
  }
}

// TODO: delete all scores in the folder? Maybe best not to, in case of user error.
async function deleteFolder(userId: string, folder: string): Promise<void> {
  const folders = await getFolderList(userId);
  if (folders.includes(folder)) {
    folders.splice(folders.indexOf(folder), 1);
    const ref = db.ref(folderListPath(userId));
    await ref.set({ folderlist: folders });
  }
}

type FileInput = HTMLInputElement & { files: FileList };

class ScoresList {
  loading = true;
  scores: ScoreDoc[] = [];
  folders: string[] = [];
  updatingScoresMessage = false;
  currentFolder = '/';

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

    document.getElementById('new-folder')?.addEventListener('click', async () => {
      const name = prompt('Enter folder name:');
      const validatedName = name?.replaceAll('/', '');
      if (validatedName && validatedName.length > 0) {
        addFolderToList(userId, `${this.currentFolder}${validatedName}/`);
        this.refreshScores();
      }
    });

    document.getElementById('new-score')?.addEventListener('click', async () => {
      if (userId) {
        const collection = db.ref(`scores/${userId}/scores`);
        const justCreatedScore: JustCreatedScore = {
          scoreName: DEFAULT_SCORE_NAME,
          justCreated: true,
          folder: this.currentFolder,
        };
        const newScore = await collection.add(justCreatedScore);
        if (newScore) {
          window.location.assign(`/pipescore/${userId}/${newScore.id}`);
        }
      }
    });
  }

  async move(score: ScoreDoc) {
    const form = await dialogueBox('Move score', [
      m('section', [
        m('h2', 'Move to folder:'),
        m('select', { name: 'folders' }, [
          m(
            'option',
            { name: 'folders', value: '/', selected: this.currentFolder === '/' },
            'No folder'
          ),
          this.folders.map((folder) =>
            m(
              'option',
              {
                name: 'folders',
                value: folder,
                selected: this.currentFolder === folder,
              },
              folder.slice(1)
            )
          ),
        ]),
      ]),
    ]);

    if (form) {
      const folder = new FormData(form).get('folders')?.toString();
      if (folder) {
        await score.setFolder(folder);
      }
    }
    this.refreshScores();
  }

  async duplicate(score: ScoreDoc) {
    await score.duplicate();
    this.refreshScores();
  }

  async delete(score: ScoreDoc) {
    const sure = confirm(`Are you sure you want to delete ${score.name()}?`);
    if (sure) {
      this.scores.splice(this.scores.indexOf(score), 1);
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
    this.folders = await getFolderList(userId);
    this.loading = false;
    m.redraw();
  }

  async deleteFolder(folder: string) {
    const sure = confirm(`Are you sure you want to delete ${folder}?`);
    if (sure) {
      this.folders.splice(this.folders.indexOf(folder));
      await deleteFolder(userId, folder);
      this.refreshScores();
    }
  }

  setCurrentFolder(folder: string) {
    this.currentFolder = folder;
    m.redraw();
  }

  showUpdatingScoresMessage() {
    this.updatingScoresMessage = true;
    m.redraw();
  }

  view() {
    if (this.loading) {
      if (this.updatingScoresMessage) {
        return [
          m(
            'p',
            'Updating PipeScore scores - this will only happen once. This may take a little while, please wait!'
          ),
          m('div.loading', m('div.spinner')),
        ];
      }
      return [m('div.loading', m('div.spinner'))];
    }

    const scoresToView = this.scores.filter(
      (score) => score.folder() === this.currentFolder
    );
    const subFolders = this.folders.filter((folder) => {
      if (folder !== this.currentFolder && folder.startsWith(this.currentFolder)) {
        const subFolderName = folder.slice(this.currentFolder.length);

        // Only show direct subfolders.
        return subFolderName.split('/').length === 2;
      }
      return false;
    });

    return [
      m(
        'p',
        this.currentFolder === '/'
          ? 'Scores:'
          : `Scores in ${this.currentFolder.slice(1)}:`
      ),
      scoresToView.length === 0
        ? this.currentFolder === '/'
          ? m('p', 'You have no scores.')
          : m('p', 'You have no scores in this folder.')
        : null,
      m('table', [
        subFolders.map((folder) =>
          m('tr', [
            m('td', folder.slice(this.currentFolder.length)),
            m(
              'td',
              m(
                'button.open-folder',
                { onclick: () => this.setCurrentFolder(folder) },
                'Open'
              )
            ),
            m(
              'td',
              m(
                'button.delete-folder',
                { onclick: () => this.deleteFolder(folder) },
                'Delete'
              )
            ),
          ])
        ),
        ...scoresToView.map((score) =>
          m('tr', [
            m('td.td-name', m('a', { href: score.scoreURL() }, score.name())),
            m('td', m('button.move', { onclick: () => this.move(score) }, 'Move')),
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
      this.currentFolder !== '/'
        ? m(
            'button',
            { onclick: () => this.setCurrentFolder('/') },
            'Return to all scores'
          )
        : null,
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
});
