// A simple, raw HTML dialogue box
// It uses raw HTML because it's outside the main dispatch loop and it's not very complicated, so there's no real reason to use VDOM
// It also is not built for speed (uses set innerHTML), but that's OK since it will never be called lots of times very quickly

export default function dialogueBox<A>(inner: string, serialise: (form: HTMLFormElement) => A | null, blank: A): Promise<A> {
  // using raw HTML because it's quick :)
  const parent = document.createElement('div');
  parent.id = 'dialogue-parent';
  const back = document.createElement('div');
  back.id = 'dialogue-modal';
  const box = document.createElement('div');
  box.id = 'dialogue-box';
  box.innerHTML = '<form id="dialogue-form" onsubmit="">' + inner + '<input type="button" id="cancel-btn" value="Cancel" /><input type="submit" class="continue" value="Continue" /></form>';
  parent.appendChild(back);
  parent.appendChild(box);
  document.body.append(parent);
  return new Promise((res) => {
    const form = document.getElementById('dialogue-form');
    if (form) form.addEventListener('submit', (e) => {
      e.preventDefault();
      let data: A | null = blank;
      if (form instanceof HTMLFormElement) data = serialise(form);
      document.body.removeChild(parent);
      res(data || blank);
    });

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      document.body.removeChild(parent);
      res(blank);
    });
  });
}
