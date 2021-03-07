import Auth from 'firebase-auth-lite';

const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
const auth = new Auth({ apiKey: apiToken });

auth.listen(user => {
  if (user) window.location.replace('/scores')
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementsByTagName('form')[0].addEventListener('submit', e => {
    e.preventDefault();
    const emailEl = document.querySelector('input[type="email"]');
    const passwdEl = document.querySelector('input[type="password"]');
    if (emailEl && passwdEl && emailEl instanceof HTMLInputElement && passwdEl instanceof HTMLInputElement) {
      const email = emailEl.value;
      const passwd = passwdEl.value;
      if (!email || !passwd) {
        alert('Please enter email and password');
      } else {
        auth.signIn(email, passwd)
          //.then(() => window.location.replace('/scores'))
          .catch(() => alert('Invalid username or password'));
      }
    }
  });
});
