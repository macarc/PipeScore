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

//  A simple pop-up form.

import m from 'mithril';

export let dialogueBoxIsOpen = false;

export default function dialogueBox(
  inner: m.Children[],
  cancelable = true
): Promise<HTMLFormElement | null> {
  dialogueBoxIsOpen = true;
  const parent = document.createElement('div');
  parent.id = 'dialogue-parent';
  document.body.append(parent);
  return new Promise((res) => {
    m.render(
      parent,
      m('div#dialogue-box', [
        m(
          'form[id=dialogue-form]',
          {
            onsubmit: (e: Event) => {
              dialogueBoxIsOpen = false;
              e.preventDefault();
              const form = e.target;
              if (form instanceof HTMLFormElement) {
                document.body.removeChild(parent);
                res(form);
              }
              res(null);
            },
          },
          [
            ...inner,
            cancelable
              ? m('input[id=cancel-btn]', {
                  type: 'button',
                  value: 'Cancel',
                  onclick: () => {
                    dialogueBoxIsOpen = false;
                    document.body.removeChild(parent);
                    res(null);
                  },
                })
              : null,
            m('input[class=continue]', {
              type: 'submit',
              value: 'Ok',
            }),
          ]
        ),
      ])
    );
    (document.querySelector('.continue') as HTMLInputElement | null)?.focus();
  });
}
