import Auth from 'firebase-auth-lite';
import { Database } from 'firebase-firestore-lite';

const updateScores = (userId: string, scores: [string,string][]) => {
  const scoreRoot = document.getElementById('scores');
  if (scoreRoot) {
    let innerHTML = '<ul>';
    for (const score of scores) {
      innerHTML += `<li><a href="${'/pipescore' + score[1]}">${score[0]}</a></li>`;
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
    updateScores(user.localId, scores.map(doc => [doc.name, doc.__meta__.path.split('/scores').join('')]));
  } else {
    window.location.replace('/login');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const signOutBtn = document.getElementById('sign-out');
  if (signOutBtn) signOutBtn.addEventListener('click', () => auth.signOut());
});
