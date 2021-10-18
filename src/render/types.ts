/*
   Copyright (C) 2021 macarc
 */
export interface Attributes {
  [attr: string]: string | number | boolean;
}

export interface Events {
  [event: string]: (e: Event) => void;
}

export interface VElement {
  name: string;
  attrs: Attributes;
  events: Events;
  children: (AnyV | null)[];
  node: Element | null;
}

export interface VString {
  s: string;
  node: Node | null;
}

export type AnyV = VElement | VString;

export type V = VElement;
