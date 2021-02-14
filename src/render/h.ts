import { V, VElement, VCache, Attributes, Events } from './types';

type Child = VElement | VCache | string | null;

function h(name: string): VElement
function h(name: string, children: Child[]): VElement
function h(name: string, attrs: Attributes): VElement
function h(name: string, attrs: Attributes, children: Child[]): VElement
function h(name: string, attrs: Attributes, events: Events): VElement
function h(name: string, attrs: Attributes, events: Events, children: Child[]): VElement

function h(name: string, a: Attributes | Child[] = {}, b: Events | Child[] = {}, c: Child[] = []): VElement {
  const childrenOf = (children: Child[]) => children.map(s => (typeof s === 'string') ? { s, node: null } : s)
  if (Array.isArray(a)) {
    return { name, attrs: {}, events: {}, children: childrenOf(a), node: null };
  } else {
    if (Array.isArray(b)) {
      return { name, attrs: a, events: {}, children: childrenOf(b), node: null };
    } else {
      return { name, attrs: a, events: b, children: childrenOf(c), node: null };
    }
  }
}

function svg(name: string): VElement
function svg(name: string, children: Child[]): VElement
function svg(name: string, attrs: Attributes): VElement
function svg(name: string, attrs: Attributes, children: Child[]): VElement
function svg(name: string, attrs: Attributes, events: Events): VElement
function svg(name: string, attrs: Attributes, events: Events, children: Child[]): VElement

function svg(name: string, a: Attributes | Child[] = {}, b: Events | Child[] = {}, c: Child[] = []): VElement {
  if (Array.isArray(a)) {
    return h(name, { ns: 'http://www.w3.org/2000/svg' }, {}, a);
  } else {
    a.ns = 'http://www.w3.org/2000/svg';
    if (Array.isArray(b)) {
      return h(name, a, {}, b);
    } else {
      return h(name, a, b,c );
    }
  }
}

// element with the id MUST be empty
export function hFrom(id: string): V {
  const el = document.getElementById(id);
  if (! el) return h('div');

  return { name: el.tagName, attrs: {}, events: {}, children: [], node: el };
}

export function cache<Fn extends (...a: any) => VElement>(args: Parameters<Fn>, fn: Fn): VCache {
  return ({
    data: args,
    fn: fn,
    cachedVElement: null
  });
}

export { V, h, svg };
