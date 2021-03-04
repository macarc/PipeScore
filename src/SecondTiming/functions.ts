/*
   Copyright (C) 2020 Archie Maclean
 */
import { ID } from '../global/types';

import { SecondTimingModel } from './model';

const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  init
}
