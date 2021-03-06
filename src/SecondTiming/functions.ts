/*
   Copyright (C) 2020 Archie Maclean
 */
import { ID } from '../global/types';
import { getXY } from '../global/state';

import { SecondTimingModel } from './model';

function isValid(st: SecondTimingModel): boolean {
  // This function checks if a second timing model is valid
  // It checks that start, middle, and end are in a valid order

  const start = getXY(st.start);
  const middle = getXY(st.middle);
  const end = getXY(st.end);
  if (start && middle && end) {
    return (((start.beforeX < middle.beforeX) && (start.y === middle.y)) || (start.y < middle.y)) && (((middle.beforeX < end.afterX) && (middle.y === end.y)) || (middle.y < end.y));
  } else {
    return false;
  }
}

const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  init,
  isValid
}
