/*
   Copyright (C) 2021 Archie Maclean
 */
import { ID } from '../global/types';
import { itemBefore } from '../global/xy';

import { SecondTimingModel } from './model';

// This function checks if a second timing model is valid
// It checks that start, middle, and end are in a valid order
const isValid = (st: SecondTimingModel): boolean => itemBefore(st.start, st.middle) && (itemBefore(st.middle, st.end) || st.middle === st.end);

const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  init,
  isValid
}
