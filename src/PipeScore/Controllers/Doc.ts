import { ScoreEvent, viewChanged } from './Controller';
import { State } from '../State';

export function hoverDoc(element: string): ScoreEvent {
  return async (state: State) =>
    viewChanged({ ...state, currentDocumentation: element });
}

export function toggleDoc(): ScoreEvent {
  return async (state: State) =>
    viewChanged({ ...state, showDocumentation: !state.showDocumentation });
}
