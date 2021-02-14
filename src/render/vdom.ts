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
  children: (AnyV | null)[],
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

type AnyV = VElement | VCache | VString;

type V = VElement;

const isVString = (a: AnyV): a is VString => (a as VString).s !== undefined;
const isVCache = (a: AnyV): a is VCache => (a as VCache).data !== undefined;
const isVElement = (a: AnyV): a is VElement => (a as VElement).name !== undefined;

function arraycmp(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i=0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function h(name: string, attrs: Attributes, events: Events, children: (VElement | VCache | string | null)[]): VElement {
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
  console.log('creating element', v.name)
  const newElement = document.createElement(v.name);

  for (const attr in v.attrs) {
    newElement.setAttribute(attr, v.attrs[attr]);
  }
  for (const event in v.events) {
    newElement.addEventListener(event, v.events[event]);
  }

  for (const child in v.children) {
    const aft = v.children[child];
    if (aft === null) continue;

    if (isVString(aft)) {
      let d = document.createTextNode(aft.s);
      newElement.appendChild(d);
      aft.node = d;
    } else if (isVCache(aft)) {
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

const enum Change { Modified, Removed, Added }

interface Diff<A> {
  index: number,
  change: Change,
  newValue: A
}

function diffuneven<A>(longer: A[], shorter: A[], addChange: Change, removeChange: Change): Diff<A>[] {
  let lengthDiff = longer.length - shorter.length;
  let elementsAdded = [];
  let so = 0; // shorter indexing offset
  for (let i=0; i < longer.length; i++) {
    if (longer[i] !== shorter[i + so]) {
      if (longer[i] === shorter[i + so + 1]) {
        const diff = {
          index: i,
          change: removeChange,
          newValue: shorter[i + so]
        }
        elementsAdded.push(diff);
        lengthDiff += 1;
        so += 1;
      } else {
        let elementsBetween = [];
        let isAddedElements = false;
        let j = 0;
        for (; j <= lengthDiff; j++) {
          if (longer[i + j] === shorter[i + so]) {
            isAddedElements = true;
            break;
          } else {
            const diff = {
              index: i + j, //index i because it will be inserted at index i
              change: removeChange,
              newValue: longer[i + j]
            }
            elementsBetween.push(diff);
          }
        }

        if (isAddedElements) {
          i += j;
          elementsAdded.push(...elementsBetween);
          lengthDiff -= j;
          so -= j;
        } else {
          console.log(shorter[i + so], longer[i]);
          const diff = {
            index: i,
            change: Change.Modified,
            newValue: longer[i]
          }
          elementsAdded.push(diff);
        }
      }
    }
  }

  return elementsAdded;

}

// the indexes it returns are intended to be used from right to left, insert/deleting along the way
// TODO this is currently not the case for when before.length > after.length
function difflist<A>(before: A[], after: A[]): Diff<A>[] {
  if (before.length > after.length) {
    return diffuneven(before, after, Change.Added, Change.Removed);
  } else if (after.length > before.length) {
    return diffuneven(after, before, Change.Removed, Change.Added);
  } else {
    // this doesn't do anything fancy like checking if elements are swapped, but actually that will not happen very much
    const changes = [];
    for (let i = 0; i < after.length; i++) {
      if (after[i] !== before[i]) {
        const diff = {
          index: i,
          change: Change.Modified,
          newValue: after[i]
        }
        changes.push(diff);
      }
    }
    return changes;
  }
}

function patch(before: VElement, after: VElement) {
  if (before.node === null) {
    return patchNew(after);
  }
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
    let domChild = bef && (isVCache(bef) ? (bef.cachedVElement.node) : bef.node);
    if (aft === null) {
      if (bef && domChild) {
        before.node.removeChild(domChild);
      }
    } else if (! bef || ! domChild) {
      if (isVElement(aft)) {
        const newElement = patchNew(aft);
        before.node.appendChild(newElement);
        aft.node = newElement;
      } else if (isVString(aft)) {
        let d = document.createTextNode(aft.s);
        before.node.appendChild(d);
        aft.node = d;
      } else if (isVCache(aft)) {
        // can maybe be skipped
        aft.cachedVElement = aft.fn(aft.data);
        const newElement = patchNew(aft.cachedVElement);
        before.node.appendChild(newElement);
      }
    } else {
      if (isVString(bef) || isVString(aft)) {
        if (aft !== bef && isVString(aft)) {
          domChild.nodeValue = aft.s;
          aft.node = domChild;
        }
      } else if (isVElement(bef) && isVElement(aft)) {
        patch(bef, aft)
      } else if (isVCache(bef) && isVCache(aft)) {
        throw Error('no caches warg');
      } else {
        throw Error('can\'t deal with different things right now');
      }
    }
  }
  after.node = before.node;
  return after.node;
}

// TESTS

let st: V;

function Note(c: string) {
  return h('p', {}, {}, [c]);
}

function Score(counter: number): V {
  //return h('div', { id: 'score' }, { mousedown: () => dispatch(counter) }, ['hello, world!', Note(counter.toString())]);
  return h('div', { id: 'score' }, { mousedown: () => dispatch(counter) }, ['hello, world!', (Math.random() < 0.5 ? h('p', {}, {}, ['hi']) : null), Note(counter.toString())]);
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
