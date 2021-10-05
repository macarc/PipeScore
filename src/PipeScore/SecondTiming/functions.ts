/*
  SecondTiming methods
  Copyright (C) 2021 Archie Maclean
*/
import { ID } from '../global/id';
import { itemBefore } from '../global/xy';

import { SecondTimingModel } from './model';

// This function checks if a second timing model is valid
// It checks that start, middle, and end are in a valid order
function isValid(st: SecondTimingModel, others: SecondTimingModel[]): boolean {
  if (
    !(
      itemBefore(st.start, st.middle) &&
      (itemBefore(st.middle, st.end) || st.middle === st.end)
    )
  ) {
    return false;
  }

  for (const other of others) {
    // check for overlapping
    if (
      // Don't need to check middle, as those will be dealt with in the other clauses; however we do need to do start/end
      st.start === other.end ||
      st.end === other.start ||
      st.start === other.start ||
      st.end === other.end ||
      // If st's start is between other.start/other.end
      (itemBefore(st.start, other.end) && itemBefore(other.start, st.start)) ||
      // If other's start is between st.start/st.end
      (itemBefore(other.start, st.end) && itemBefore(st.start, other.start)) ||
      // If st's end is between other.start/other.end
      (itemBefore(st.end, other.end) && itemBefore(other.start, st.end)) ||
      // If other's end is between st.start/st.end
      (itemBefore(other.end, st.end) && itemBefore(st.start, other.end))
    ) {
      return false;
    }
  }
  return true;
}

function pointsTo(st: SecondTimingModel, id: ID) {
  return st.start === id || st.middle === id || st.end === id;
}

const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end,
});

export default {
  init,
  pointsTo,
  isValid,
};
