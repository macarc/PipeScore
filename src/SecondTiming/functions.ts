import { ID } from '../global/utils';

import { SecondTimingModel } from './model';

const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  init
}
