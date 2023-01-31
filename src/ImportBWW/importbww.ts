import Auth from 'firebase-auth-lite';
import { Database, Reference } from 'firebase-firestore-lite';
import { onUserChange } from '../auth-helper';
import { parse } from './Parser';
import m from 'mithril';
import { SavedScore } from '../PipeScore/SavedModel';
import { settings } from '../PipeScore/global/settings';

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

function errorImporting(message: string) {
  render(
    m('section', [
      m('h2', 'Failed to import'),
      m('details', [m('summary', 'Error details'), m('p', message)]),
    ])
  );
}

async function savefile(score: SavedScore) {
  const collection = await db.ref(`scores/${user}/scores`);
  const newScore = await collection.add(score);
  if (newScore) {
    return newScore;
  }
  throw new Error('Could not save score.');
}

async function updatefile(dbEntry: Reference, score: SavedScore) {
  const e = await db.ref(`scores/${user}/scores/${dbEntry.id}`);
  await e.set(score);
}

async function importfile(e: SubmitEvent) {
  e.preventDefault();
  const fileInput = (e.target as HTMLFormElement | null)?.querySelector(
    'input[type="file"]'
  );
  const files = fileInput && (fileInput as HTMLInputElement).files;
  if (!files || !files[0]) return chooseFile();

  try {
    if (user === null) throw new Error('Must be logged in to import scores');
    const fileContents = await readFile(files[0]);
    const { score, warnings, textboxes } = parse(fileContents);
    const dbEntry = await savefile(score);
    const goToScore = async (e: SubmitEvent) => {
      e.preventDefault();
      const scoreName =
        (document.querySelector('#score-name') as HTMLInputElement | null)
          ?.value || '[Imported from BWW]';
      const composer = (
        document.querySelector('#composer') as HTMLInputElement | null
      )?.value;
      const tuneType = (
        document.querySelector('#tune-type') as HTMLInputElement | null
      )?.value;

      score.name = scoreName;
      score.textBoxes[0].texts = [];
      score.textBoxes[0].texts.push({
        x: settings.pageLongSideLength / 2,
        y: settings.topOffset / 2,
        size: 20,
        font: 'sans-serif',
        centred: true,
        _text: scoreName,
      });

      // This is copied from the Score constructor
      // FIXME: remove duplication
      const detailTextSize = 15;
      const detailY = Math.max(settings.topOffset - 45, 10);
      if (composer)
        score.textBoxes[0].texts.push({
          x: (7 / 8) * settings.pageLongSideLength,
          y: detailY,
          size: detailTextSize,
          _text: composer,
          font: 'sans-serif',
          centred: false,
        });
      if (tuneType)
        score.textBoxes[0].texts.push({
          x: (1 / 8) * settings.pageLongSideLength,
          y: detailY,
          size: detailTextSize,
          _text: tuneType,
          font: 'sans-serif',
          centred: false,
        });

      await updatefile(dbEntry, score);
      window.location.replace(`/pipescore/${user}/${dbEntry.id}`);
    };

    render(
      m('section', [
        warnings.length > 0
          ? m('h2', 'Imported successfully with warnings')
          : m('h2', 'Imported successfully'),
        warnings.length > 0
          ? m(
              'ul',
              warnings.map((warning) => m('li', warning))
            )
          : null,
        m('h2', 'Add score information'),
        m('form', { onsubmit: goToScore }, [
          m('label.score-info', 'Score name: '),
          m('input#score-name', { value: textboxes[0] }),
          m('label.score-info', 'Composer: '),
          m('input#composer', { value: textboxes[2] }),
          m('label.score-info', 'Tune type: '),
          m('input#tune-type', { value: textboxes[1] }),
          m('input.score-info', { type: 'submit', value: 'Create Score' }),
        ]),
      ])
    );
  } catch (e) {
    errorImporting((e as Error).message);
  }
}

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

function chooseFile() {
  render(
    m('form', { onsubmit: importfile }, [
      m('input', { name: 'bww-file', type: 'file', multiple: false }),
      m('input', {
        type: 'submit',
        value: 'Import',
        accept: '.bww,.bmw',
        required: 'required',
      }),
    ])
  );
}

function render(dom: m.Children) {
  const root = document.querySelector('#root');
  if (root) m.render(root, dom);
}

document.addEventListener('DOMContentLoaded', chooseFile);
