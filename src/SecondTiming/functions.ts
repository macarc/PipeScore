/*
   Copyright (C) 2020 Archie Maclean
 */
import { ID } from '../global/types';
import { getXY } from '../global/state';

import { SecondTimingModel } from './model';

function isValid(st: SecondTimingModel): boolean {
  const start = getXY(st.start);
  const middle = getXY(st.middle);
  const end = getXY(st.end);
  if (start && middle && end) {
    return (start.beforeX < middle.afterX) && (middle.afterX < end.afterX);
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
