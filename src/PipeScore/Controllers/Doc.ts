/*
  Controller for documentation events
  Copyright (C) 2021 Archie Maclean
*/
import { ScoreEvent, viewChanged } from './Controller';
import { State } from '../State';

export function hoverDoc(element: string): ScoreEvent {
  return async (state: State) =>
    viewChanged({ ...state, doc: { ...state.doc, current: element } });
}

export function toggleDoc(): ScoreEvent {
  return async (state: State) =>
    viewChanged({ ...state, doc: { ...state.doc, show: !state.doc.show } });
}
