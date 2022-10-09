//  PipeScore - online bagpipe notation
//  Copyright (C) 2022 macarc
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU General Public License for more details.
//
//  You should have received a copy of the GNU General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

//  The JS necessary for the login page

import Auth from 'firebase-auth-lite';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
const auth = new Auth({ apiKey: apiToken });

auth.listen((user) => {
  if (user) window.location.assign('/scores');
});

function prettifyError(e: { message: string }) {
  let s = '';
  for (const word of e.message.split('_')) {
    s += ' ';
    s += word[0] + word.slice(1).toLowerCase();
  }
  return s.slice(1);
}
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login');
  if (loginForm && loginForm instanceof HTMLFormElement)
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailEl = loginForm.querySelector('input[type="email"]');
      const passwdEl = loginForm.querySelector('input[type="password"]');
      if (
        emailEl instanceof HTMLInputElement &&
        passwdEl instanceof HTMLInputElement
      ) {
        const email = emailEl.value;
        const passwd = passwdEl.value;
        if (!email || !passwd) {
          alert('Please enter email and password');
        } else {
          auth
            .signIn(email, passwd)
            .catch((e) => alert('An error occurred: ' + prettifyError(e)));
        }
      }
    });
  const signUpForm = document.getElementById('signup');
  if (signUpForm && signUpForm instanceof HTMLFormElement)
    signUpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailEl = signUpForm.querySelector('input[type="email"]');
      const passwdEl = signUpForm.querySelector('#first-pwd');
      const passwdRepeatEl = signUpForm.querySelector('#second-pwd');
      if (
        emailEl instanceof HTMLInputElement &&
        passwdEl instanceof HTMLInputElement &&
        passwdRepeatEl instanceof HTMLInputElement
      ) {
        const email = emailEl.value;
        const passwd = passwdEl.value;
        const passwd2 = passwdRepeatEl.value;
        if (passwd !== passwd2) {
          alert('Passwords do not match!');
        } else if (!email || !passwd) {
          alert('Please enter email and password');
        } else {
          auth
            .signUp(email, passwd)
            .catch(() => alert('Invalid username or password'));
        }
      }
    });
});
