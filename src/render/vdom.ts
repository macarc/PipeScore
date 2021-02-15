import { VElement, VString, VCache, AnyV } from './types';

const isVString = (a: AnyV): a is VString => (a as VString).s !== undefined;
const isVCache = (a: AnyV): a is VCache => (a as VCache).data !== undefined;
const isVElement = (a: AnyV): a is VElement => (a as VElement).name !== undefined;

function arraycmp<A>(a: A[], b: A[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((el, i) => b[i] === el);
}

function patchNew(v: VElement, topLevel = false): Element {
  // todo - use DocumentFragment
  //console.log('creating element', v.name)
  let newElement: Element;
  if (v.attrs.ns) {
    newElement = document.createElementNS(v.attrs.ns.toString(), v.name);
  } else {
    newElement = document.createElement(v.name);
  }

  for (const attr in v.attrs) {
    newElement.setAttribute(attr, v.attrs[attr].toString());
  }
  for (const event in v.events) {
    newElement.addEventListener(event, v.events[event]);
  }

  let parent: DocumentFragment | Element;
  if (topLevel) {
    parent = new DocumentFragment();
  } else {
    parent = newElement;
  }
  for (const child in v.children) {
    const aft = v.children[child];
    if (aft === null) continue;

    if (isVString(aft)) {
      const d = document.createTextNode(aft.s);
      parent.appendChild(d);
      aft.node = d;
    } else if (isVCache(aft)) {
      if (!aft.cachedVElement) {
        // todo do I need to check for cmp?
        // do I need to call the fn?
        aft.cachedVElement = aft.fn(aft.data);
      }
      const nu = patchNew(aft.cachedVElement);
      parent.appendChild(nu);
    } else {
      const d = patchNew(aft);
      parent.appendChild(d);
    }
  }
  if (topLevel) {
    newElement.appendChild(parent);
  }
  v.node = newElement;
  return newElement;
}
// returns true if the after.node !== before.node (i.e. the node needs to be replaced
export default function patch(before: VElement, after: VElement): boolean {
  if (before.node === null || before.name.toLowerCase() !== after.name.toLowerCase()) {
    patchNew(after, true);
    return true;
  }
  after.node = before.node;
  for (const attr in after.attrs) {
    if (before.attrs[attr] !== after.attrs[attr]) {
      before.node.setAttribute(attr, after.attrs[attr].toString());
    }
  }
  for (const event in after.events) {
    if (before.events[event] !== after.events[event]) {
      after.node.removeEventListener(event, before.events[event]);
        after.node.addEventListener(event, after.events[event]);
    }
  }
  for (const child in after.children) {
    const aft = after.children[child];
    const bef = before.children[child];
    // todo nmap
    const oldNode: Node | null = bef && (isVCache(bef) ? (bef.cachedVElement ? bef.cachedVElement.node : null) : bef.node);
    if (aft === null) {
      if (bef && oldNode) {
        after.node.removeChild(oldNode);
      }
    } else if (! bef || ! oldNode) {
      if (isVElement(aft)) {
        const newElement = patchNew(aft, true);
        after.node.appendChild(newElement);
        aft.node = newElement;
      } else if (isVString(aft)) {
        const d = document.createTextNode(aft.s);
        after.node.appendChild(d);
        aft.node = d;
      } else if (isVCache(aft)) {
        // can maybe be skipped
        aft.cachedVElement = aft.fn(aft.data);
        const newElement = patchNew(aft.cachedVElement, true);
        after.node.appendChild(newElement);
      }
    } else {
      if (isVString(bef) || isVString(aft)) {
        if (aft !== bef && isVString(aft)) {
          oldNode.nodeValue = aft.s;
          aft.node = oldNode;
        }
      } else if (isVElement(bef) && isVElement(aft)) {
        const isNewNode = patch(bef, aft)
        if (isNewNode && aft.node && bef.node) {
          after.node.replaceChild(aft.node, bef.node);
        }
      } else if (isVCache(bef) && isVCache(aft)) {
        if (! arraycmp(bef.data, aft.data)) {
          if (! bef.cachedVElement) {
            bef.cachedVElement = bef.fn(bef.data);
          }
          if (! aft.cachedVElement) {
            aft.cachedVElement = aft.fn(aft.data);
          }
          const isNewNode = patch(bef.cachedVElement, aft.cachedVElement);
          if (isNewNode && aft.cachedVElement.node && bef.cachedVElement.node) {
            after.node.replaceChild(aft.cachedVElement.node, bef.cachedVElement.node);
          }
        } else {
          //console.log('skipping cache');
          aft.cachedVElement = bef.cachedVElement;
        }
      } else {
        throw Error('can\'t deal with different things right now');
      }
    }
  }
  return false;
}
