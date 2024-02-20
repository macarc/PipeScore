//  PipeScore - online bagpipe notation
//  Copyright (C) macarc
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
import { onUserChange } from '../auth-helper';

// This can be safely public
const apiToken = 'AIzaSyDQXDp-MUDHHnjNg3LX-furdTZ2GSRcV2k';
const auth = new Auth({ apiKey: apiToken });

onUserChange(auth, (user) => {
  if (user) window.location.assign('/scores');
});

function prettifyError(e: { message: string }) {
  const words = e.message.split('_');
  if (words.length > 0) {
    let s = words[0][0] + words[0].slice(1).toLowerCase();
    for (const word of words.slice(1)) {
      s += ' ';
      s += word.toLowerCase();
    }
    return s;
  }
  return 'Unknown error';
}

function error(text: string, type: 'login' | 'signup') {
  const el = document.getElementById(`${type}-error`);
  if (el) {
    el.innerText = text;
    el.style.display = 'block';
  }
}

function loginError(text: string) {
  error(text, 'login');
}

function signupError(text: string) {
  error(text, 'signup');
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
          loginError('Please enter email and password');
        } else {
          auth.signIn(email, passwd).catch((e) => loginError(prettifyError(e)));
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
          signupError('Passwords do not match!');
        } else if (!email || !passwd) {
          signupError('Please enter email and password');
        } else {
          auth
            .signUp(email, passwd)
            .catch((e) => signupError(prettifyError(e)));
        }
      }
    });
});
