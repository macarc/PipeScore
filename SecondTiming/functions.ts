import { SecondTimingModel } from './model';
import { ID } from '../all';

export const init = (start: ID, middle: ID, end: ID): SecondTimingModel => ({
  start,
  middle,
  end
});

export default {
  init
}
