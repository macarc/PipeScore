/*
  Controller for documentation events
  Copyright (C) 2021 macarc
*/
import { ScoreEvent, Update } from './Controller';
import { State } from '../State';

export function hoverDoc(element: string): ScoreEvent {
  return async (state: State) => {
    state.doc.current = element;
    return Update.ViewChanged;
  };
}

export function toggleDoc(): ScoreEvent {
  return async (state: State) => {
    state.doc.show = !state.doc.show;
    return Update.ViewChanged;
  };
}
