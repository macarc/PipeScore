// A script to transfer scores from one user account to another
// Usage:
// GOOGLE_APPLICATION_CREDENTIALS="/path/to/fbcredentials.json" bun run script/copyscores.ts --from {USERID} --to {USERID}

import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { parseArgs } from "util";

initializeApp({ credential: applicationDefault() });

const store = getFirestore();

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    from: { type: 'string' },
    to: { type: 'string' }
  },
  strict: true,
  allowPositionals: true
});


async function main(fromUser: string | undefined, toUser: string | undefined) {
  if (!fromUser || !toUser) {
    console.error("Must provide --from and --to")
  } else {
    const sourceCollection = store.collection(`/scores/${fromUser}/scores`);
    const scoreDocs = await sourceCollection.listDocuments();

    const scoresToCopy = [];

    for (const scoreRef of scoreDocs) {
      const score: any = (await scoreRef.get()).data();
      scoresToCopy.push(score);
    }

    console.log(`Copying ${scoresToCopy.length} scores`)

    const targetCollection = store.collection(`/scores/${toUser}/scores`);

    console.log("Copying...")
    for (const score of scoresToCopy) {
      await targetCollection.add(score);
    }
  }
}

const { from, to } = values;

main(from, to);
