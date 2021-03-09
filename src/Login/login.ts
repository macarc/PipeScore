import Auth from 'firebase-auth-lite';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
const auth = new Auth({ apiKey: apiToken });

auth.listen(user => {
  if (user) window.location.assign('/scores')
});


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login');
  if (loginForm && loginForm instanceof HTMLFormElement) loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const emailEl = loginForm.querySelector('input[type="email"]');
    const passwdEl = loginForm.querySelector('input[type="password"]');
    if (emailEl && passwdEl && emailEl instanceof HTMLInputElement && passwdEl instanceof HTMLInputElement) {
      const email = emailEl.value;
      const passwd = passwdEl.value;
      if (!email || !passwd) {
        alert('Please enter email and password');
      } else {
        auth.signIn(email, passwd)
          .catch(() => alert('Invalid username or password'));
      }
    }
  });
  const signUpForm = document.getElementById('signup');
  if (signUpForm && signUpForm instanceof HTMLFormElement) signUpForm.addEventListener('submit', e => {
    e.preventDefault();
    const emailEl = signUpForm.querySelector('input[type="email"]');
    const passwdEl = signUpForm.querySelector('#first-pwd');
    const passwdRepeatEl = signUpForm.querySelector('#second-pwd');
    if (emailEl && passwdEl && passwdRepeatEl && emailEl instanceof HTMLInputElement && passwdEl instanceof HTMLInputElement && passwdRepeatEl instanceof HTMLInputElement) {
      const email = emailEl.value;
      const passwd = passwdEl.value;
      const passwd2 = passwdRepeatEl.value;
      if (passwd !== passwd2) {
        alert('Passwords do not match!');
      } else if (!email || !passwd) {
        alert('Please enter email and password');
      } else {
        auth.signUp(email, passwd)
          .catch(() => alert('Invalid username or password'));
      }
    }
  });
});
