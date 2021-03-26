/*
   Copyright (C) 2021 Archie Maclean
 */

// A simple HTML dialogue box
// todo: I'm using this more extensively now, could probably do with using VDOM

import { h, hFrom, V } from '../../render/h';
import patch from '../../render/vdom';

export let dialogueBoxIsOpen = false;

export default function dialogueBox<A>(inner: V[], serialise: (form: HTMLFormElement) => A | null, blank: A): Promise<A> {
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
  const root = hFrom(box);
  return new Promise(res => {
    patch(root, h('div', { id: 'dialogue-box' }, [
      h('form', { id: 'dialogue-form' }, { submit: (e: Event) => {
        dialogueBoxIsOpen = false;
        e.preventDefault();
        let data: A | null = blank;
        const form = e.target;
        if (form instanceof HTMLFormElement) data = serialise(form);
        document.body.removeChild(parent);
        res(data || blank);
      } }, [
        ...inner,
        h('input', { type: 'button', id: 'cancel-btn', value: 'Cancel' }, { click: () => {
          dialogueBoxIsOpen = false;
          document.body.removeChild(parent);
          res(blank);
        } }),
        h('input', { type: 'submit', class: 'continue', value: 'Continue' })
      ])

    ]));
  });
}
