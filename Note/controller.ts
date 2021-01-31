import { GroupNoteModel, NoteModel } from './model';
import { Pitch } from '../all';

type NoteClicked = {
  name: 'note clicked',
  note: NoteModel,
  event: MouseEvent
}
const isNoteClicked = (e: NoteEvent): e is NoteClicked => e.name === 'note clicked';

type NoteAdded = {
  name: 'note added',
  pitch: Pitch,
  index: number,
  note: GroupNoteModel
}
const isNoteAdded = (e: NoteEvent): e is NoteAdded => e.name === 'note added';

type NoteEvent = NoteClicked | NoteAdded;
export function dispatch(a: any) { }
