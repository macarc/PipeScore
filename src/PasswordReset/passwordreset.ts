import Auth from 'firebase-auth-lite';

const apiKey = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
const auth = new Auth({
  apiKey,
  redirectUri: 'https://pipescore.web.app/login',
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (
      document.querySelector('input[type="email"]') as HTMLInputElement
    )?.value;
    if (email) {
      auth
        .sendOobCode('PASSWORD_RESET', email)
        .then(() => window.location.replace('/sentemail'))
        .catch((e) => {
          alert(
            'An error occured while sending the email. Contact me (see the contact page).'
          );
          console.log(e);
        });
    }
  });
});
