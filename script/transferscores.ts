// A script to transfer scores from one user account to another
// Usage:
// GOOGLE_APPLICATION_CREDENTIALS="/path/to/fbcredentials.json" bun run script/transferscores.ts --from {USERID} --to {USERID}
//
// NOTE : THIS ISN'T ACTUALLY IMPLEMENTED YET!

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
  if (!fromUser) {
    console.error("Must provide --from")
  }

  const sourceCollection = store.collection(`/scores/${fromUser}/scores`);
  const scoreDocs = await sourceCollection.listDocuments();


  if (toUser) {
    const targetCollection = store.collection(`/scores/${toUser}/scores`);
  }

  console.error("Unimplemented!");

}

const { from, to } = values;

main(from, to);
