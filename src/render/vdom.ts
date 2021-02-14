import { VElement, VString, VCache, AnyV } from './types';

const isVString = (a: AnyV): a is VString => (a as VString).s !== undefined;
const isVCache = (a: AnyV): a is VCache => (a as VCache).data !== undefined;
const isVElement = (a: AnyV): a is VElement => (a as VElement).name !== undefined;

function arraycmp<A>(a: A[], b: A[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((el, i) => b[i] === el);
}

function patchNew(v: VElement): Element {
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

  for (const child in v.children) {
    const aft = v.children[child];
    if (aft === null) continue;

    if (isVString(aft)) {
      const d = document.createTextNode(aft.s);
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
export default function patch(before: VElement, after: VElement): Element {
  if (before.node === null) {
    return patchNew(after);
  }
  for (const attr in after.attrs) {
    if (before.attrs[attr] !== after.attrs[attr]) {
      before.node.setAttribute(attr, after.attrs[attr].toString());
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
    // todo nmap
    const domChild = bef && (isVCache(bef) ? (bef.cachedVElement ? bef.cachedVElement.node : null) : bef.node);
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
        const d = document.createTextNode(aft.s);
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
        if (! arraycmp(bef.data, aft.data)) {
          if (! bef.cachedVElement) {
            bef.cachedVElement = bef.fn(bef.data);
          }
          if (! aft.cachedVElement) {
            aft.cachedVElement = aft.fn(aft.data);
          }
          patch(bef.cachedVElement, aft.cachedVElement);
        } else {
          //console.log('skipping cache');
          aft.cachedVElement = bef.cachedVElement;
        }
      } else {
        throw Error('can\'t deal with different things right now');
      }
    }
  }
  after.node = before.node;
  return after.node;
}
