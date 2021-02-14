
export interface Attributes {
  [attr: string]: string
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
  data: any[],
  fn: (...args: any) => VElement,
  cachedVElement: VElement | null
}

export interface VString {
  s: string,
  node: Node | null
}

export type AnyV = VElement | VCache | VString;

export type V = VElement;

