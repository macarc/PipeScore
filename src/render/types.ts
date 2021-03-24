/*
   Copyright (C) 2021 Archie Maclean
 */
export interface Attributes {
  [attr: string]: string | number | boolean
}

export interface Events {
  [event: string]: (e: Event) => void
}

export interface VElement {
  name: string,
  attrs: Attributes,
  events: Events,
  children: (AnyV | null)[],
  node: Element | null
}

export interface VCache {
  // while this isn't type-safe, it should only be created from the h/cache() function which is
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (...args: any) => VElement,
  cachedVElement: VElement | null
}

export interface VString {
  s: string,
  node: Node | null
}

export type AnyV = VElement | VCache | VString;

export type V = VElement;

