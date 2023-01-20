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

//  The JS necessary for the password reset page.

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
