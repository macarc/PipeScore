import { Pitch } from '../all';

type MouseOverPitch = {
  name: 'mouse over pitch',
  pitch: Pitch
}
const isMouseOverPitch = (e: BarEvent): e is MouseOverPitch => e.name === 'mouse over pitch';

type RecalculateGroups = {
  name: 'recalculate groups'
}
const isRecalculateGroups = (e: BarEvent): e is RecalculateGroups => e.name === 'recalculate groups';

type AddNoteToStart = {
  name: 'add note to start'
  pitch: Pitch
}
const isAddNoteToStart = (e: BarEvent): e is AddNoteToStart => e.name === 'add note to start';

type Changed = {
  name: 'changed'
}
const isChanged = (e: BarEvent): e is Changed => e.name === 'changed';

type BarEvent = RecalculateGroups | MouseOverPitch | AddNoteToStart | Changed;

export function dispatch(a: BarEvent) {
}
