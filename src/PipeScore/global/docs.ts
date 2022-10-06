/*
  Helper to add hoverable documentation to any HTML element
  Copyright (C) 2021 macarc
*/
import m from 'mithril';
import { dispatch } from '../Controller';
import { hoverDoc } from '../Events/Doc';

export function help(docName: string, element: m.Vnode): m.Vnode {
  const attrs = element.attrs as {
    onmouseover: (e: MouseEvent) => void;
    onmouseout: (e: MouseEvent) => void;
  };
  const initialMouseOver = attrs.onmouseover;
  const initialMouseOut = attrs.onmouseout;
  attrs.onmouseover = (e: MouseEvent) => {
    dispatch(hoverDoc(docName));
    if (initialMouseOver) initialMouseOver(e);
  };
  attrs.onmouseout = (e: MouseEvent) => {
    dispatch(hoverDoc(''));
    if (initialMouseOut) initialMouseOut(e);
  };
  return element;
}
