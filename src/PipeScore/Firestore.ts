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

//  Buffered saving interface to Firestore

import { SavedData, SavedScore, scoreIsPresent } from './SavedModel';
import { Score } from './Score';
import quickStart from './QuickStart';
import { Database } from 'firebase-firestore-lite';

function beforeUnload(event: Event) {
  event.preventDefault();
  event.returnValue = true;
}

export class Firestore {
  private db: Database;
  private userid: string;
  private scoreid: string;
  private readonly: boolean;
  private editsSinceSave = 0;
  private oncommit: () => void = () => null;
  // FIXME : storing this here currently duplicates state with State.score
  private score: SavedScore = new Score().toJSON();

  private constructor(
    db: Database,
    userid: string,
    scoreid: string,
    readonly: boolean
  ) {
    this.db = db;
    this.userid = userid;
    this.scoreid = scoreid;
    this.readonly = readonly;
    setInterval(() => this.commit(), 60 * 1000);
  }

  // Assumes that we can write to userid if readonly is false
  static async create(
    db: Database,
    userid: string,
    scoreid: string,
    readonly = false
  ) {
    const store = new Firestore(db, userid, scoreid, readonly);

    const data = await store.pull();
    // If it is a new score, then it won't have staves
    if (!data || !scoreIsPresent(data)) {
      const opts = await quickStart();
      store.score = opts.toScore().toJSON();
      await store.commit();
      const score = await store.pull();
      if (!score || !scoreIsPresent(score))
        throw new Error("Couldn't save score.");
    } else {
      store.score = data;
    }

    return store;
  }

  async save(score: SavedScore) {
    this.score = score;
    window.addEventListener('beforeunload', beforeUnload);
    this.editsSinceSave++;
  }

  getSavedScore(): Score | null {
    if (this.score) return Score.fromJSON(this.score);
    return null;
  }

  isSaved() {
    return this.editsSinceSave === 0;
  }

  isReadOnly() {
    return this.readonly;
  }

  onCommit(fn: () => void) {
    this.oncommit = fn;
  }

  forceSave() {
    this.commit();
  }

  private async commit() {
    if (!this.readonly && !this.isSaved())
      await this.db
        .ref(`/scores/${this.userid}/scores/${this.scoreid}`)
        .set(this.score)
        .catch(() => window.location.replace('/scores'));

    this.editsSinceSave = 0;
    window.removeEventListener('beforeunload', beforeUnload);
    this.oncommit();
  }

  private async pull(): Promise<SavedData | null> {
    try {
      const data = await this.db
        .ref(`scores/${this.userid}/scores/${this.scoreid}`)
        .get();
      return data as unknown as SavedData;
    } catch (e) {
      console.log('error when getting score: ', e);
      return null;
    }
  }
}
