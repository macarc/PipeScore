/*
   Virtual DOM API
   Copyright (C) 2021 macarc
 */
import { V, VElement, Attributes, Events } from './types';

type Child = VElement | string | null;

function h(name: string): VElement;
function h(name: string, children: Child[]): VElement;
function h(name: string, attrs: Attributes): VElement;
function h(name: string, attrs: Attributes, children: Child[]): VElement;
function h(name: string, attrs: Attributes, events: Events): VElement;
function h(
  name: string,
  attrs: Attributes,
  events: Events,
  children: Child[]
): VElement;

function h(
  name: string,
  a: Attributes | Child[] = {},
  b: Events | Child[] = {},
  c: Child[] = []
): VElement {
  // Creates a virtual DOM node

  const childrenOf = (children: Child[]) =>
    children.map((s) => (typeof s === 'string' ? { s, node: null } : s));
  if (Array.isArray(a)) {
    return { name, attrs: {}, events: {}, children: childrenOf(a), node: null };
  } else {
    if (Array.isArray(b)) {
      return {
        name,
        attrs: a,
        events: {},
        children: childrenOf(b),
        node: null,
      };
    } else {
      return { name, attrs: a, events: b, children: childrenOf(c), node: null };
    }
  }
}

function svg(name: string): VElement;
function svg(name: string, children: Child[]): VElement;
function svg(name: string, attrs: Attributes): VElement;
function svg(name: string, attrs: Attributes, children: Child[]): VElement;
function svg(name: string, attrs: Attributes, events: Events): VElement;
function svg(
  name: string,
  attrs: Attributes,
  events: Events,
  children: Child[]
): VElement;

function svg(
  name: string,
  a: Attributes | Child[] = {},
  b: Events | Child[] = {},
  c: Child[] = []
): VElement {
  // Creates a virtual DOM node that is an SVG element

  if (Array.isArray(a)) {
    return h(name, { ns: 'http://www.w3.org/2000/svg' }, {}, a);
  } else {
    a.ns = 'http://www.w3.org/2000/svg';
    if (Array.isArray(b)) {
      return h(name, a, {}, b);
    } else {
      return h(name, a, b, c);
    }
  }
}

export function hFrom(element: string | HTMLElement): V {
  // Converts an empty element to a virtual DOM element
  // If a string is passed, uses that as an id

  const el =
    typeof element === 'string' ? document.getElementById(element) : element;
  if (!el) return h('div');

  return { name: el.tagName, attrs: {}, events: {}, children: [], node: el };
}

export { V, h, svg, Attributes };
