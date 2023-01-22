import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';
import { onUserChange } from '../auth-helper';
import { parse } from './Parser';
import m from 'mithril';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

let user: string | null = null;
onUserChange(auth, (newUser) => {
  if (newUser) {
    user = newUser.localId;
  } else {
    user = null;
  }
});

const Form = {
  submit(e: SubmitEvent) {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement | null)?.querySelector(
      'input[type="file"]'
    );
    const files = fileInput && (fileInput as HTMLInputElement).files;
    if (files) ImportBWW.import(files);
  },
  view() {
    return m('form', { onsubmit: Form.submit }, [
      m('input', { name: 'bww-file', type: 'file', multiple: true }),
      m('input', {
        type: 'submit',
        value: 'Import',
        accept: '.bww,.bmw',
        required: 'required',
      }),
    ]);
  },
};

async function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.addEventListener('error', rej);
    reader.addEventListener('load', (e) => {
      const data = e.target?.result;
      if (data) res(data.toString());
    });
  });
}

class ImportBWW {
  static warnings: string[] = [];
  static errors: string[] = [];
  //             [ name ,  URL  ]
  static scores: [string, string][] = [];
  static importedScores = false;

  static async import(files: FileList) {
    ImportBWW.warnings = [];
    ImportBWW.errors = [];
    try {
      if (user === null) throw new Error('Must be logged in to import scores');
      const fileContents = await Promise.all([...files].map(readFile));
      const scores = fileContents.map((text) => {
        const [score, warnings] = parse(text);
        ImportBWW.warnings = ImportBWW.warnings.concat(warnings);
        return score;
      });
      const collection = await db.ref(`scores/${user}/scores`);
      ImportBWW.scores = await Promise.all(
        scores.map(async (score) => {
          const newScore = await collection.add(score);
          if (newScore) {
            return [
              'Successful BWW import',
              `/pipescore/${user}/${newScore.id}`,
            ];
          }
          return ['Failed import', ''];
        })
      );
    } catch (e) {
      ImportBWW.errors.push((e as Error).message);
    }
    ImportBWW.importedScores = true;
    m.redraw();
  }
  static view() {
    if (!ImportBWW.importedScores) {
      return Form.view();
    } else if (ImportBWW.errors.length > 0) {
      return m('section', [
        m('h2', 'Failed to import'),
        m('details', [
          m('summary', 'Error details'),
          m(
            'ul',
            ImportBWW.errors.map((error) => m('li', error))
          ),
        ]),
      ]);
    }
    return m('section', [
      ImportBWW.warnings.length > 0
        ? m('section', [
            m('h2', 'Imported with warnings:'),
            m(
              'ul',
              ImportBWW.warnings.map((warning) => m('li', warning))
            ),
          ])
        : m('h2', 'Imported Successfully'),
      ImportBWW.scores.length === 1
        ? m(
            'button',
            { onclick: () => window.location.assign(ImportBWW.scores[0][1]) },
            'Open Score'
          )
        : m('section', [
            m('h2', 'Open the score'),
            ImportBWW.scores.map(([name, url]) =>
              m('button', { onclick: () => window.open(url, '_blank') }, name)
            ),
          ]),
    ]);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#root');
  if (root) m.mount(root, ImportBWW);
});
