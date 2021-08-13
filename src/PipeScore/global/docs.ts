import { V } from '../../render/h';
import { Dispatch } from '../Event';

export function help(dispatch: Dispatch, docName: string, element: V): V {
  const initialMouseOver = element.events['mouseover'];
  const initialMouseOut = element.events['mouseout'];
  element.events['mouseover'] = (e) => {
    dispatch({ name: 'hover doc', element: docName });
    if (initialMouseOver) initialMouseOver(e);
  };
  element.events['mouseout'] = (e) => {
    dispatch({ name: 'hover doc', element: '' });
    if (initialMouseOut) initialMouseOut(e);
  };
  return element;
}
