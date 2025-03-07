// A script to update the email address of a user
// Usage:
// GOOGLE_APPLICATION_CREDENTIALS="/path/to/fbcredentials.json" bun run script/setemail.ts --userId {USERID} --email {EMAIL}

import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { parseArgs } from "util";

// PARSE COMMAND LINE ARGUMENTS

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    userId: { type: 'string' },
    email: { type: 'string' }
  },
  strict: true,
  allowPositionals: true
});

const { userId, email } = values;

if (!userId || !email) {
  throw new Error("Must have --userId and --newEmail")
}

// INITIALISE FIREBASE

initializeApp({ credential: applicationDefault() });

const auth = getAuth();

// UPDATE EMAIL

auth.updateUser(userId, { email });
