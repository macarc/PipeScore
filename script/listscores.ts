// A script to list each score associated with an account
// Usage:
// GOOGLE_APPLICATION_CREDENTIALS="/path/to/fbcredentials.json" bun run script/listscores.ts --user {USERID}

import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { parseArgs } from "util";

initializeApp({ credential: applicationDefault() });

const store = getFirestore();

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    user: { type: 'string' },
  },
  strict: true,
  allowPositionals: true
});


async function main(user: string | undefined) {
  if (!user) {
    console.error("Must provide --user")
  } else {
    const sourceCollection = store.collection(`/scores/${user}/scores`);
    const scoreDocs = await sourceCollection.listDocuments();

    for (const scoreRef of scoreDocs) {
      const score: any = (await scoreRef.get()).data();
      console.log(score.tunes[0].name.text)
    }
  }
}

const { user } = values;

main(user);
