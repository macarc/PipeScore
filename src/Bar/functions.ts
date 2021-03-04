/*
   Copyright (C) 2020 Archie Maclean
 */
import { genId } from '../global/utils';
import { BarModel, Barline } from './model';

import TimeSignature from '../TimeSignature/functions';

const numberOfNotes = (bar: BarModel): number => bar.notes.length;

const init = (isAnacrusis = false): BarModel => ({
  timeSignature: TimeSignature.init(),
  notes: [],
  frontBarline: Barline.Normal,
  backBarline: Barline.Normal,
  isAnacrusis,
  id: genId()
});

export default {
  init,
  numberOfNotes,
}

