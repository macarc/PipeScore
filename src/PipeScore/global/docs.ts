import { V } from '../../render/h';
import { Dispatch } from '../Event';


export function help(dispatch: Dispatch, docName: string, element: V): V {
  const initialMouseOver = element.events['mouseover'];
  element.events['mouseover'] = e => {
    dispatch({ name: 'doc hover', element: docName });
    if (initialMouseOver) initialMouseOver(e);
  };
  return element;
}
