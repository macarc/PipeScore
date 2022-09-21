/*
  A simple HTML dialogue box
  Copyright (C) 2021 macarc
*/
import m from 'mithril';

export let dialogueBoxIsOpen = false;

export default function dialogueBox<A>(
  inner: m.Children[],
  serialise: (form: HTMLFormElement) => A | null,
  blank: A,
  cancelable = true
): Promise<A> {
  dialogueBoxIsOpen = true;
  const parent = document.createElement('div');
  parent.id = 'dialogue-parent';
  const back = document.createElement('div');
  back.id = 'dialogue-modal';
  const box = document.createElement('div');
  box.id = 'dialogue-box';
  parent.appendChild(back);
  parent.appendChild(box);
  document.body.append(parent);
  return new Promise((res) => {
    m.render(box, [
      m(
        'form[id=dialogue-form]',
        {
          onsubmit: (e: Event) => {
            dialogueBoxIsOpen = false;
            e.preventDefault();
            let data: A | null = blank;
            const form = e.target;
            if (form instanceof HTMLFormElement) data = serialise(form);
            document.body.removeChild(parent);
            res(data || blank);
          },
        },
        [
          ...inner,
          cancelable
            ? m('input', {
                type: 'button',
                id: 'cancel-btn',
                value: 'Cancel',
                onclick: () => {
                  dialogueBoxIsOpen = false;
                  document.body.removeChild(parent);
                  res(blank);
                },
              })
            : null,
          m('input', {
            type: 'submit',
            class: 'continue',
            value: 'Ok',
          }),
        ]
      ),
    ]);
    (document.querySelector('.continue') as HTMLInputElement | null)?.focus();
  });
}
