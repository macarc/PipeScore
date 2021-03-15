# Render

This directory contains the virtual DOM implementation for PipeScore. It's still quite rough around the edges and there are cases I haven't handled yet, as they haven't come up yet.

The API is in the `h.ts` file. Usage is as follows:-

```typescript
import { h, hFrom, patch } from 'render/h';

const root = hFrom('some-empty-div-id')
const vdom = h('div', { style: 'font-size: 1rem' }, { click: () => alert('hi') }, [
  h('p', ['some text'])
])

patch(root, vdom)

const newVdom = h('div', { style: 'font-size: 1.1rem' }, { click: () => alert('hi') }, [
  h('p', { style: 'color: red' }, ['updated text']),
])
patch(vdom, newVdom)
```

`patch` efficiently diffs the virtual DOM and updates the DOM only in the places it has changed, which is much faster than using the DOM (raw DOM manipulation is *really* slow, because of repaints e.t.c.)

## Optimising

The `cache` function produces a virtual cache that will do an equality check on its arguments every time it diffs, which can improve performance as if the arguments haven't changed it will skip the patch. This should only be done with pure functions, since side effects are not guaranteed to be called.

```typescript
import { cache, h, patch } from 'render/h'

const vdom = h('div', [
  h('p', ['hi']),
  cache([1,2,3], (a,b,c) => h('p', { width: a, height: b, 'margin-left': c }))
])
const newvdom = h('div', [
  h('p', ['updated']),
  cache([1,2,3], (a,b,c) => h('p', { width: a, height: b, 'margin-left': c ))
])

patch(vdom,newvdom) // This won't diff the second 'p' element, since [1,2,3] and [1,2,3] have the same elements
```

I haven't actually added any caching to PipeScore yet, so there are bound to be bugs with this I haven't found yet. There are still some cases with it that will throw exceptions.


## Bottlenecks
* add/removeEventListener - this is the main one, since every patch replaces every event listener. Caching/caching list render will help. Is there a way to avoid doing this without caching?
* setAttribute