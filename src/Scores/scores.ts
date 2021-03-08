import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';

const makeUrlString = (st: string): string => {
  st = st.split(' ').join('-')
  for (const c of [['>','right'],['<','left'],['/','forward'],['?','question'],['|','pipe'],['\\','back'],['\'','single'],['"','double'], ['=','equals'],['#','hash'],['%','percent'],['@','at'],['&','ampersand'], [',','comma']]) {
    st = st.split(c[0]).join(c[1]);
  }
  return st;
}

const updateScores = (scores: string[]) => {
  const scoreRoot = document.getElementById('scores');
  if (scoreRoot) {
    let innerHTML = '<ul>';
    for (const score of scores) {
      innerHTML += `<li><a href="${'/pipescore/' + makeUrlString(score)}">${score}</a></li>`;
    }
    innerHTML += '</ul>';
    scoreRoot.innerHTML = innerHTML;
  }
}

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';

const auth = new Auth({ apiKey: apiToken });

const db = new Database({ projectId: 'pipe-score', auth });

auth.listen(async (user) => {
  if (user) {
    const collection = await db.ref(`scores/${user.localId}/scores`).list();
    const scores = collection.documents;
    updateScores(scores.map(doc => doc.name));
  } else {
    window.location.replace('/login');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut());
});
