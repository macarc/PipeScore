/*
   Copyright (C) 2020 Archie Maclean
 */
import { ID } from '../global/types';

export interface DraggedSecondTiming {
  secondTiming: SecondTimingModel,
  dragged: 'start' | 'middle' | 'end'
}

export interface SecondTimingModel {
  start: ID,
  middle: ID,
  end: ID
}

