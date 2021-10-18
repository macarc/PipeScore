/*
  Helper to add hoverable documentation to any HTML element
  Copyright (C) 2021 macarc
*/
import { V } from '../../render/h';
import { Dispatch } from '../Controllers/Controller';
import { hoverDoc } from '../Controllers/Doc';

export function help(dispatch: Dispatch, docName: string, element: V): V {
  const initialMouseOver = element.events['mouseover'];
  const initialMouseOut = element.events['mouseout'];
  element.events['mouseover'] = (e) => {
    dispatch(hoverDoc(docName));
    if (initialMouseOver) initialMouseOver(e);
  };
  element.events['mouseout'] = (e) => {
    dispatch(hoverDoc(''));
    if (initialMouseOut) initialMouseOut(e);
  };
  return element;
}
