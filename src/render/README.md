# Render

This directory contains the virtual DOM implementation for PipeScore. It's still quite rough around the edges and there are cases I haven't handled yet, as they haven't come up yet.

The API is in the `h.ts` file. Usage is as follows:-

```typescript
import { h, hFrom, patch } from 'render/h';

const root = hFrom('some-empty-div-id');
const vdom = h(
  'div',
  { style: 'font-size: 1rem' },
  { click: () => alert('hi') },
  [h('p', ['some text'])]
);

patch(root, vdom);

const newVdom = h(
  'div',
  { style: 'font-size: 1.1rem' },
  { click: () => alert('hi') },
  [h('p', { style: 'color: red' }, ['updated text'])]
);
patch(vdom, newVdom);
```

`patch` efficiently diffs the virtual DOM and updates the DOM only in the places it has changed, which is much faster than using the DOM (raw DOM manipulation is _really_ slow, because of repaints e.t.c.)

There will eventually be a more optimised `difflist` - the beginning is in `difflist.ts`.

## Bottlenecks

- add/removeEventListener - this is the main one, since every patch replaces every event listener. Caching/caching list render will help. Is there a way to avoid doing this without caching?
- setAttribute
