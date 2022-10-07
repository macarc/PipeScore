/*
  A simple HTML dialogue box
  Copyright (C) 2021 macarc
*/
import m from 'mithril';

export let dialogueBoxIsOpen = false;

// Display a pop-up form
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
