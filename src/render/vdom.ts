/*
   Virtual DOM implementation - still needs work
   Copyright (C) 2021 macarc
 */
import { VElement, VString, AnyV } from './types';

const isVString = (a: AnyV): a is VString => (a as VString).s !== undefined;
const isVElement = (a: AnyV): a is VElement =>
  (a as VElement).name !== undefined;

function patchNew(v: VElement, topLevel = false): Element {
  // Create a new element from a virtual node
  // Uses DocumentFragment for good-ish performance

  let newElement: Element;
  if (v.attrs.ns) {
    newElement = document.createElementNS(v.attrs.ns.toString(), v.name);
  } else {
    newElement = document.createElement(v.name);
  }

  for (const attr in v.attrs) {
    if (typeof v.attrs[attr] === 'boolean') {
      if (v.attrs[attr])
        newElement.setAttribute(attr, v.attrs[attr].toString());
    } else {
      newElement.setAttribute(attr, v.attrs[attr].toString());
    }
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
    if (aft === null || aft === undefined) continue;

    if (isVString(aft)) {
      const d = document.createTextNode(aft.s);
      parent.appendChild(d);
      aft.node = d;
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
export default function patch(before: VElement, after: VElement): boolean {
  // Patches after onto before
  // Compares both virtual DOM and efficiently updates the real DOM (actual DOM mutation is slow)
  // Returns true if after.node !== before.node (i.e. the node needs to be replaced)

  if (
    before.node === null ||
    before.name.toLowerCase() !== after.name.toLowerCase()
  ) {
    patchNew(after, true);
    return true;
  }
  after.node = before.node;
  for (const attr in { ...before.attrs, ...after.attrs }) {
    if (before.attrs[attr] !== after.attrs[attr]) {
      if (
        after.attrs[attr] === null ||
        after.attrs[attr] === undefined ||
        after.attrs[attr] === false
      ) {
        before.node.removeAttribute(attr);
      } else if (typeof after.attrs[attr] === 'boolean') {
        before.node.setAttribute(attr, after.attrs[attr].toString());
      } else {
        before.node.setAttribute(attr, after.attrs[attr].toString());
      }
    }
  }
  for (const event in { ...before.events, ...after.events }) {
    if (before.events[event] !== after.events[event]) {
      after.node.removeEventListener(event, before.events[event]);
      after.node.addEventListener(event, after.events[event]);
    }
  }
  const notNull = <A>(a: A | null): a is A => a !== null;

  before.children = before.children.filter(notNull);
  after.children = after.children.filter(notNull);

  // todo this could probably be more efficient
  const childrenDiffLength = before.children.length - after.children.length;
  for (let i = 0; i < childrenDiffLength; i++) {
    before.node.removeChild(
      before.node.childNodes[before.node.childNodes.length - 1]
    );
  }
  let reachedEndOfBeforeChildren = false;
  const beforeChildrenLength = before.children.length;
  for (let child = 0; child < after.children.length; child++) {
    const aft = after.children[child];
    const bef = before.children[child] || null;
    const oldNode: Node | null = bef && bef.node;

    reachedEndOfBeforeChildren = child >= beforeChildrenLength;
    if (aft === null || aft === undefined) {
      if (bef && oldNode) {
        after.node.removeChild(oldNode);
      }
    } else if (bef === null && !reachedEndOfBeforeChildren) {
      if (isVElement(aft)) {
        const newElement = patchNew(aft, true);
        after.node.insertBefore(
          newElement,
          before.node.children[child] || null
        );
        aft.node = newElement;
      } else if (isVString(aft)) {
        const newElement = document.createTextNode(aft.s);
        after.node.insertBefore(
          newElement,
          before.node.children[child] || null
        );
        aft.node = newElement;
      }
    } else if (!bef || !oldNode || reachedEndOfBeforeChildren) {
      if (isVElement(aft)) {
        const newElement = patchNew(aft, true);
        after.node.appendChild(newElement);
        aft.node = newElement;
      } else if (isVString(aft)) {
        const d = document.createTextNode(aft.s);
        after.node.appendChild(d);
        aft.node = d;
      }
    } else {
      if (isVString(bef) || isVString(aft)) {
        if (aft !== bef && isVString(aft)) {
          oldNode.nodeValue = aft.s;
          aft.node = oldNode;
        }
      } else if (isVElement(bef) && isVElement(aft)) {
        const isNewNode = patch(bef, aft);
        if (isNewNode && aft.node && bef.node) {
          after.node.replaceChild(aft.node, bef.node);
        }
      } else {
        throw Error("can't deal with different things right now");
      }
    }
  }
  return false;
}
