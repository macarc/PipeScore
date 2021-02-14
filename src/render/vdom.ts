const isString = <T>(a: string | T): a is string => typeof a === 'string';

interface Attributes {
  [attr: string]: string
}

interface Events {
  [event: string]: (e: Event) => void
}

interface VElement {
  name: string,
  attrs: Attributes,
  events: Events,
  children: (VElement | VCache | VString)[],
  node: HTMLElement | null
}

interface VCache {
  data: any[],
  fn: (...args: any) => VElement,
  cachedVElement: VElement
}

interface VString {
  s: string,
  node: Node | null
}

type ThunkFn = (...a: any) => VElement;
type V = VElement;

const isVString = (a: VElement | VString | VCache): a is VString => (a as VString).s !== undefined;
const isThunk = (a: VElement | VCache | VString): a is VCache => (a as VCache).data !== undefined;
const isVElement = (a: VElement | VCache): a is VElement => (a as VCache).data === undefined;

function arraycmp(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i=0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function h(name: string, attrs: Attributes, events: Events, children: (VElement | VCache | string)[]): VElement {
  return { name, attrs, events, children: children.map(s => (typeof s === 'string') ? { s, node: null } : s), node: null };
}
function cache<Fn extends (...a: any) => VElement>(args: Parameters<Fn>, fn: Fn): VCache {
  return ({
    data: args,
    fn: fn,
    cachedVElement: fn(args)
  });
}
function patchNew(v: VElement) {
  console.log('patch replacing')
  const newElement = document.createElement(v.name);

  for (const attr in v.attrs) {
    newElement.setAttribute(attr, v.attrs[attr]);
  }
  for (const event in v.events) {
    newElement.addEventListener(event, v.events[event]);
  }

  for (const child in v.children) {
    const aft = v.children[child];
    if (isVString(aft)) {
      let d = document.createTextNode(aft.s);
      newElement.appendChild(d);
      aft.node = d;
    } else if (isThunk(aft)) {
      if (!aft.cachedVElement) {
        // todo do I need to check for cmp?
        aft.cachedVElement = aft.fn(aft.data);
      }
      patchNew(aft.cachedVElement);
    } else {
      const d = patchNew(aft);
      newElement.appendChild(d);
    }
  }
  v.node = newElement;
  return newElement;
}

function patch(before: VElement | null, after: VElement) {
  if (before === null) {
    return patchNew(after);
  } else if (isVElement(before) && isVElement(after)) {
    if (before.node === null) {
      return patchNew(after);
    }
    console.log('patch not replacing')
    for (const attr in after.attrs) {
      if (before.attrs[attr] !== after.attrs[attr]) {
        before.node.setAttribute(attr, after.attrs[attr]);
      }
    }

    for (const event in after.events) {
      if (before.node) {
        before.node.removeEventListener(event,before.events[event])
      }
      before.node.addEventListener(event, after.events[event]);
    }

    for (const child in after.children) {
      const aft = after.children[child];
      const bef = before.children[child];
      let domChild = bef && (isThunk(bef) ? (bef.cachedVElement?.node || null) : bef.node);
      if (bef && isVString(bef) || isVString(aft)) {
        if (aft !== bef && isVString(aft)) {
          if (!domChild) {
            let d = document.createTextNode(aft.s);
            before.node.appendChild(d);
            aft.node = d;
          } else {
            domChild.nodeValue = aft.s;
            aft.node = domChild;
          }

        }
      } else {
        if (!domChild) {
          if (isVElement(aft)) {
            const newElement = patchNew(aft);
            // todo make more efficient by storing last child
            before.node.insertBefore(newElement, before.node.children[child]);
          } else if (isThunk(aft)) {
            //patch(bef, aft);
          } else {
            throw Error('oh no')
          }
        } else {
          if (isVElement(bef) && isVElement(aft)) {
            patch(bef, aft)
          }
        }
      }
    }
    after.node = before.node;
    return after.node;
  }
}

/*
function _patch(before: VElement | VCache, after: VElement | VCache) {
  if (!before || (isThunk(before) ? (!before.cachedVElement?.node || null) : !before.node)) {
    if (isVElement(after)) {
      return patchNew(after);
    } else if (isThunk(after)) {
    } else {
      throw new Error('no top level strings pls')
    }
  } else if (isVElement(before) && isVElement(after)) {
    console.log('patch not replacing')
    for (const attr in after.attrs) {
      if (before.attrs[attr] !== after.attrs[attr]) {
        before.node.setAttribute(attr, after.attrs[attr]);
      }
    }

    for (const event in after.events) {
      if (before.node) {
        before.node.removeEventListener(event,before.events[event])
      }
      before.node.addEventListener(event, after.events[event]);
    }

    for (const child in after.children) {
      const aft = after.children[child];
      const bef = before.children[child];
      let domChild = bef && (isThunk(bef) ? (bef.cachedVElement?.node || null) : bef.node);
      if (bef && isVString(bef) || isVString(aft)) {
        if (aft !== bef && isVString(aft)) {
          if (!domChild) {
            let d = document.createTextNode(aft.s);
            before.node.appendChild(d);
            aft.node = d;
          } else {
            domChild.nodeValue = aft.s;
            aft.node = domChild;
          }

        }
      } else {
        if (!domChild) {
          if (isVElement(aft)) {
            const newElement = patchNew(aft);
            // todo make more efficient by storing last child
            before.node.insertBefore(newElement, before.node.children[child]);
          } else if (isThunk(aft)) {
            patch(bef, aft);
          } else {
            throw Error('oh no')
          }
        } else {
          patch(bef, aft)
        }
      }
    }
    after.node = before.node;
    return after.node;
  } else if (isThunk(before) && isThunk(after)){
    if (before.cachedVElement === null) {
      throw Error('before.cachedVElement = null');
    } else if (! arraycmp(before.data, after.data)) {
      console.log('patching thunk');
      after.cachedVElement = after.fn(after.data);
      patch(before.cachedVElement, after.cachedVElement);
      return after.cachedVElement.node;
    } else if (after.cachedVElement !== null) {
      console.log('thunk unchanged, skipping');
      return after.cachedVElement.node;
    } else {
      throw Error('after.cachedVElement == null');
    }
  }
}
*/


// TESTS

let st: V;

function Note(c: string) {
  return h('p', {}, {}, [c]);
}

function Score(counter: number): V {
  return h('div', { id: 'score' }, { mousedown: () => dispatch(counter) }, ['hello, world!', Note(counter.toString())]);
}

function dispatch(c: number) {
  let nu = Score(c + 1);
  patch(st, nu);
  st = nu;
}

document.addEventListener("DOMContentLoaded", () => {
  st = { name: 'div', attrs: {}, events: {}, children: [], node: document.getElementById('root') }
  dispatch(0);
});
